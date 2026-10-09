import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FastAverageColor } from 'fast-average-color';
import { GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';

export interface StudentIdCardProps {
  name: string;
  studentCode: string;
  grade: string;
  avatarUrl: string;
  academicYear: string;
  className?: string;
}

export const StudentIdCard: React.FC<StudentIdCardProps> = ({
  name,
  studentCode,
  grade,
  avatarUrl,
  academicYear,
  className = ''
}) => {
  const [dominantColor, setDominantColor] = useState<string>('#0d9488');
  const [rgbValues, setRgbValues] = useState<[number, number, number]>([13, 148, 136]);
  const imgRef = useRef<HTMLImageElement>(null);

  // Dynamic Theming: Extract dominant color from student avatar
  useEffect(() => {
    if (!avatarUrl) return;

    const fac = new FastAverageColor();

    fac.getColorAsync(avatarUrl, { algorithm: 'dominant' })
      .then((color) => {
        if (color && color.hex) {
          setDominantColor(color.hex);
          setRgbValues([color.value[0], color.value[1], color.value[2]]);
        }
      })
      .catch(() => {
        if (imgRef.current && imgRef.current.complete) {
          try {
            const fallback = fac.getColor(imgRef.current, { algorithm: 'dominant' });
            if (fallback && fallback.hex) {
              setDominantColor(fallback.hex);
              setRgbValues([fallback.value[0], fallback.value[1], fallback.value[2]]);
            }
          } catch {
            // Keep default elegant theme
          }
        }
      });

    return () => {
      fac.destroy();
    };
  }, [avatarUrl]);

  const [r, g, b] = rgbValues;

  return (
    <div
      dir="rtl"
      className={`relative box-border select-none overflow-hidden rounded-2xl print:rounded-xl text-white font-sans ${className}`}
      style={{
        width: '85.6mm',
        height: '54mm',
        maxWidth: '85.6mm',
        maxHeight: '54mm',
        minWidth: '85.6mm',
        minHeight: '54mm',
        background: `radial-gradient(circle at 15% 20%, rgba(${r}, ${g}, ${b}, 0.35) 0%, rgba(10, 15, 26, 0.98) 60%), linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.25) 0%, #060911 100%)`,
        border: `1.2mm solid ${dominantColor}`,
        boxShadow: `0 12px 30px -8px rgba(${r}, ${g}, ${b}, 0.45)`,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact'
      }}
    >
      {/* Luxurious Guilloche & Hologram Accents */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(${r}, ${g}, ${b}, 0.6) 1px, transparent 1px)`,
          backgroundSize: '8px 8px'
        }}
      />
      
      {/* Top Foil Banner */}
      <div
        className="absolute top-0 inset-x-0 h-[3mm] pointer-events-none opacity-85"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${dominantColor} 50%, #f59e0b 100%)`
        }}
      />

      {/* Main Two-Sided Landscape Grid */}
      <div className="relative z-10 w-full h-full p-[3.2mm] flex items-center justify-between gap-[3mm]">
        
        {/* SIDE 1: Student Photo & Dynamic Data */}
        <div className="flex-1 h-full flex flex-col justify-between pr-[1mm]">
          
          {/* Top: Student Picture + Name */}
          <div className="flex items-center gap-[2.8mm]">
            {/* Student Avatar */}
            <div
              className="relative shrink-0 w-[17.5mm] h-[17.5mm] rounded-xl overflow-hidden shadow-md bg-slate-900 border"
              style={{ borderColor: dominantColor }}
            >
              <img
                ref={imgRef}
                src={avatarUrl}
                alt={name}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback placeholder if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{
                  boxShadow: `inset 0 0 0 1px rgba(${r}, ${g}, ${b}, 0.4)`
                }}
              />
            </div>

            {/* Student Name */}
            <div className="flex-1 min-w-0">
              <span className="text-[7.5pt] text-slate-300 font-medium block leading-none mb-[0.8mm]">
                اسم الطالب
              </span>
              <h2 className="text-[11pt] font-black text-white leading-tight truncate tracking-tight drop-shadow-sm">
                {name}
              </h2>
              <div
                className="inline-flex items-center gap-[1mm] px-[2mm] py-[0.4mm] rounded-full mt-[1.2mm] text-[6.5pt] font-bold"
                style={{
                  backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
                  color: '#ffffff',
                  border: `0.5px solid rgba(${r}, ${g}, ${b}, 0.5)`
                }}
              >
                <Sparkles className="w-[2.2mm] h-[2.2mm] text-amber-300 shrink-0" />
                <span className="truncate">{grade}</span>
              </div>
            </div>
          </div>

          {/* Bottom Data Details */}
          <div className="grid grid-cols-2 gap-[1.8mm] pt-[1.5mm] border-t border-white/10 text-right">
            <div>
              <span className="text-[6.5pt] text-slate-400 block leading-none mb-[0.5mm]">
                كود الطالب
              </span>
              <span
                className="text-[9pt] font-mono font-black tracking-wider block leading-tight"
                dir="ltr"
                style={{ color: '#fbbf24' }}
              >
                {studentCode}
              </span>
            </div>

            <div>
              <span className="text-[6.5pt] text-slate-400 block leading-none mb-[0.5mm]">
                العام الدراسي
              </span>
              <span className="text-[7.5pt] font-bold text-slate-200 block leading-tight font-mono" dir="ltr">
                {academicYear}
              </span>
            </div>
          </div>
        </div>

        {/* ELEGANT VERTICAL SEPARATOR */}
        <div
          className="w-[1px] h-[85%] self-center opacity-30 rounded-full"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${dominantColor} 50%, transparent 100%)`
          }}
        />

        {/* SIDE 2: QR Code & Platform Branding */}
        <div className="shrink-0 w-[27mm] h-full flex flex-col items-center justify-between text-center pl-[1mm]">
          
          {/* Platform Identity */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-[1.2mm] mb-[0.5mm]">
              <div
                className="w-[4.8mm] h-[4.8mm] rounded-lg flex items-center justify-center text-slate-950 font-black shadow-sm"
                style={{ backgroundColor: dominantColor }}
              >
                <GraduationCap className="w-[3.2mm] h-[3.2mm] text-slate-950" />
              </div>
              <span className="text-[9.5pt] font-black text-white tracking-tight leading-none drop-shadow-sm">
                منصة الأستاذ
              </span>
            </div>
            <span className="text-[5.5pt] text-slate-400 font-medium tracking-wide">
              الاعتماد التعليمي الرسمي
            </span>
          </div>

          {/* High-Definition QR Code Container */}
          <div
            className="p-[1.4mm] bg-white rounded-xl shadow-md border flex items-center justify-center"
            style={{ borderColor: dominantColor }}
          >
            <QRCodeSVG
              value={studentCode}
              size={66}
              level="H"
              includeMargin={false}
              fgColor="#0a0f1d"
              bgColor="#ffffff"
            />
          </div>

          {/* Bottom Security Indicator */}
          <div className="flex items-center gap-[1mm] text-[6pt] text-slate-300 font-bold">
            <CheckCircle2
              className="w-[2.6mm] h-[2.6mm]"
              style={{ color: dominantColor }}
            />
            <span>رمز التحقق الرقمي</span>
          </div>
        </div>

      </div>

      {/* Bottom Security Micro-Bar */}
      <div
        className="absolute bottom-0 inset-x-0 h-[1.8mm] pointer-events-none opacity-90"
        style={{
          background: `linear-gradient(90deg, #f59e0b 0%, ${dominantColor} 50%, transparent 100%)`
        }}
      />
    </div>
  );
};
