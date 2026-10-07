import fs from 'fs';
import path from 'path';

export interface IncomingTransaction {
  id: string;
  sender_phone: string;
  amount: number;
  transaction_id: string;
  raw_message: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  is_used: boolean;
  created_at: string;
  matched_student_id: string | null;
}

export interface DepositRequest {
  id: string;
  student_id: string;
  sender_phone: string;
  claimed_amount: number;
  status: 'PENDING_VERIFICATION' | 'COMPLETED' | 'REJECTED';
  transaction_id: string | null;
  matched_incoming_id: string | null;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  wallet_balance: number;
  created_at: string;
}

export interface WalletTransactionRecord {
  id: string;
  student_id: string;
  type: 'deposit_vodafone_cash' | 'course_purchase' | 'manual_adjustment' | 'bonus';
  amount: number;
  description: string;
  reference_id: string | null;
  created_at: string;
}

export interface DatabaseSchema {
  IncomingTransactions: IncomingTransaction[];
  DepositRequests: DepositRequest[];
  Students: Student[];
  WalletTransactions: WalletTransactionRecord[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'database.json');

const INITIAL_DB: DatabaseSchema = {
  Students: [
    {
      id: 'std-current',
      name: 'عمر شريف إبراهيم',
      email: 'omar.sherif2026@gmail.com',
      phone: '01012345678',
      wallet_balance: 300,
      created_at: new Date().toISOString()
    },
    {
      id: 'std-102',
      name: 'مريم طارق العوضي',
      email: 'mariam.tareq@gmail.com',
      phone: '01123456789',
      wallet_balance: 550,
      created_at: new Date().toISOString()
    },
    {
      id: 'std-103',
      name: 'يوسف حازم قاسم',
      email: 'youssef.hazem@gmail.com',
      phone: '01234567890',
      wallet_balance: 100,
      created_at: new Date().toISOString()
    }
  ],
  IncomingTransactions: [
    {
      id: 'tx-seed-1',
      sender_phone: '01077788990',
      amount: 250,
      transaction_id: 'VF-881240',
      raw_message: 'تم استلام مبلغ 250.00 جنيه مصري من رقم 01077788990. مصاريف الخدمة 0.00 جنيه. رقم العملية: VF-881240 بتاريخ 06/10/2026 13:45',
      status: 'PENDING',
      is_used: false,
      created_at: '2026-10-06T13:45:00.000Z',
      matched_student_id: null
    },
    {
      id: 'tx-seed-2',
      sender_phone: '01055566778',
      amount: 850,
      transaction_id: 'VF-773190',
      raw_message: 'تم استلام مبلغ 850.00 جنيه مصري من رقم 01055566778. مصاريف الخدمة 0.00 جنيه. رقم العملية: VF-773190 بتاريخ 06/10/2026 12:30',
      status: 'PENDING',
      is_used: false,
      created_at: '2026-10-06T12:30:00.000Z',
      matched_student_id: null
    }
  ],
  DepositRequests: [],
  WalletTransactions: [
    {
      id: 'wtx-seed-1',
      student_id: 'std-current',
      type: 'bonus',
      amount: 100,
      description: 'مكافأة تسجيل حساب طالب جديد وتفعيل المحفظة',
      reference_id: 'BONUS-WELCOME',
      created_at: '2026-10-01T10:30:00.000Z'
    },
    {
      id: 'wtx-seed-2',
      student_id: 'std-current',
      type: 'deposit_vodafone_cash',
      amount: 200,
      description: 'شحن رصيد محفظة عبر فودافون كاش (عملية #VF-88210)',
      reference_id: 'VF-88210',
      created_at: '2026-10-03T14:15:00.000Z'
    }
  ]
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.warn('[DB] Could not read db file, using initial data:', err);
    }

    this.saveDatabase(INITIAL_DB);
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }

  private saveDatabase(dataToSave: DatabaseSchema): void {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save database to disk:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.data[table];
  }

  public save(): void {
    this.saveDatabase(this.data);
  }

  public resetToDefault(): void {
    this.data = JSON.parse(JSON.stringify(INITIAL_DB));
    this.save();
  }
}

export const db = new DatabaseManager();
