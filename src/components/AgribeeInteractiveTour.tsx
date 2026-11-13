import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Database,
  Users,
  ShieldCheck,
  TrendingUp,
  CloudRain,
  Radio,
  ShoppingBag,
  Cpu,
} from 'lucide-react';

export const AgribeeInteractiveTour: React.FC = () => {
  const {
    isInteractiveTourActive,
    currentTourStep,
    setCurrentTourStep,
    skipTour,
    setEnvironmentMode,
    switchDemoRole,
    navigateToTabWithGuard,
    setIsOnboardingOpen,
  } = useApp();

  if (!isInteractiveTourActive) return null;

  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to AGRIMATCH-NV!',
      badge: 'Interactive AI Tour · Step 1/6',
      mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121757_0000_ec40164d.webp',
      content:
        'Bzz! I\'m AGRIBEE, your virtual agricultural companion. AGRIMATCH-NV is built on our core principle: "Connecting Agriculture, Empowering Communities, and Growing Opportunities through Intelligent Technology."',
      highlightTitle: 'Nueva Vizcaya Agricultural Intelligence',
      highlightDetail:
        'Connecting 15 municipal crop hubs with direct farmer-to-buyer matching, real-time NVAT Bambang commodity price extraction, and live DOST-PAGASA microclimate monitoring.',
      actionLabel: 'Next: Explore Dual Environments',
    },
    {
      id: 'environments',
      title: 'Dual Operating Environments: Demo vs. Live',
      badge: 'Architectural Isolation · Step 2/6',
      mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121637_0000_5f169ef9.webp',
      content:
        'To prevent research defenses and test presentations from mixing with real farm trading, AGRIMATCH-NV enforces strict dual-environment isolation.',
      highlightTitle: 'Demo Sandbox vs. Live Production',
      highlightDetail:
        '• DEMO MODE: Zero login required. Test instantly as Farmer, Supplier, Buyer, Cooperative, or Master Admin with 25 pre-populated accounts.\n• LIVE MODE: Production environment enforcing real authentication, live SQL ledgers, and verified marketplace dispatches.',
      actionLabel: 'Next: 5-Agent Intelligence',
    },
    {
      id: 'agents',
      title: 'Autonomous 5-Agent Multi-Agent Mesh',
      badge: 'Multi-Agent Framework · Step 3/6',
      mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121834_0000_85d9f953.webp',
      content:
        'Our Gemini-powered multi-agent architecture coordinates agricultural logistics in real time without human intervention delay.',
      highlightTitle: 'Dedicated Specialized Agents',
      highlightDetail:
        '• Farmer Agent: Advises on planting & harvest schedules\n• Supplier Agent: Haversine route & cold-chain optimization\n• Buyer Agent: Smart match & bulk inquiry dispatch\n• Market Agent: Real-time supply-demand price balancing\n• Admin Agent: NLP commodity bulletin extraction & audit logging',
      actionLabel: 'Next: Verified Marketplace',
    },
    {
      id: 'marketplace',
      title: 'Verified Marketplace & Quality Screening',
      badge: 'Protected Commerce · Step 4/6',
      mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121743_0000_c74c3479.webp',
      content:
        'Every harvest listing includes photo/video authentication, Grade A quality ratings, and farmgate pricing.',
      highlightTitle: 'Master Admin Moderation & Escrow',
      highlightDetail:
        'Submissions enter a mandatory review queue. Verified listings receive boosted marketplace ranking, while suspicious listings incur strikes (3 strikes = suspension). Trades use our atomic Dual-Handshake confirmation.',
      actionLabel: 'Next: NVAT Commodity Intelligence',
    },
    {
      id: 'nvat-hub',
      title: 'NVAT Commodity Extraction & Community',
      badge: 'Human-in-the-Loop AI · Step 5/6',
      mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121708_0000_9bfb5a28.webp',
      content:
        'Direct connection to Bambang Nueva Vizcaya Agricultural Terminal (NVAT) trading posts.',
      highlightTitle: 'AI-Assisted Price Extraction',
      highlightDetail:
        'Admins ingest PDF, photo bulletins, or CSV reports. The AI extracts commodity names, price ranges, units, and tags Confirmed vs Estimated prices. Admin reviews side-by-side before publishing live to the community feed.',
      actionLabel: 'Next: Weather & Microclimate',
    },
    {
      id: 'weather',
      title: 'DOST-PAGASA Feeds & 60-Day AI Predictor',
      badge: 'Microclimate Telemetry · Step 6/6',
      mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121731_0000_3693cdfa.webp',
      content:
        'Live weather radar from DOST-PAGASA Bayombong & Bambang agromet telemetry combined with hyper-local AI forecasting.',
      highlightTitle: 'Barangay-Level 1 to 2 Month Outlook',
      highlightDetail:
        'Select any of Nueva Vizcaya\'s 15 municipalities and barangays to view 8-week predictive rainfall probabilities, temperature ranges, and automated agronomic advisories for highland crops.',
      actionLabel: 'Finish Tour & Get Started',
    },
  ];

  const current = tourSteps[currentTourStep] || tourSteps[0];
  const isLast = currentTourStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      skipTour();
      setEnvironmentMode('demo');
      navigateToTabWithGuard('dashboard');
    } else {
      setCurrentTourStep(currentTourStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(currentTourStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="relative w-full max-w-xl glass-light rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#91EAAF] space-y-5">
        {/* Close / Skip button */}
        <button
          onClick={skipTour}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          title="Skip Guided Tour"
          aria-label="Skip Guided Tour"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot + Header Row */}
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white p-1.5 border-2 border-[#C3E956] shadow-lg shrink-0 animate-float-logo">
            <img
              src={current.mascot}
              alt="AGRIBEE"
              className="w-full h-full object-contain"
            />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              AI
            </span>
          </div>

          <div className="space-y-1">
            <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956]">
              {current.badge}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#1F4B2C] tracking-tight leading-snug">
              {current.title}
            </h3>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              {current.content}
            </p>
          </div>
        </div>

        {/* Highlight Callout Box */}
        <div className="p-4 rounded-2xl bg-white/90 border border-[#91EAAF] shadow-xs space-y-1.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#4D7111] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4D7111]" />
            {current.highlightTitle}
          </h4>
          <p className="text-xs text-neutral-700 leading-relaxed font-medium whitespace-pre-line">
            {current.highlightDetail}
          </p>
        </div>

        {/* Quick Demo Triggers on Final Step */}
        {isLast && (
          <div className="p-3.5 rounded-2xl bg-[#C3E956]/20 border border-[#91EAAF] space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1F4B2C] block">
              Quick Role Selection for Demo Defense:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                onClick={() => {
                  setEnvironmentMode('demo');
                  switchDemoRole('Farmer');
                  skipTour();
                  navigateToTabWithGuard('dashboard');
                }}
                className="py-1.5 px-2 rounded-xl bg-white text-[#1F4B2C] border border-[#91EAAF] text-[11px] font-bold hover:bg-[#C3E956]/40"
              >
                👨‍🌾 Farmer
              </button>
              <button
                onClick={() => {
                  setEnvironmentMode('demo');
                  switchDemoRole('Buyer');
                  skipTour();
                  navigateToTabWithGuard('marketplace');
                }}
                className="py-1.5 px-2 rounded-xl bg-white text-[#1F4B2C] border border-[#91EAAF] text-[11px] font-bold hover:bg-[#C3E956]/40"
              >
                🛒 Buyer
              </button>
              <button
                onClick={() => {
                  setEnvironmentMode('demo');
                  switchDemoRole('Cooperative');
                  skipTour();
                  navigateToTabWithGuard('dashboard');
                }}
                className="py-1.5 px-2 rounded-xl bg-white text-[#1F4B2C] border border-[#91EAAF] text-[11px] font-bold hover:bg-[#C3E956]/40"
              >
                🏢 Cooperative
              </button>
              <button
                onClick={() => {
                  setEnvironmentMode('demo');
                  switchDemoRole('MASTER_ADMIN');
                  skipTour();
                  navigateToTabWithGuard('admin');
                }}
                className="py-1.5 px-2 rounded-xl bg-[#1F4B2C] text-[#C3E956] text-[11px] font-bold hover:bg-[#285d39]"
              >
                🛡️ Master Admin
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {tourSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTourStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentTourStep ? 'w-6 bg-[#1F4B2C]' : 'w-2 bg-neutral-300'
                }`}
                aria-label={`Jump to tour step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={skipTour}
              className="px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800"
            >
              Skip Tour
            </button>

            {currentTourStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl btn-forest text-xs font-black flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-4 h-4 text-[#C3E956]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
