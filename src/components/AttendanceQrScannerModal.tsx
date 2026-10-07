import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw, 
  UserCheck, 
  MapPin, 
  Sparkles, 
  Search,
  Upload,
  Clock,
  Check,
  Smartphone
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { recordCenterAttendance, fetchAllStudentsAdmin, AttendanceRecord } from '../firebase';

interface AttendanceQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttendanceRecorded?: (record: AttendanceRecord) => void;
}

export const AttendanceQrScannerModal: React.FC<AttendanceQrScannerModalProps> = ({
  isOpen,
  onClose,
  onAttendanceRecorded
}) => {
  const [selectedCenter, setSelectedCenter] = useState('سنتر النخبة التعليمي - قاعة 1');
  const [cameraActive, setCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Manual student code lookup fallback
  const [manualCode, setManualCode] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [recentScannedList, setRecentScannedList] = useState<AttendanceRecord[]>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    if (isOpen) {
      loadStudents();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const loadStudents = async () => {
    try {
      const list = await fetchAllStudentsAdmin();
      setStudents(list);
    } catch (err) {
      console.warn('Error fetching students for scanner lookup:', err);
    }
  };

  const startCamera = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setCameraActive(true);

    try {
      // Allow slight DOM delay for element to exist
      setTimeout(async () => {
        try {
          if (!html5QrCodeRef.current) {
            html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
          }
          
          await html5QrCodeRef.current.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              handleQrCodeDetected(decodedText);
            },
            (err) => {
              // ignore frame read errors
            }
          );
        } catch (camErr: any) {
          console.warn('Camera start issue:', camErr);
          setErrorMessage('تعذر فتح الكاميرا مباشرة. يمكنك استخدام خاصية إدخال كود الطالب يدوياً أو رفع صورة الـ QR.');
          setCameraActive(false);
        }
      }, 300);
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطأ في تشغيل الكاميرا');
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop error:', err);
      }
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Web Audio fallback
    }
  };

  const handleQrCodeDetected = async (qrPayload: string) => {
    if (scanning) return;
    setScanning(true);
    setScanResult(qrPayload);

    let parsedStudentId = qrPayload.trim();
    let parsedStudentCode = '';
    let parsedStudentName = '';

    // Check if JSON payload was encoded
    try {
      if (qrPayload.startsWith('{') && qrPayload.endsWith('}')) {
        const parsed = JSON.parse(qrPayload);
        parsedStudentId = parsed.student_id || parsed.id || parsed.uid || '';
        parsedStudentCode = parsed.student_code || parsed.code || '';
        parsedStudentName = parsed.name || parsed.student_name || '';
      }
    } catch {
      // Plain text QR
    }

    // Match with student list if exists
    const matched = students.find(s => 
      s.id === parsedStudentId || 
      (s.student_code && s.student_code.toLowerCase() === parsedStudentId.toLowerCase()) ||
      (s.student_code && parsedStudentCode && s.student_code.toLowerCase() === parsedStudentCode.toLowerCase()) ||
      (s.phone && s.phone === parsedStudentId)
    );

    const studentIdToRecord = matched?.id || parsedStudentId || 'std_' + Date.now();
    const studentNameToRecord = matched?.name || parsedStudentName || 'طالب المنصة';
    const studentCodeToRecord = matched?.student_code || parsedStudentCode || parsedStudentId;

    try {
      const result = await recordCenterAttendance({
        student_id: studentIdToRecord,
        student_name: studentNameToRecord,
        student_code: studentCodeToRecord,
        center_group: selectedCenter,
        type: 'center_qr'
      });

      if (result.success && result.record) {
        playSuccessSound();
        setSuccessMessage(result.message);
        setErrorMessage(null);
        setRecentScannedList(prev => [result.record!, ...prev.filter(r => r.student_id !== result.record!.student_id)]);
        if (onAttendanceRecorded) {
          onAttendanceRecorded(result.record);
        }
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل تسجيل الحضور');
    } finally {
      setTimeout(() => {
        setScanning(false);
      }, 1800);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleQrCodeDetected(manualCode.trim());
    setManualCode('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && html5QrCodeRef.current) {
      html5QrCodeRef.current.scanFile(file, true)
        .then(decodedText => {
          handleQrCodeDetected(decodedText);
        })
        .catch(err => {
          setErrorMessage('لم يتم العثور على رمز QR صالح في الصورة المرفوعة.');
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fadeIn" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto relative text-right flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>ماسح QR Code لتسجيل حضور الطلاب في السنتر</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  مباشر
                </span>
              </h3>
              <p className="text-xs text-slate-400">امسح كود بطاقة الطالب عبر الكاميرا أو أدخل كود الطالب</p>
            </div>
          </div>

          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Center & Group Selection */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>اختر السنتر / المجموعة الحالية للحضور:</span>
            </label>
            <select
              value={selectedCenter}
              onChange={e => setSelectedCenter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
            >
              <option value="سنتر النخبة التعليمي - قاعة 1 (الصف الثالث الثانوي)">سنتر النخبة التعليمي - قاعة 1 (الصف الثالث الثانوي)</option>
              <option value="سنتر الأوائل - مجموعة الفيزياء المتقدمة (أيام السبت والثلاثاء)">سنتر الأوائل - مجموعة الفيزياء المتقدمة (أيام السبت والثلاثاء)</option>
              <option value="سنتر التميز - قاعة أ.د أحمد ممدوح (مجموعة 2)">سنتر التميز - قاعة أ.د أحمد ممدوح (مجموعة 2)</option>
              <option value="سنتر المستقبل - الدقي والمهندسين">سنتر المستقبل - الدقي والمهندسين</option>
              <option value="مجموعة VIP - المراجعة المكثفة">مجموعة VIP - المراجعة المكثفة</option>
            </select>
          </div>

          {/* Feedback Notices */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div className="font-bold">{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
              <div className="font-bold">{errorMessage}</div>
            </div>
          )}

          {/* Camera Scanner View */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>كاميرا مسح الـ QR Code:</span>
              </span>

              <div className="flex items-center gap-2">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>تشغيل الكاميرا</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>إيقاف الكاميرا</span>
                  </button>
                )}

                <label className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>مسح صورة QR</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Container for html5-qrcode video */}
            <div className={`relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 min-h-[260px] ${cameraActive ? 'border-emerald-500/50' : ''}`}>
              <div id={scannerContainerId} className="w-full max-w-sm rounded-2xl overflow-hidden" />
              
              {!cameraActive && (
                <div className="text-center space-y-3 py-6">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto shadow-inner">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-300">الكاميرا متوقفة حالياً</p>
                    <p className="text-xs text-slate-500 mt-0.5">اضغط "تشغيل الكاميرا" أعلاه لمسح كود الطالب بالهاتف أو اللابتوب</p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>بدء المسح الآن</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Manual Code Entry Option */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>أو تسجيل الحضور بكود الطالب يدوياً:</span>
            </span>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="أدخل كود الطالب (مثال: STD-782914 أو رقم الموبايل)..."
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={scanning || !manualCode.trim()}
                className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>تسجيل حضور</span>
              </button>
            </form>
          </div>

          {/* Recently Scanned in this session */}
          {recentScannedList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الطلاب المسجل حضورهم في هذه الجلسة ({recentScannedList.length}):</span>
                </span>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 divide-y divide-slate-800/80 max-h-48 overflow-y-auto">
                {recentScannedList.map((rec, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                        ✓
                      </div>
                      <div>
                        <span className="font-bold text-white block">{rec.student_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{rec.student_code} · {rec.center_group}</span>
                      </div>
                    </div>

                    <div className="text-left font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      {rec.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            يتم حفظ السجلات فوراً في Firebase Firestore ومزامنتها مع بروفايل الطالب
          </span>

          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
