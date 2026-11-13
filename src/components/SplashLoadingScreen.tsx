import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface SplashLoadingScreenProps {
  onComplete: () => void;
}

export const SplashLoadingScreen: React.FC<SplashLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      onComplete();
      return;
    }

    const duration = 2000;
    const intervalTime = 30;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 180);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white select-none px-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <img
          src="/assets/aistudio/file_00000000a6a88211ad396021f72960aa_68229cce.png"
          alt="AgriMatch NV"
          className="w-full max-w-sm h-auto object-contain"
        />

        <div className="w-56 sm:w-64 space-y-2">
          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1F4B2C] via-[#4D7111] to-[#91EAAF] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-[11px] font-bold tracking-widest uppercase text-[#1F4B2C]/70">
            Loading {Math.round(progress)}%
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="absolute bottom-6 right-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-xs font-bold text-[#1F4B2C] hover:bg-neutral-100 transition-colors"
        aria-label="Skip loading"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

