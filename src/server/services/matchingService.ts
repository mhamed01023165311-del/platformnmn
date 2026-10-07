import { db, IncomingTransaction, DepositRequest, Student, WalletTransactionRecord } from '../db';
import { normalizePhoneNumber } from './smsParser';

export interface MatchResult {
  matched: boolean;
  status: 'COMPLETED' | 'PENDING_VERIFICATION';
  depositRequest: DepositRequest;
  incomingTransaction?: IncomingTransaction;
  newWalletBalance?: number;
  message: string;
}

/**
 * Checks if two amounts match with slight float tolerance (0.01 EGP)
 */
function areAmountsEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.05;
}

/**
 * 1. Match when Student submits deposit request:
 * Looks up existing IncomingTransactions where is_used = false.
 */
export function matchStudentDeposit(
  studentId: string,
  rawSenderPhone: string,
  claimedAmount: number,
  claimedTxId?: string
): MatchResult {
  const normalizedPhone = normalizePhoneNumber(rawSenderPhone);
  const now = new Date().toISOString();

  // Find student in database
  const students = db.get('Students');
  let student = students.find(s => s.id === studentId);

  // If student doesn't exist yet, create or fallback
  if (!student) {
    student = {
      id: studentId,
      name: 'طالب المنصة',
      email: `${studentId}@student.edu`,
      phone: normalizedPhone,
      wallet_balance: 0,
      created_at: now
    };
    students.push(student);
  }

  // Create initial deposit request
  const depositRequests = db.get('DepositRequests');
  const depositRequest: DepositRequest = {
    id: `dep-${Date.now()}`,
    student_id: student.id,
    sender_phone: normalizedPhone,
    claimed_amount: claimedAmount,
    status: 'PENDING_VERIFICATION',
    transaction_id: claimedTxId ? claimedTxId.trim().toUpperCase() : null,
    matched_incoming_id: null,
    created_at: now,
    updated_at: now
  };
  depositRequests.unshift(depositRequest);

  // Search for matching incoming transaction
  const incomingList = db.get('IncomingTransactions');
  const matchedIncoming = incomingList.find(incoming => {
    if (incoming.is_used || incoming.status === 'COMPLETED') {
      return false;
    }

    const phoneMatches = normalizePhoneNumber(incoming.sender_phone) === normalizedPhone;
    const amountMatches = areAmountsEqual(incoming.amount, claimedAmount);

    // If both specified a transaction ID, check if they match, otherwise phone + amount is sufficient
    const txMatches = claimedTxId && incoming.transaction_id
      ? incoming.transaction_id.toUpperCase() === claimedTxId.toUpperCase()
      : true;

    return phoneMatches && amountMatches && txMatches;
  });

  if (matchedIncoming) {
    // 1. Mark incoming transaction as COMPLETED and is_used = true
    matchedIncoming.status = 'COMPLETED';
    matchedIncoming.is_used = true;
    matchedIncoming.matched_student_id = student.id;

    // 2. Mark deposit request as COMPLETED
    depositRequest.status = 'COMPLETED';
    depositRequest.matched_incoming_id = matchedIncoming.id;
    depositRequest.updated_at = now;
    if (!depositRequest.transaction_id) {
      depositRequest.transaction_id = matchedIncoming.transaction_id;
    }

    // 3. Credit student's wallet balance
    student.wallet_balance += claimedAmount;

    // 4. Record wallet transaction
    const walletTransactions = db.get('WalletTransactions');
    const walletRecord: WalletTransactionRecord = {
      id: `wtx-${Date.now()}`,
      student_id: student.id,
      type: 'deposit_vodafone_cash',
      amount: claimedAmount,
      description: `شحن رصيد محفظة فودافون كاش - عملية #${matchedIncoming.transaction_id}`,
      reference_id: matchedIncoming.transaction_id,
      created_at: now
    };
    walletTransactions.unshift(walletRecord);

    // Save atomic changes to database
    db.save();

    return {
      matched: true,
      status: 'COMPLETED',
      depositRequest,
      incomingTransaction: matchedIncoming,
      newWalletBalance: student.wallet_balance,
      message: `تم التحقق بنجاح! تم العثور على رسالة فودافون كاش مطابقة من رقم ${normalizedPhone} وتم إضافة ${claimedAmount} ج.م إلى محفظتك فوراً.`
    };
  }

  // No match found yet
  db.save();
  return {
    matched: false,
    status: 'PENDING_VERIFICATION',
    depositRequest,
    newWalletBalance: student.wallet_balance,
    message: 'طلبك قيد المراجعة والتحقق (PENDING_VERIFICATION). سيتم إضافة الرصيد تلقائياً فور استلام رسالة الـ SMS من الشبكة.'
  };
}

/**
 * 2. Reverse Match when Vodafone Cash SMS arrives via Webhook:
 * Checks if any student already submitted a pending deposit request matching this SMS.
 */
export function matchIncomingSMSWithPendingRequests(incoming: IncomingTransaction): {
  matched: boolean;
  studentId?: string;
  depositId?: string;
} {
  if (incoming.is_used || incoming.status === 'COMPLETED') {
    return { matched: false };
  }

  const normalizedPhone = normalizePhoneNumber(incoming.sender_phone);
  const depositRequests = db.get('DepositRequests');
  const students = db.get('Students');
  const now = new Date().toISOString();

  // Find pending deposit request with matching phone and amount
  const pendingDeposit = depositRequests.find(dep => {
    if (dep.status !== 'PENDING_VERIFICATION') return false;
    const phoneMatches = normalizePhoneNumber(dep.sender_phone) === normalizedPhone;
    const amountMatches = areAmountsEqual(dep.claimed_amount, incoming.amount);
    return phoneMatches && amountMatches;
  });

  if (pendingDeposit) {
    const student = students.find(s => s.id === pendingDeposit.student_id);
    if (!student) return { matched: false };

    // 1. Update incoming transaction
    incoming.status = 'COMPLETED';
    incoming.is_used = true;
    incoming.matched_student_id = student.id;

    // 2. Update deposit request
    pendingDeposit.status = 'COMPLETED';
    pendingDeposit.matched_incoming_id = incoming.id;
    pendingDeposit.updated_at = now;
    if (!pendingDeposit.transaction_id) {
      pendingDeposit.transaction_id = incoming.transaction_id;
    }

    // 3. Credit wallet
    student.wallet_balance += pendingDeposit.claimed_amount;

    // 4. Record wallet transaction
    const walletTransactions = db.get('WalletTransactions');
    const walletRecord: WalletTransactionRecord = {
      id: `wtx-${Date.now()}`,
      student_id: student.id,
      type: 'deposit_vodafone_cash',
      amount: pendingDeposit.claimed_amount,
      description: `شحن آلي - رسالة SMS فودافون كاش #${incoming.transaction_id}`,
      reference_id: incoming.transaction_id,
      created_at: now
    };
    walletTransactions.unshift(walletRecord);

    db.save();

    return {
      matched: true,
      studentId: student.id,
      depositId: pendingDeposit.id
    };
  }

  return { matched: false };
}
