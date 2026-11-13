import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
} from 'lucide-react';

interface TourStepConfig {
  id: string;
  targetTab: string;
  title: string;
  badge: string;
  mascot: string;
  content: string;
  highlightTitle: string;
  highlightDetail: string;
  actionLabel: string;
}

const TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'welcome',
    targetTab: 'public-landing',
    title: 'Welcome to AGRIMATCH-NV!',
    badge: 'Live Tour · Step 1/6',
    mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121757_0000_ec40164d.webp',
    content:
      "I'm AGRIBEE! Watch how AGRIMATCH-NV connects farmers, suppliers, buyers, cooperatives, and agricultural offices across Nueva Vizcaya.",
    highlightTitle: 'Currently Demonstrating: Public Gateway',
    highlightDetail:
      'Review live telemetry counters, PAGASA station weather, 1–2 month AI climate forecasts, and research videos before entering the workspace.',
    actionLabel: 'Next: Live Dashboard',
  },
  {
    id: 'dashboard',
    targetTab: 'dashboard',
    title: 'Executive Command Dashboard',
    badge: 'Live Tour · Step 2/6',
    mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121637_0000_5f169ef9.webp',
    content:
      'We have traveled to your Command Dashboard! Notice real-time order metrics, municipal climate indicators, and role context.',
    highlightTitle: 'Currently Demonstrating: KPI Telemetry',
    highlightDetail:
      'Tracks traded volume (kg), active inquiries, escrow value, and dual-handshake settlements across all 15 municipalities.',
    actionLabel: 'Next: GIS Boundary Map',
  },
  {
    id: 'gis',
    targetTab: 'gis',
    title: 'Nueva Vizcaya GIS & Routing',
    badge: 'Live Tour · Step 3/6',
    mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121743_0000_c74c3479.webp',
    content:
      'Now showing the Google Maps GIS interface with Nueva Vizcaya municipal boundaries and distance filters.',
    highlightTitle: 'Currently Demonstrating: Geospatial Routing',
    highlightDetail:
      'Filter crop hubs by 10m–100km radius, click municipal polygons, and compute highway driving time to NVAT Bambang.',
    actionLabel: 'Next: Verified Marketplace',
  },
  {
    id: 'marketplace',
    targetTab: 'marketplace',
    title: 'Verified Marketplace & Buyer Match',
    badge: 'Live Tour · Step 4/6',
    mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121708_0000_9bfb5a28.webp',
    content:
      'Explore the live Marketplace! Use the Buyer Need Finder at the top to match Top 3 suppliers, view ETAs, and check NVAT prices.',
    highlightTitle: 'Currently Demonstrating: Buyer Match & ETA',
    highlightDetail:
      'Every card shows Admin verification, AI vision grading, expected delivery ETA, and direct order negotiation.',
    actionLabel: 'Next: Community & NVAT',
  },
  {
    id: 'community',
    targetTab: 'community',
    title: 'Community Wall & NVAT Archive',
    badge: 'Live Tour · Step 5/6',
    mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121731_0000_3693cdfa.webp',
    content:
      'Now on the Community Hub! React with Heart, Wow, Sad, Care, or Angry, tap any profile to buy their crops, or browse past NVAT dates.',
    highlightTitle: 'Currently Demonstrating: Reactions & Archive',
    highlightDetail:
      'Tap any producer name to view their posted commodities and jump straight to Marketplace, or open NVAT Bulletins for historical dates.',
    actionLabel: 'Next: Multi-Agent AI Hub',
  },
  {
    id: 'agents',
    targetTab: 'decision-support',
    title: '5-Agent AI Suite (Role-Secured)',
    badge: 'Live Tour · Step 6/6',
    mascot: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121834_0000_85d9f953.webp',
    content:
      'Welcome to the AI Agents Hub! Farmer, Buyer, Supplier, Market, and Admin agents collaborate based on your active stakeholder role.',
    highlightTitle: 'Currently Demonstrating: Multi-Agent Mesh',
    highlightDetail:
      'Inspect municipal supply pie charts, market search grounding links, demand forecasts, and real-time agent JSON packets.',
    actionLabel: 'Finish Live Tour',
  },
];

