import React from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Sparkles, X, ArrowRight, UserCheck } from 'lucide-react';

export const GuestLockModal: React.FC = () => {
  const {
    isGuestLockOpen,
    setIsGuestLockOpen,
    setIsOnboardingOpen,
    guestAttemptedTab,
  } = useApp();

  if (!isGuestLockOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md glass-light rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#91EAAF] text-center">
        {/* Close button */}
        <button
          onClick={() => setIsGuestLockOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot / Icon Badge */}
        <div className="relative mx-auto w-20 h-20 mb-4">
          <div className="absolute inset-0 rounded-full bg-[#C3E956]/40 animate-ping opacity-60" />
          <div className="relative w-20 h-20 rounded-full bg-white border-2 border-[#91EAAF] p-1 shadow-md flex items-center justify-center">
            <img
              src="/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121640_0000_12f5433f.webp"
              alt="AGRIBEE Alert"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#1F4B2C] text-[#C3E956] shadow-sm">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Modal Content */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4D7111]/10 text-[#1F4B2C] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#4D7111]" />
          Protected Agricultural Feature
        </div>

        <h3 className="text-2xl font-black text-[#1F4B2C] tracking-tight">
          Stakeholder Account Required
        </h3>

        {guestAttemptedTab && (
          <p className="mt-1 text-xs font-semibold text-[#4D7111]">
            Attempting to access: <span className="underline uppercase tracking-wide">{guestAttemptedTab}</span>
          </p>
        )}

        <p className="mt-3 text-sm text-neutral-700 leading-relaxed font-medium">
          You are currently browsing as a Guest. To access the live Marketplace, interactive GIS Map,
          Private Chat, and Multi-Agent Decision Support, please sign in or create an AGRIMATCH-NV account
          with AGRIBEE.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => {
              setIsGuestLockOpen(false);
              setIsOnboardingOpen(true);
            }}
            className="w-full py-3 px-4 rounded-full btn-sprout text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
          >
            <Sparkles className="w-4 h-4 text-[#1F4B2C]" />
            <span>Start AGRIBEE Onboarding Demo</span>
            <ArrowRight className="w-4 h-4 text-[#1F4B2C]" />
          </button>

          <button
            onClick={() => {
              setIsGuestLockOpen(false);
              setIsOnboardingOpen(true);
            }}
            className="w-full py-3 px-4 rounded-full btn-forest text-sm flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-[#C3E956]" />
            <span>Sign In / Create Account</span>
          </button>
        </div>

        <p className="mt-4 text-[11px] text-neutral-500">
          Tip: You can also explore the 25 pre-loaded stakeholder profiles in Demo Mode via the top-bar switcher.
        </p>
      </div>
    </div>
  );
};
