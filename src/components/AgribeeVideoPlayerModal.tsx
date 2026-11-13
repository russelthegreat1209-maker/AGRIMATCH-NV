import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AgribeeVideoId } from '../types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  UserPlus,
  ShoppingBag,
  Package,
  MessageSquare,
  MapPin,
  Sparkles,
  Video,
} from 'lucide-react';

export interface VideoScene {
  stepNumber: number;
  title: string;
  caption: string;
  visualBadge: string;
  visualPoints: string[];
  accentColor: string;
}

export interface AgribeeVideoConfig {
  id: AgribeeVideoId;
  badge: string;
  title: string;
  shortSubtitle: string;
  durationLabel: string;
  nextVideoId?: AgribeeVideoId;
  nextActionLabel?: string;
  scenes: VideoScene[];
}

export const AGRIBEE_VIDEOS: Record<AgribeeVideoId, AgribeeVideoConfig> = {
  welcome: {
    id: 'welcome',
    badge: 'VIDEO 1 OF 4 • WELCOME & PURPOSE',
    title: 'Welcome to AgriMatch NV & How to Log In',
    shortSubtitle: 'Direct farm-to-buyer trading for Nueva Vizcaya — simple, clear, and fast.',
    durationLabel: '0:45',
    nextVideoId: 'register-guide',
    nextActionLabel: 'Join Me Now & Create Account',
    scenes: [
      {
        stepNumber: 1,
        title: 'What is AgriMatch NV?',
        caption:
          'Hello! I am AgriBee. AgriMatch NV connects Nueva Vizcaya farmers directly with buyers so harvests sell faster at fair prices.',
        visualBadge: 'DIRECT FARM-TO-BUYER',
        visualPoints: [
          'Check live eNVAT crop prices every day',
          'Sell harvests directly without middlemen',
          'Read official Department of Agriculture (da.gov.ph) news',
        ],
        accentColor: '#1F4B2C',
      },
      {
        stepNumber: 2,
        title: 'Why Must You Log In First?',
        caption:
          'To protect farmers and buyers from fake posts, all workspace menus unlock only after you log in or register.',
        visualBadge: 'SAFE & VERIFIED',
        visualPoints: [
          'Tap Log In or Register at the top right',
          'Use your Google Gmail or Philippine Phone Number',
          'Unlock the left-side menu for Market, Map, Messages & Orders',
        ],
        accentColor: '#4D7111',
      },
      {
        stepNumber: 3,
        title: 'Join Me Now & Create Your Account!',
        caption:
          'Tap "Join Me Now & Create Account" below. I will open the registration screen and guide you with Video 2!',
        visualBadge: 'START IN 1 TAP',
        visualPoints: [
          'Step 1: Tap Join Me Now & Create Account',
          'Step 2: Pick Farmer, Buyer, Supplier, or Cooperative',
          'Step 3: Enter the Main Dashboard right away!',
        ],
        accentColor: '#1F4B2C',
      },
    ],
  },
  'register-guide': {
    id: 'register-guide',
    badge: 'VIDEO 2 OF 4 • ACCOUNT GUIDE',
    title: 'How to Create Your Account',
    shortSubtitle: 'Sign in with Gmail or Phone Number and choose your role in 3 easy steps.',
    durationLabel: '0:40',
    nextVideoId: 'congrats-dashboard',
    nextActionLabel: 'Finish Registration',
    scenes: [
      {
        stepNumber: 1,
        title: 'Choose Gmail or Phone Number',
        caption:
          'You can sign in with one tap using Google Gmail, or enter your +63 mobile phone number to get a 6-digit code.',
        visualBadge: 'EASY SIGN-IN',
        visualPoints: [
          'Option A: One-tap Sign In with Google Gmail',
          'Option B: Enter +63 Phone Number for SMS OTP code',
          'Option C: Select a verified stakeholder profile to test',
        ],
        accentColor: '#1F4B2C',
      },
      {
        stepNumber: 2,
        title: 'Pick Your Role & Municipality',
        caption:
          'Select if you are a Farmer, Buyer, Supplier, Cooperative, or Government officer, and choose your town in Nueva Vizcaya.',
        visualBadge: '15 MUNICIPALITIES',
        visualPoints: [
          'Farmer / Supplier: Post crops, manage Inventory & Supply Monitoring',
          'Buyer: Get smart crop recommendations & highlight Orders',
          'Government: Compile municipal inventory & trend reports',
        ],
        accentColor: '#4D7111',
      },
      {
        stepNumber: 3,
        title: 'Tap Create Account to Enter!',
        caption:
          'Once you submit, your account is saved in our real-time database and we will celebrate on your new Dashboard!',
        visualBadge: 'REAL-TIME DATABASE',
        visualPoints: [
          'Connected to Cloud SQL & Firebase Auth',
          'Instant access to all left-sidebar tools',
          'Ready for Video 3 on the Dashboard!',
        ],
        accentColor: '#1F4B2C',
      },
    ],
  },
  'congrats-dashboard': {
    id: 'congrats-dashboard',
    badge: 'VIDEO 3 OF 4 • CONGRATULATIONS!',
    title: 'Congrats! Welcome to Your AgriMatch NV Dashboard',
    shortSubtitle: 'Your account is active! Here is how to use the left menu like Google Gemini.',
    durationLabel: '0:50',
    nextVideoId: 'market-guide',
    nextActionLabel: 'Watch Feature Demo: Marketplace',
    scenes: [
      {
        stepNumber: 1,
        title: 'Congratulations on Creating Your Account!',
        caption:
          'Welcome inside AgriMatch NV! Everything you need is neatly organized in the left sidebar — works on phone, tablet, and laptop.',
        visualBadge: 'ACCOUNT ACTIVE',
        visualPoints: [
          'All buttons are on the left side for easy reach',
          'Switch between Light Mode and Dark Mode anytime',
          'Simple words everywhere — no confusing terms',
        ],
        accentColor: '#1F4B2C',
      },
      {
        stepNumber: 2,
        title: 'Your Role-Tailored Left Menu',
        caption:
          'Click Market to buy or sell crops, Inventory & Supply Monitoring to track stocks, or Messages & Orders to complete trades.',
        visualBadge: 'LEFT SIDEBAR GUIDE',
        visualPoints: [
          'Market: Browse 24+ fresh harvests or post your crop',
          'Inventory & Supply Monitoring: Track kg stocks & demand trends',
          'Messages & Orders: Chat 1-on-1 and confirm deliveries',
        ],
        accentColor: '#4D7111',
      },
      {
        stepNumber: 3,
        title: 'Watch Feature Demos Anytime',
        caption:
          'Click any feature video below to see how Marketplace, Inventory & Supply Monitoring, Messages & Orders, and Farm Map work!',
        visualBadge: 'FEATURE WALKTHROUGHS',
        visualPoints: [
          'Embedded AI helps Buyers & Farmers automatically',
          'Official da.gov.ph news updates automatically with photos',
          'Click next to watch the Marketplace demo!',
        ],
        accentColor: '#1F4B2C',
      },
    ],
  },
  'market-guide': {
    id: 'market-guide',
    badge: 'FEATURE DEMO • MARKETPLACE',
    title: 'How to Buy & Sell Crops in the Marketplace',
    shortSubtitle: 'Embedded AI recommends crops for Buyers and grades harvests for Farmers.',
    durationLabel: '0:40',
    nextVideoId: 'inventory-monitoring',
    nextActionLabel: 'Next Demo: Inventory & Supply Monitoring',
    scenes: [
      {
        stepNumber: 1,
        title: 'For Buyers: Embedded AI Recommendations',
        caption:
          'When you open the Market as a Buyer, the system automatically highlights the best-value verified crops and lets you order in 1 tap.',
        visualBadge: 'BUYER AI BUILT-IN',
        visualPoints: [
          'Filter by Vegetable, Fruit, Rice, Citrus, or Root Crops',
          'Compare farm price vs. eNVAT prevailing price',
          'Tap "Order / Inquire" to message the farmer directly',
        ],
        accentColor: '#1F4B2C',
      },
      {
        stepNumber: 2,
        title: 'For Farmers & Suppliers: Post Harvest with AI',
        caption:
          'Tap "+ Post Crop", upload your harvest photo, and the built-in AI checks freshness and suggests fair pricing automatically.',
        visualBadge: 'FARMER AI BUILT-IN',
        visualPoints: [
          'Upload photo from your phone camera',
          'AI grades quality (Grade A) automatically',
          'Appears live for all buyers in Nueva Vizcaya',
        ],
        accentColor: '#4D7111',
      },
    ],
  },
  'inventory-monitoring': {
    id: 'inventory-monitoring',
    badge: 'FEATURE DEMO • INVENTORY & SUPPLY',
    title: 'Inventory & AI Supply Monitoring',
    shortSubtitle: 'Manage your own crop stock and see what crops are in high demand right now.',
    durationLabel: '0:45',
    nextVideoId: 'messages-orders',
    nextActionLabel: 'Next Demo: Messages & Orders',
    scenes: [
      {
        stepNumber: 1,
        title: 'My Inventory: Update Your Crop Stocks',
        caption:
          'Farmers and Suppliers have a dedicated Inventory button on the left to adjust remaining kilograms and price per kg anytime.',
        visualBadge: 'MY INVENTORY',
        visualPoints: [
          'See all your active and pending crop listings',
          'Update available kg with + / - buttons or exact numbers',
          'Automatically updates when an order is completed',
        ],
        accentColor: '#1F4B2C',
      },
      {
        stepNumber: 2,
        title: 'Supply Monitoring: Compiled by Account + AI Trends',
        caption:
          'Supply Monitoring compiles marketplace supplies by each farmer account and uses AI to show which crops are high in demand.',
        visualBadge: 'AI DEMAND TRENDS',
        visualPoints: [
          'See total stock (kg) posted by each farmer & supplier',
          'AI calculates which commodities buyers need most right now',
          'Handles 1,000+ accounts and 4,000+ supply posts smoothly',
        ],
        accentColor: '#4D7111',
      },
    ],
  },
  'messages-orders': {
    id: 'messages-orders',
    badge: 'FEATURE DEMO • MESSAGES & ORDERS',
    title: 'Messages, Orders & 2-Step Handshake',
    shortSubtitle: 'Chat directly and confirm Sent + Received so every trade is recorded.',
    durationLabel: '0:40',
    nextVideoId: 'gis-map',
    nextActionLabel: 'Next Demo: Farm & Road Map',
    scenes: [
      {
        stepNumber: 1,
        title: 'Direct Chat When User 1 Contacts User 2',
        caption:
          'When a Buyer contacts a Farmer, a real-time chat thread opens immediately with the order card pinned inside.',
        visualBadge: 'REAL-TIME CHAT',
        visualPoints: [
          'Send messages and share farm pickup locations',
          'Orders & Transactions button is highlighted for Buyers',
          'All messages are stored in the live database',
        ],
        accentColor: '#1F4B2C',
      },
      {
        stepNumber: 2,
        title: 'Simple 2-Step Order Completion',
        caption:
          'Seller taps "Mark Order Sent" and Buyer taps "Mark Order Received". Once both tap, inventory deducts automatically!',
        visualBadge: 'DUAL HANDSHAKE',
        visualPoints: [
          'Step 1: Farmer confirms crop is dispatched',
          'Step 2: Buyer confirms harvest arrived safely',
          'Stock and trade counters update automatically',
        ],
        accentColor: '#4D7111',
      },
    ],
  },
  'gis-map': {
    id: 'gis-map',
    badge: 'FEATURE DEMO • FARM & ROAD MAP',
    title: 'Interactive Farm & Road Map',
    shortSubtitle: 'Locate verified farms and delivery routes across all 15 Nueva Vizcaya towns.',
    durationLabel: '0:35',
    scenes: [
      {
        stepNumber: 1,
        title: 'See Every Farm Pin on the Map',
        caption:
          'Tap any green pin to see the farmer name, crop photo, available kilograms, and road distance to NVAT Bambang.',
        visualBadge: '15 MUNICIPALITIES',
        visualPoints: [
          'Filter by town (Kayapa, Bambang, Solano, Bagabag & more)',
          'Check travel time and delivery route',
          'Order directly from the map pin card',
        ],
        accentColor: '#1F4B2C',
      },
    ],
  },
};