export const AgribeeInteractiveTour: React.FC = () => {
  const {
    isInteractiveTourActive,
    currentTourStep,
    setCurrentTourStep,
    skipTour,
    setEnvironmentMode,
    switchDemoRole,
    setActiveTab,
    currentUser,
  } = useApp();

  const current = TOUR_STEPS[currentTourStep] || TOUR_STEPS[0];
  const isLast = currentTourStep === TOUR_STEPS.length - 1;

  // Automatically travel to the highlighted feature tab while demonstrating on the side
  useEffect(() => {
    if (!isInteractiveTourActive) return;
    const stepCfg = TOUR_STEPS[currentTourStep];
    if (!stepCfg) return;
    if (stepCfg.targetTab !== 'public-landing') {
      setEnvironmentMode('demo');
    }
    setActiveTab(stepCfg.targetTab);
  }, [isInteractiveTourActive, currentTourStep, setActiveTab, setEnvironmentMode]);

  if (!isInteractiveTourActive) return null;

  const handleNext = () => {
    if (isLast) {
      skipTour();
      setEnvironmentMode('demo');
      setActiveTab('dashboard');
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
    <aside
      aria-label="AGRIBEE Side-Docked Traveling Guide"
      className="fixed z-40 right-3 sm:right-5 top-20 bottom-24 w-[calc(100vw-1.5rem)] sm:w-88 max-w-sm flex flex-col justify-between glass-light rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-[#4D7111] pointer-events-auto animate-fade-in text-left overflow-y-auto"
    >
      <div className="space-y-3.5">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#91EAAF]/60">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956]">
            <Compass className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{current.badge}</span>
          </div>

          <button
            onClick={skipTour}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
            title="Skip Guided Tour"
            aria-label="Close AGRIBEE side guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mascot + Title */}
        <div className="flex items-start gap-3">
          <div className="relative w-14 h-14 rounded-full bg-white p-1 border-2 border-[#C3E956] shadow-md shrink-0 animate-float-logo">
            <img
              src={current.mascot}
              alt="AGRIBEE"
              className="w-full h-full object-contain"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1F4B2C] text-[#C3E956] text-[9px] font-black rounded-full flex items-center justify-center border border-white">
              AI
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-black text-[#1F4B2C] tracking-tight leading-snug">
              {current.title}
            </h3>
            <p className="text-[11px] text-neutral-600 font-medium leading-relaxed mt-1">
              {current.content}
            </p>
          </div>
        </div>

        {/* Highlight Box */}
        <div className="p-3.5 rounded-2xl bg-white/95 border border-[#91EAAF] shadow-xs space-y-1.5">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-[#4D7111] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4D7111] shrink-0" />
            <span>{current.highlightTitle}</span>
          </h4>
          <p className="text-[11px] text-neutral-700 leading-relaxed font-medium">
            {current.highlightDetail}
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-[#1F4B2C]">
            <span>Active View:</span>
            <span className="px-2 py-0.5 rounded-full bg-[#C3E956]/50 uppercase font-mono">
              {current.targetTab}
            </span>
          </div>
        </div>

        {/* Role preview switcher (safe demo roles only — no Master Admin bypass) */}
        {isLast && (
          <div className="p-3 rounded-2xl bg-[#C3E956]/20 border border-[#91EAAF] space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1F4B2C] block">
              Continue Exploring as Demo Role:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setEnvironmentMode('demo');
                  switchDemoRole('Farmer');
                  skipTour();
                  setActiveTab('dashboard');
                }}
                className="py-1.5 px-2 rounded-xl bg-white text-[#1F4B2C] border border-[#91EAAF] text-[11px] font-bold hover:bg-[#C3E956]/40"
              >
                Farmer
              </button>
              <button
                onClick={() => {
                  setEnvironmentMode('demo');
                  switchDemoRole('Buyer');
                  skipTour();
                  setActiveTab('marketplace');
                }}
                className="py-1.5 px-2 rounded-xl bg-white text-[#1F4B2C] border border-[#91EAAF] text-[11px] font-bold hover:bg-[#C3E956]/40"
              >
                Buyer
              </button>
              <button
                onClick={() => {
                  setEnvironmentMode('demo');
                  switchDemoRole('Supplier');
                  skipTour();
                  setActiveTab('marketplace');
                }}
                className="py-1.5 px-2 rounded-xl bg-white text-[#1F4B2C] border border-[#91EAAF] text-[11px] font-bold hover:bg-[#C3E956]/40"
              >
                Supplier
              </button>
              <button
                onClick={() => {
                  setEnvironmentMode('demo');
                  switchDemoRole('Cooperative');
                  skipTour();
                  setActiveTab('dashboard');
                }}
                className="py-1.5 px-2 rounded-xl bg-white text-[#1F4B2C] border border-[#91EAAF] text-[11px] font-bold hover:bg-[#C3E956]/40"
              >
                Cooperative
              </button>
            </div>
            {currentUser && (
              <p className="text-[10px] text-neutral-500">
                Active session: <strong className="text-[#1F4B2C]">{currentUser.role}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="pt-3 mt-3 border-t border-neutral-200 space-y-2.5">
        <div className="flex items-center justify-center gap-1.5">
          {TOUR_STEPS.map((st, i) => (
            <button
              key={st.id}
              onClick={() => setCurrentTourStep(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentTourStep ? 'w-6 bg-[#1F4B2C]' : 'w-2 bg-neutral-300'
              }`}
              aria-label={`Jump to tour step ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={skipTour}
            className="px-2.5 py-2 text-[11px] font-semibold text-neutral-500 hover:text-neutral-800"
          >
            Skip
          </button>

          <div className="flex items-center gap-1.5">
            {currentTourStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl border border-neutral-300 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-3.5 py-2 rounded-xl btn-forest text-[11px] font-black flex items-center gap-1 shadow-md"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C3E956]" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
