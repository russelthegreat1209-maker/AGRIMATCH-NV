import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface SplashLoadingScreenProps {
  onComplete: () => void;
}

export const SplashLoadingScreen: React.FC<SplashLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  // Check ?autostart=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      onComplete();
      return;
    }

    const duration = 2800; // 2.8 seconds
    const intervalTime = 35;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 200);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Status message based on percentage
  let statusMessage = 'Initializing AGRIMATCH-NV Core Intelligence System...';
  if (progress > 35 && progress <= 70) {
    statusMessage = 'Connecting PAGASA Weather Telemetry & NVAT Market Feeds...';
  } else if (progress > 70) {
    statusMessage = 'Activating Multi-Agent AI Framework & GIS Spatial Engine...';
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFFFFF] via-[#F4FFFC] to-[#E8F8F0] overflow-hidden select-none px-4">
      {/* Background ambient decorative rings */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#91EAAF]/20 to-[#C3E956]/20 blur-3xl pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-[#1F4B2C]/5 blur-2xl pointer-events-none" />

      {/* Center animated logo stage */}
      <div className="relative flex flex-col items-center">
        {/* Concentric pulsing rings */}
        <div className="absolute -inset-10 rounded-full border border-[#91EAAF]/40 animate-ping opacity-30 pointer-events-none" />
        <div className="absolute -inset-6 rounded-full border-2 border-[#C3E956]/50 animate-pulse pointer-events-none" />
        <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#91EAAF]/30 to-[#C3E956]/30 blur-md pointer-events-none" />

        {/* Logo container */}
        <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-white p-3 shadow-2xl border-4 border-[#91EAAF]/50 flex items-center justify-center animate-float-logo">
          <img
            src="/assets/aistudio/file_000000000e5c8209a20727869a247797_07ecb429.jpg"
            alt="AGRIMATCH-NV Symbol"
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        {/* Brand Banner Title */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4D7111]/10 border border-[#91EAAF] text-[#1F4B2C] text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#4D7111]" />
            Nueva Vizcaya Agricultural Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1F4B2C]">
            AGRIMATCH<span className="text-[#4D7111]">-NV</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto mt-1 font-medium">
            Adaptive Geospatial and Resilient Intelligence for Multi-Agent Tracking in Crop Hubs Across Nueva Vizcaya
          </p>
        </div>

        {/* Glassmorphic progress bar */}
        <div className="w-72 sm:w-96 mt-8 glass-light p-3 rounded-2xl shadow-lg border border-[#91EAAF]/70">
          <div className="flex justify-between items-center text-xs font-semibold text-[#1F4B2C] mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C3E956] animate-ping" />
              Loading System
            </span>
            <span className="font-mono text-[#4D7111]">{Math.round(progress)}%</span>
          </div>

          {/* Progress bar track */}
          <div className="h-3 w-full bg-neutral-200/80 rounded-full overflow-hidden p-0.5 border border-[#91EAAF]/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1F4B2C] via-[#4D7111] to-[#C3E956] transition-all duration-100 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dynamic status message */}
          <p className="mt-2 text-center text-[11px] font-medium text-[#1F4B2C]/80 tracking-tight animate-fade-in">
            {statusMessage}
          </p>
        </div>

        {/* Security badge note */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4D7111]" />
          <span>Encrypted Dual-Mode Architecture • ISO/IEC 25010 Verified</span>
        </div>
      </div>

      {/* Skip Intro button */}
      <button
        onClick={onComplete}
        className="absolute bottom-6 right-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-light text-xs font-bold text-[#1F4B2C] hover:bg-white hover:shadow-md transition-all border border-[#91EAAF]"
        aria-label="Skip introduction animation"
      >
        <span>Skip Intro</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