export const AgribeeInlineVideoPlayer: React.FC<{
  videoId: AgribeeVideoId;
  onPrimaryAction?: () => void;
  compact?: boolean;
}> = ({ videoId, onPrimaryAction, compact = false }) => {
  const config = AGRIBEE_VIDEOS[videoId] || AGRIBEE_VIDEOS.welcome;
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  const currentScene = config.scenes[sceneIndex] || config.scenes[0];

  useEffect(() => {
    setSceneIndex(0);
  }, [videoId]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % config.scenes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPlaying, config.scenes.length]);

  useEffect(() => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(
        `${currentScene.title}. ${currentScene.caption}`
      );
      utter.rate = 0.98;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore speech errors
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [sceneIndex, isVoiceEnabled, currentScene]);

  return (
    <div className="rounded-2xl overflow-hidden border border-[#91EAAF]/60 shadow-xl bg-gradient-to-br from-[#0F291A] via-[#173B24] to-[#1F4B2C] text-white">
      {/* Top Video Bar */}
      <div className="px-4 py-2.5 bg-black/30 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C3E956] animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#C3E956]">
            {config.badge}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsVoiceEnabled((v) => !v)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1 transition-all"
            title={isVoiceEnabled ? 'Mute AgriBee Voice' : 'Listen to AgriBee Voice'}
          >
            {isVoiceEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#C3E956]" />
                <span>Voice On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-white/70" />
                <span>Listen</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            title={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Animated Scene Body */}
      <div className={compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Animated AgriBee Mascot Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-[#C3E956] text-[#1F4B2C] flex items-center justify-center font-extrabold text-xl shadow-md shrink-0 border-2 border-white/40">
              🐝
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded bg-[#C3E956]/20 text-[#C3E956] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                Step {currentScene.stepNumber} of {config.scenes.length} • {currentScene.visualBadge}
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                {currentScene.title}
              </h4>
            </div>
          </div>
        </div>

        {/* Plain Kindergarten-Simple Caption */}
        <p className="text-sm sm:text-base text-[#F4FFFC]/95 bg-black/25 rounded-xl p-3.5 border border-white/10 leading-relaxed mb-4">
          “{currentScene.caption}”
        </p>

        {/* Visual Step Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          {currentScene.visualPoints.map((pt, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15 flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C3E956] shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm font-semibold text-white leading-snug">
                {pt}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Dots & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/15">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSceneIndex((prev) => (prev - 1 + config.scenes.length) % config.scenes.length)
              }
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              aria-label="Previous scene"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {config.scenes.map((sc, idx) => (
                <button
                  key={sc.stepNumber}
                  type="button"
                  onClick={() => setSceneIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === sceneIndex ? 'w-7 bg-[#C3E956]' : 'w-2 bg-white/30'
                  }`}
                  aria-label={`Scene ${idx + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSceneIndex((prev) => (prev + 1) % config.scenes.length)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              aria-label="Next scene"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {onPrimaryAction && config.nextActionLabel && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="px-4 py-2 rounded-xl bg-[#C3E956] hover:bg-[#d4f373] text-[#1F4B2C] font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{config.nextActionLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const AgribeeVideoPlayerModal: React.FC = () => {
  const {
    activeAgribeeVideo,
    setActiveAgribeeVideo,
    setIsOnboardingOpen,
    currentUser,
    setActiveTab,
  } = useApp();

  if (!activeAgribeeVideo) return null;

  const currentConfig = AGRIBEE_VIDEOS[activeAgribeeVideo] || AGRIBEE_VIDEOS.welcome;

  const handlePrimaryAction = () => {
    if (activeAgribeeVideo === 'welcome') {
      setActiveAgribeeVideo(null);
      setIsOnboardingOpen(true);
      return;
    }
    if (activeAgribeeVideo === 'register-guide') {
      setActiveAgribeeVideo(null);
      setIsOnboardingOpen(true);
      return;
    }
    if (currentConfig.nextVideoId) {
      setActiveAgribeeVideo(currentConfig.nextVideoId);
    } else {
      setActiveAgribeeVideo(null);
    }
  };

  const playlist: { id: AgribeeVideoId; label: string; icon: React.ReactNode }[] = [
    { id: 'welcome', label: '1. Welcome & Login', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'register-guide', label: '2. Create Account', icon: <UserPlus className="w-3.5 h-3.5" /> },
    { id: 'congrats-dashboard', label: '3. Congrats & Dashboard', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'market-guide', label: '4. Market Guide', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'inventory-monitoring', label: '5. Inventory & Supply', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'messages-orders', label: '6. Messages & Orders', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'gis-map', label: '7. Farm Map', icon: <MapPin className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl rounded-3xl glass-card border border-[#91EAAF]/60 shadow-2xl overflow-hidden bg-[#F4FFFC] dark:bg-[#0D2116] text-[#1F4B2C] dark:text-[#E8F5E9]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#1F4B2C] text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C3E956] text-[#1F4B2C] flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold leading-tight">
                {currentConfig.title}
              </h3>
              <p className="text-xs text-[#91EAAF]">{currentConfig.shortSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveAgribeeVideo(null)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Close video guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          <AgribeeInlineVideoPlayer
            videoId={activeAgribeeVideo}
            onPrimaryAction={handlePrimaryAction}
          />

          {/* Quick Jump to Feature If Logged In */}
          {currentUser && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#91EAAF]/20 dark:bg-white/5 rounded-2xl p-3.5 border border-[#91EAAF]/50">
              <span className="text-xs sm:text-sm font-bold">
                Want to open this feature right now?
              </span>
              <div className="flex flex-wrap gap-2">
                {activeAgribeeVideo === 'market-guide' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('marketplace');
                      setActiveAgribeeVideo(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#1F4B2C] text-white text-xs font-bold"
                  >
                    Open Marketplace
                  </button>
                )}
                {activeAgribeeVideo === 'inventory-monitoring' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('supply-monitoring');
                      setActiveAgribeeVideo(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#1F4B2C] text-white text-xs font-bold"
                  >
                    Open Supply Monitoring
                  </button>
                )}
                {activeAgribeeVideo === 'messages-orders' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('orders');
                      setActiveAgribeeVideo(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#1F4B2C] text-white text-xs font-bold"
                  >
                    Open Orders & Messages
                  </button>
                )}
                {activeAgribeeVideo === 'gis-map' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('gis');
                      setActiveAgribeeVideo(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#1F4B2C] text-white text-xs font-bold"
                  >
                    Open Farm Map
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sequential Video Playlist Selector */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#4D7111] dark:text-[#C3E956] mb-2">
              AgriBee Step-by-Step Video Guides
            </p>
            <div className="flex flex-wrap gap-2">
              {playlist.map((item) => {
                const active = item.id === activeAgribeeVideo;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveAgribeeVideo(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      active
                        ? 'bg-[#1F4B2C] text-[#C3E956] border-[#1F4B2C] shadow-md'
                        : 'bg-white/80 dark:bg-white/10 text-[#1F4B2C] dark:text-white border-[#4D7111]/20 hover:bg-[#91EAAF]/30'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
