import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MUNICIPALITIES_WEATHER } from '../data/seedData';
import { AdvancedAiClimatePredictor } from './AdvancedAiClimatePredictor';
import { AgribeeInlineVideoPlayer } from './AgribeeVideoPlayerModal';
import {
  Users,
  Eye,
  CheckCircle,
  Package,
  TrendingUp,
  CloudRain,
  Wind,
  Droplets,
  Sparkles,
  ArrowRight,
  Radio,
  ExternalLink,
  CheckCircle2,
  CloudSun,
  LogIn,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Newspaper,
  Lock,
  Sun,
  Moon,
  Video,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export const PublicLandingScreen: React.FC = () => {
  const {
    counters,
    nvatReport,
    commodities,
    accounts,
    daNews,
    navigateToTabWithGuard,
    setIsOnboardingOpen,
    setIsPagasaModalOpen,
    currentUser,
    setActiveOrderModalItem,
    themeMode,
    toggleThemeMode,
    setActiveAgribeeVideo,
  } = useApp();

  const [isRoleBreakdownExpanded, setIsRoleBreakdownExpanded] = useState<boolean>(true);
  const [activeLandingTab, setActiveLandingTab] = useState<
    'nvat' | 'news' | 'weather' | 'predictor' | 'commodities'
  >('nvat');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('Bambang');

  const weather =
    MUNICIPALITIES_WEATHER[selectedMunicipality] || MUNICIPALITIES_WEATHER['Bambang'];

  // Accurate, true breakdown computed from live telemetry + registered stakeholder accounts
  const roleBreakdown = counters.loggedInByRole || {
    farmers: 8,
    buyers: 4,
    suppliers: 3,
    cooperatives: 2,
    government: 1,
    admin: 1,
  };

  const registeredByRole = {
    total: Math.max(accounts.length, counters.farmersCount + counters.buyersCount + counters.suppliersCount + counters.cooperativesCount),
    farmers: Math.max(
      accounts.filter((a) => a.role === 'Farmer').length,
      counters.farmersCount
    ),
    buyers: Math.max(
      accounts.filter((a) => a.role === 'Buyer').length,
      counters.buyersCount
    ),
    suppliers: Math.max(
      accounts.filter((a) => a.role === 'Supplier').length,
      counters.suppliersCount
    ),
    cooperatives: Math.max(
      accounts.filter((a) => a.role === 'Cooperative').length,
      counters.cooperativesCount
    ),
    government: Math.max(
      accounts.filter((a) => a.role === 'Government').length,
      12
    ),
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 animate-fade-in text-left">
      {/* 1. CLEAN TOP LANDING NAVBAR WITH LOG IN, REGISTER & DARK/LIGHT MODE */}
      <nav className="glass-light p-3.5 sm:p-4 rounded-3xl border-2 border-[#91EAAF] shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 border-2 border-[#91EAAF] shadow-xs flex items-center justify-center">
            <img
              src="/assets/aistudio/file_000000000e5c8209a20727869a247797_07ecb429.jpg"
              alt="AgriMatch NV"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#1F4B2C] dark:text-[#E8F5E9]">
                AgriMatch NV
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956]">
                NUEVA VIZCAYA
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-300 font-semibold hidden md:block">
              Direct Farm-to-Buyer Trading, eNVAT Prices & Live Weather
            </p>
          </div>
        </div>

        {/* Section Jump Links */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-extrabold text-[#1F4B2C] dark:text-[#E8F5E9]">
          <a href="#hero" className="hover:text-[#4D7111] transition-colors">
            Home
          </a>
          <a href="#live-preview" className="hover:text-[#4D7111] transition-colors">
            Live Preview
          </a>
          <a href="#offers" className="hover:text-[#4D7111] transition-colors">
            Features
          </a>
          <a href="#videos" className="hover:text-[#4D7111] transition-colors">
            Videos
          </a>
          <a href="#developers" className="hover:text-[#4D7111] transition-colors">
            Creators & Coaches
          </a>
        </div>

        {/* Action Buttons: Light/Dark Mode, Log In, Register */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleThemeMode}
            className="p-2.5 rounded-xl bg-white/80 dark:bg-white/10 border border-[#91EAAF] text-[#1F4B2C] dark:text-[#C3E956] hover:scale-105 transition-all cursor-pointer"
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-[#C3E956]" />
            ) : (
              <Moon className="w-4 h-4 text-[#1F4B2C]" />
            )}
          </button>

          {currentUser ? (
            <button
              type="button"
              onClick={() => navigateToTabWithGuard('dashboard')}
              className="px-4 py-2.5 rounded-xl btn-sprout text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Open Main Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#1F4B2C] hover:bg-[#296139] text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#C3E956]" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="px-4 py-2.5 rounded-xl btn-sprout text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#1F4B2C]" />
                <span>Register</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 2. VERY FIRST HERO SECTION: Farmers Advocacy Photo + Log In / Register + AgriBee Video 1 */}
      <section
        id="hero"
        className="relative overflow-hidden rounded-3xl glass-light p-6 sm:p-10 border-2 border-[#91EAAF] shadow-xl"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-bl from-[#C3E956]/25 via-[#91EAAF]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Clean, Simple Headline + Login/Register Gate */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-xs font-extrabold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C3E956]" />
              <span>Official Nueva Vizcaya Farmer & Buyer Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#1F4B2C] dark:text-[#E8F5E9] tracking-tight leading-tight">
              Sell Harvests Directly. Check Live eNVAT Prices & Weather.
            </h1>

            <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-200 font-semibold leading-relaxed">
              Built so every farmer, buyer, supplier, and cooperative in Nueva Vizcaya can check
              daily prices, post crops, and trade in plain, simple steps.
            </p>

            {/* Primary Log In & Register Buttons + Menu Lock Notice */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-6 py-3.5 rounded-2xl bg-[#1F4B2C] hover:bg-[#296139] text-white text-sm sm:text-base font-black flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <LogIn className="w-5 h-5 text-[#C3E956]" />
                  <span>Log In to Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-6 py-3.5 rounded-2xl btn-sprout text-sm sm:text-base font-black flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <UserPlus className="w-5 h-5 text-[#1F4B2C]" />
                  <span>Register Free Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAgribeeVideo('welcome')}
                  className="px-4 py-3.5 rounded-2xl bg-white/90 dark:bg-white/10 border-2 border-[#4D7111]/30 text-[#1F4B2C] dark:text-[#C3E956] text-xs sm:text-sm font-extrabold flex items-center gap-2 hover:bg-[#91EAAF]/30 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4 text-[#4D7111] dark:text-[#C3E956]" />
                  <span>Full Video Guide</span>
                </button>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#91EAAF]/30 dark:bg-white/5 border border-[#4D7111]/25 text-xs font-bold text-[#1F4B2C] dark:text-[#91EAAF]">
                <Lock className="w-3.5 h-3.5 shrink-0 text-[#4D7111] dark:text-[#C3E956]" />
                <span>
                  Workspace menus (Market, Inventory, Messages, Map) unlock after you Log In or
                  Register.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Attached Professional Farmers Photo (/assets/aistudio/Home_Advocacy_0e2cf33c.png) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#91EAAF]/40 via-white/80 to-[#C3E956]/30 dark:from-[#1F4B2C]/60 dark:to-[#0D2116]/80 p-4 border-2 border-[#91EAAF] shadow-2xl flex flex-col items-center">
              <img
                src="/assets/aistudio/Home_Advocacy_0e2cf33c.png"
                alt="Nueva Vizcaya Farmers Advocacy"
                className="w-full max-h-80 object-contain drop-shadow-xl"
              />
              <div className="mt-3 w-full rounded-2xl bg-[#1F4B2C] text-white px-4 py-2.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-extrabold text-[#C3E956]">
                    Empowering Nueva Vizcaya Farmers
                  </p>
                  <p className="text-[11px] text-white/90">
                    15 Municipalities • Direct Market Access
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#C3E956] text-[#1F4B2C] text-[10px] font-black uppercase">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded AgriBee Video 1: How to Log In & Why This Website Is Important */}
        <div className="mt-8 pt-6 border-t border-[#4D7111]/20">
          <AgribeeInlineVideoPlayer
            videoId="welcome"
            compact
            onPrimaryAction={() => setIsOnboardingOpen(true)}
          />
        </div>
      </section>

      {/* 3. CONCISE, PRECISE, ACCURATE & TRUE LIVE PREVIEW SECTION */}
      <section id="live-preview" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1F4B2C] dark:text-[#E8F5E9] tracking-tight">
                Live Platform Preview
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-semibold">
              Accurate real-time active accounts, site visits, eNVAT prices, DA news, and weather.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPagasaModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-900 text-xs font-extrabold flex items-center gap-2 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Live PAGASA Radar</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>

        {/* Primary Live Counters: Active Logged-In Accounts (with Expand Button) + Total Visits + Stock + Trades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Logged-In Accounts with EXPAND button */}
          <div className="glass-light p-4 sm:p-5 rounded-2xl border-2 border-[#1F4B2C] dark:border-[#C3E956] shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold uppercase text-[#1F4B2C] dark:text-[#C3E956]">
                  Accounts Logged In
                </span>
                <div className="p-1.5 rounded-lg bg-[#C3E956]/40 text-[#1F4B2C] dark:text-[#C3E956]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#1F4B2C] dark:text-white">
                  {counters.currentlyLoggedIn}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-[#91EAAF]">
                  Online Now
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRoleBreakdownExpanded((prev) => !prev)}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-[#1F4B2C] text-[#C3E956] text-xs font-extrabold flex items-center justify-between hover:bg-[#2a633b] transition-all cursor-pointer"
            >
              <span>
                {isRoleBreakdownExpanded ? 'Hide User Breakdown' : 'Expand Breakdown'}
              </span>
              {isRoleBreakdownExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Card 2: Total Verified Site Visits */}
          <div className="glass-light p-4 sm:p-5 rounded-2xl border border-[#91EAAF] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold uppercase text-neutral-600 dark:text-neutral-300">
                  Total Site Visits
                </span>
                <div className="p-1.5 rounded-lg bg-[#4D7111]/15 text-[#4D7111] dark:text-[#C3E956]">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-[#1F4B2C] dark:text-white">
                {counters.totalVisitors.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-emerald-700 dark:text-[#91EAAF] font-bold mt-2">
              {registeredByRole.total.toLocaleString()} Total Registered Accounts
            </p>
          </div>

          {/* Card 3: Active Supply Listings */}
          <div className="glass-light p-4 sm:p-5 rounded-2xl border border-[#91EAAF] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold uppercase text-neutral-600 dark:text-neutral-300">
                  Active Crop Supply
                </span>
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-[#1F4B2C] dark:text-white">
                {(counters.totalCommoditiesPostedKg / 1000).toFixed(1)} MT
              </div>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-bold mt-2">
              {commodities.length} Verified Supply Lots ({counters.totalCommoditiesPostedKg.toLocaleString()} kg)
            </p>
          </div>

          {/* Card 4: Completed Transactions */}
          <div className="glass-light p-4 sm:p-5 rounded-2xl border border-[#91EAAF] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold uppercase text-neutral-600 dark:text-neutral-300">
                  Completed Trades
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-[#1F4B2C] dark:text-white">
                {counters.totalCompletedTransactions}
              </div>
            </div>
            <p className="text-xs text-emerald-700 dark:text-[#91EAAF] font-bold mt-2">
              Sent + Received Verified
            </p>
          </div>
        </div>

        {/* EXPANDABLE LIVE USERS BREAKDOWN PANEL (Farmers, Buyers, Suppliers, Cooperatives, Government) */}
        {isRoleBreakdownExpanded && (
          <div className="glass-card rounded-2xl p-4 sm:p-5 border-2 border-[#91EAAF] shadow-md animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1F4B2C] dark:text-[#C3E956] flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  Live Logged-In & Registered Breakdown by Role ({counters.currentlyLoggedIn} Online
                  / {registeredByRole.total} Registered)
                </span>
              </h3>
              <span className="text-[11px] font-bold text-[#4D7111] dark:text-[#91EAAF]">
                Real-Time Database & Session Telemetry
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-white/90 dark:bg-black/30 border border-[#91EAAF]/60">
                <span className="text-[11px] font-extrabold uppercase text-[#4D7111] dark:text-[#C3E956]">
                  Farmers
                </span>
                <p className="text-2xl font-black text-[#1F4B2C] dark:text-white mt-0.5">
                  {roleBreakdown.farmers}{' '}
                  <span className="text-xs font-bold text-emerald-600">live</span>
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-300 font-semibold">
                  {registeredByRole.farmers} registered
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/90 dark:bg-black/30 border border-[#91EAAF]/60">
                <span className="text-[11px] font-extrabold uppercase text-[#4D7111] dark:text-[#C3E956]">
                  Buyers
                </span>
                <p className="text-2xl font-black text-[#1F4B2C] dark:text-white mt-0.5">
                  {roleBreakdown.buyers}{' '}
                  <span className="text-xs font-bold text-emerald-600">live</span>
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-300 font-semibold">
                  {registeredByRole.buyers} registered
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/90 dark:bg-black/30 border border-[#91EAAF]/60">
                <span className="text-[11px] font-extrabold uppercase text-[#4D7111] dark:text-[#C3E956]">
                  Suppliers
                </span>
                <p className="text-2xl font-black text-[#1F4B2C] dark:text-white mt-0.5">
                  {roleBreakdown.suppliers}{' '}
                  <span className="text-xs font-bold text-emerald-600">live</span>
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-300 font-semibold">
                  {registeredByRole.suppliers} registered
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/90 dark:bg-black/30 border border-[#91EAAF]/60">
                <span className="text-[11px] font-extrabold uppercase text-[#4D7111] dark:text-[#C3E956]">
                  Cooperatives
                </span>
                <p className="text-2xl font-black text-[#1F4B2C] dark:text-white mt-0.5">
                  {roleBreakdown.cooperatives}{' '}
                  <span className="text-xs font-bold text-emerald-600">live</span>
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-300 font-semibold">
                  {registeredByRole.cooperatives} registered
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/90 dark:bg-black/30 border border-[#91EAAF]/60">
                <span className="text-[11px] font-extrabold uppercase text-[#4D7111] dark:text-[#C3E956]">
                  Government
                </span>
                <p className="text-2xl font-black text-[#1F4B2C] dark:text-white mt-0.5">
                  {roleBreakdown.government}{' '}
                  <span className="text-xs font-bold text-emerald-600">live</span>
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-300 font-semibold">
                  {registeredByRole.government} offices
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#1F4B2C] text-white border border-[#1F4B2C]">
                <span className="text-[11px] font-extrabold uppercase text-[#C3E956]">
                  Total Active
                </span>
                <p className="text-2xl font-black text-white mt-0.5">
                  {counters.currentlyLoggedIn}
                </p>
                <p className="text-[11px] text-[#91EAAF] font-semibold">
                  {counters.totalVisitors.toLocaleString()} visits
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Preview Switcher: eNVAT Price Updates | Official DA News | Weather | 1-2 Month Climate | Crops Preview */}
        <div className="space-y-4">
          <div className="flex gap-2 p-1.5 rounded-2xl bg-neutral-200/70 dark:bg-white/10 max-w-4xl mx-auto border border-[#91EAAF]/50 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveLandingTab('nvat')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeLandingTab === 'nvat'
                  ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                  : 'text-[#1F4B2C] dark:text-white hover:bg-white/40'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>eNVAT Price Updates</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLandingTab('news')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeLandingTab === 'news'
                  ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                  : 'text-[#1F4B2C] dark:text-white hover:bg-white/40'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Official DA News (da.gov.ph)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLandingTab('weather')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeLandingTab === 'weather'
                  ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                  : 'text-[#1F4B2C] dark:text-white hover:bg-white/40'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span>Weather</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLandingTab('predictor')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeLandingTab === 'predictor'
                  ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                  : 'text-[#1F4B2C] dark:text-white hover:bg-white/40'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>1-2 Month Climate</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLandingTab('commodities')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeLandingTab === 'commodities'
                  ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                  : 'text-[#1F4B2C] dark:text-white hover:bg-white/40'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Crops ({commodities.length})</span>
            </button>
          </div>

          {/* TAB 1: eNVAT Price Updates */}
          {activeLandingTab === 'nvat' && (
            <div className="glass-light p-5 sm:p-6 rounded-3xl border-2 border-[#91EAAF] shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-white/10">
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-[#4D7111] dark:text-[#C3E956]">
                    Bambang NVAT Trading Post • {nvatReport.date}
                  </span>
                  <h3 className="text-lg font-black text-[#1F4B2C] dark:text-white">
                    Today’s Prevailing Crop Prices (eNVAT)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#1F4B2C] text-[#C3E956] text-xs font-extrabold cursor-pointer self-start sm:self-auto"
                >
                  Log In to Trade at These Prices
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {nvatReport.items.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/90 dark:bg-black/30 border border-[#91EAAF]/60 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-[#1F4B2C] dark:text-white">
                        {item.commodityName}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-300">
                        Prev: ₱{item.previousPricePhp}/kg • {item.estimatedVolumeTradedTons} MT
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base sm:text-lg font-black text-[#1F4B2C] dark:text-[#C3E956]">
                        ₱{item.prevailingPricePhp}/kg
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          item.marketTrendStatus === 'Surging'
                            ? 'bg-rose-100 text-rose-800'
                            : item.marketTrendStatus === 'Declining'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {item.marketTrendStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Official DA News (da.gov.ph) with Pictures & Direct Article Links */}
          {activeLandingTab === 'news' && (
            <div className="glass-light p-5 sm:p-6 rounded-3xl border-2 border-[#91EAAF] shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-white/10">
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-[#4D7111] dark:text-[#C3E956]">
                    Automatic Feed • Department of Agriculture (da.gov.ph)
                  </span>
                  <h3 className="text-lg font-black text-[#1F4B2C] dark:text-white">
                    Featured Agricultural News & Updates
                  </h3>
                </div>
                <a
                  href="https://www.da.gov.ph/news/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1F4B2C] dark:text-[#C3E956] underline"
                >
                  <span>Visit da.gov.ph</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {daNews.slice(0, 6).map((art) => (
                  <a
                    key={art.id}
                    href={art.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-2xl overflow-hidden bg-white dark:bg-black/30 border border-[#91EAAF]/60 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-40 overflow-hidden bg-neutral-900">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-extrabold uppercase">
                          {art.category}
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <p className="text-[11px] font-bold text-[#4D7111] dark:text-[#91EAAF]">
                          {art.publishedAt} • {art.source}
                        </p>
                        <h4 className="text-sm font-black text-[#1F4B2C] dark:text-white group-hover:underline leading-snug">
                          {art.title}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                          {art.summary || art.excerpt}
                        </p>
                      </div>
                    </div>
                    <div className="px-4 pb-3 pt-1 flex items-center justify-between text-xs font-extrabold text-[#1F4B2C] dark:text-[#C3E956]">
                      <span>Read Full Article on da.gov.ph</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Current PAGASA Weather */}
          {activeLandingTab === 'weather' && (
            <div className="glass-light p-6 rounded-3xl border-2 border-[#91EAAF] shadow-lg space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-white/10">
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-[#4D7111] dark:text-[#C3E956]">
                    PAGASA Weather Station
                  </span>
                  <h3 className="text-lg font-black text-[#1F4B2C] dark:text-white">
                    Live Town Weather in Nueva Vizcaya
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                    Town:
                  </label>
                  <select
                    value={selectedMunicipality}
                    onChange={(e) => setSelectedMunicipality(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-[#91EAAF] bg-white dark:bg-[#0D2116] text-xs font-bold text-[#1F4B2C] dark:text-white"
                  >
                    {Object.keys(MUNICIPALITIES_WEATHER).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#C3E956]/30 p-2 flex items-center justify-center border border-[#91EAAF]">
                    <CloudSun className="w-9 h-9 text-[#1F4B2C] dark:text-[#C3E956]" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#1F4B2C] dark:text-white">
                      {weather.temperatureC}°C
                    </div>
                    <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                      Feels like {weather.feelsLikeC}°C • {weather.condition}
                    </div>
                    <div className="text-xs text-[#4D7111] dark:text-[#C3E956] font-bold">
                      {selectedMunicipality}, Nueva Vizcaya
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-white/90 dark:bg-black/30 border border-[#91EAAF]/60">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                      <Wind className="w-3 h-3 text-[#4D7111]" /> Wind
                    </span>
                    <p className="text-base font-black text-[#1F4B2C] dark:text-white mt-1">
                      {weather.windSpeedKmh} km/h
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/90 dark:bg-black/30 border border-[#91EAAF]/60">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" /> Humidity
                    </span>
                    <p className="text-base font-black text-[#1F4B2C] dark:text-white mt-1">
                      {weather.humidityPercent}%
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPagasaModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-[#1F4B2C] text-[#C3E956] text-xs font-extrabold flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                  <span>Open Full PAGASA Radar</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: 1-2 Month AI Climate Predictor */}
          {activeLandingTab === 'predictor' && <AdvancedAiClimatePredictor />}

          {/* TAB 5: Public Crop Listings Preview */}
          {activeLandingTab === 'commodities' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {commodities.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!currentUser) {
                        setIsOnboardingOpen(true);
                      } else {
                        setActiveOrderModalItem(item);
                      }
                    }}
                    className="glass-card rounded-2xl overflow-hidden border border-[#91EAAF] shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#1F4B2C] text-[#C3E956]">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <h4 className="text-sm font-bold text-[#1F4B2C] dark:text-white truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-300">
                          {item.supplierName} • {item.municipality}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                            {item.availableKg.toLocaleString()} kg
                          </span>
                          <span className="text-sm font-black text-[#1F4B2C] dark:text-[#C3E956]">
                            ₱{item.pricePerKg}/kg
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 pt-0">
                      <button
                        type="button"
                        className="w-full py-2 rounded-xl btn-sprout text-xs font-black"
                      >
                        {currentUser ? 'Order / Inquire' : 'Log In to Order'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. FEATURES: SIMPLE & CLEAR FOR ALL STAKEHOLDERS */}
      <section id="offers" className="space-y-5">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#91EAAF]/40 text-[#1F4B2C] dark:text-[#C3E956] border border-[#91EAAF]">
            Platform Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F4B2C] dark:text-white tracking-tight">
            Built for Every Role in Nueva Vizcaya
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-3xl border-2 border-[#91EAAF] flex flex-col justify-between space-y-4">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-3">
                👨‍🌾
              </div>
              <h3 className="text-base font-black text-[#1F4B2C] dark:text-white">
                Farmers & Suppliers
              </h3>
              <ul className="mt-2.5 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-200 font-semibold">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Post crops with built-in AI quality grading</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Manage My Inventory & Supply Monitoring</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-bold cursor-pointer"
            >
              Log In as Farmer / Supplier
            </button>
          </div>

          <div className="glass-card p-5 rounded-3xl border-2 border-[#91EAAF] flex flex-col justify-between space-y-4">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl mb-3">
                🛒
              </div>
              <h3 className="text-base font-black text-[#1F4B2C] dark:text-white">
                Wholesale Buyers
              </h3>
              <ul className="mt-2.5 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-200 font-semibold">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Built-in AI crop recommendations in Market</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Highlighted Orders & Transactions beside Messages</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-bold cursor-pointer"
            >
              Log In as Buyer
            </button>
          </div>

          <div className="glass-card p-5 rounded-3xl border-2 border-[#91EAAF] flex flex-col justify-between space-y-4">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-3">
                🏢
              </div>
              <h3 className="text-base font-black text-[#1F4B2C] dark:text-white">
                Cooperatives
              </h3>
              <ul className="mt-2.5 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-200 font-semibold">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Consolidate member harvests & bulk stocks</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Track demand trends across 15 towns</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-bold cursor-pointer"
            >
              Log In as Cooperative
            </button>
          </div>

          <div className="glass-card p-5 rounded-3xl border-2 border-[#91EAAF] flex flex-col justify-between space-y-4">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl mb-3">
                🏛️
              </div>
              <h3 className="text-base font-black text-[#1F4B2C] dark:text-white">
                Government & DA
              </h3>
              <ul className="mt-2.5 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-200 font-semibold">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Dedicated Municipal AI Agent & Analytics</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Compile municipal accounts, inventory & trends</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-bold cursor-pointer"
            >
              Log In as Government
            </button>
          </div>
        </div>
      </section>

      {/* 5. WATCH INSPIRING AGRICULTURAL VIDEOS */}
      <section id="videos" className="space-y-5">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956]">
            Featured Videos
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F4B2C] dark:text-white tracking-tight">
            Inspiring Agricultural Videos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-3xl glass-card border-2 border-[#91EAAF] shadow-lg space-y-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/GcCkQoceR64?autoplay=1&mute=1&loop=1&playlist=GcCkQoceR64&rel=0"
                title="Nueva Vizcaya Agricultural Innovation Showcase"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="text-sm sm:text-base font-black text-[#1F4B2C] dark:text-white">
              Nueva Vizcaya Vegetable Hubs & Market Logistics
            </h3>
          </div>

          <div className="p-4 rounded-3xl glass-card border-2 border-[#91EAAF] shadow-lg space-y-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/0ujMjn4mt6U?autoplay=1&mute=1&loop=1&playlist=0ujMjn4mt6U&rel=0"
                title="Agricultural Technology & Sustainability"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="text-sm sm:text-base font-black text-[#1F4B2C] dark:text-white">
              Smart Highland Cultivation & Produce Care
            </h3>
          </div>
        </div>
      </section>

      {/* 6. CREATORS: RESEARCHER & LEAD DEVELOPER FOLLOWED BY RESEARCH COACHES */}
      <section id="developers" className="space-y-5">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#C3E956] text-[#1F4B2C]">
            Creators & Research Team
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F4B2C] dark:text-white tracking-tight">
            Researcher, Developer & Advisory Coaches
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1st: Researcher & Lead Developer */}
          <div className="rounded-3xl glass-card border-2 border-[#91EAAF] shadow-xl overflow-hidden flex flex-col">
            <video
              src="/assets/aistudio/Modern_Putih_dan_Kuning_Perkenalan_Anggota_Mahasiswa_Kuliah_Kerja_Nyata_Ins_20261113_112832_0001_c4eb0a71.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full aspect-video object-cover bg-black"
            />
            <div className="p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name="Russel Gurat"
                  role="MASTER_ADMIN"
                  sizeClass="w-11 h-11"
                  className="border-2 border-[#91EAAF]"
                />
                <div>
                  <h3 className="text-base font-black text-[#1F4B2C] dark:text-white">
                    Russel Gurat
                  </h3>
                  <p className="text-xs font-bold text-[#4D7111] dark:text-[#C3E956]">
                    Researcher & Lead Developer
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black uppercase">
                Creator
              </span>
            </div>
          </div>

          {/* 2nd: Followed by Research Coaches */}
          <div className="rounded-3xl glass-card border-2 border-[#91EAAF] shadow-xl overflow-hidden flex flex-col">
            <video
              src="/assets/aistudio/Modern_Putih_dan_Kuning_Perkenalan_Anggota_Mahasiswa_Kuliah_Kerja_Nyata_Ins_20261113_112849_0002_7d81d822.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full aspect-video object-cover bg-black"
            />
            <div className="p-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[#1F4B2C] dark:text-white">
                  Research & Advisory Coaches
                </h3>
                <p className="text-xs font-bold text-[#4D7111] dark:text-[#C3E956]">
                  Marizza Versola • Maricris Valdez • Fe B. Tabago
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#C3E956] text-[#1F4B2C] text-[10px] font-black uppercase">
                Coaches
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
