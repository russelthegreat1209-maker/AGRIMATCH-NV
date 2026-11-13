import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MUNICIPALITIES_WEATHER } from '../data/seedData';
import { AdvancedAiClimatePredictor } from './AdvancedAiClimatePredictor';
import {
  Users,
  Eye,
  CheckCircle,
  Package,
  TrendingUp,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  Compass,
  Radio,
  Play,
  Award,
  BookOpen,
  Code2,
  ExternalLink,
  CheckCircle2,
  CloudSun,
  ShoppingBag,
  Cpu,
  Leaf,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export const PublicLandingScreen: React.FC = () => {
  const {
    counters,
    announcements,
    nvatReport,
    commodities,
    navigateToTabWithGuard,
    setIsOnboardingOpen,
    setIsPagasaModalOpen,
    setEnvironmentMode,
    environmentMode,
    currentUser,
    setActiveOrderModalItem,
    switchDemoRole,
    t,
  } = useApp();

  const [activeLandingTab, setActiveLandingTab] = useState<'weather' | 'predictor' | 'nvat' | 'commodities'>('weather');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('Bambang');
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  const weather = MUNICIPALITIES_WEATHER[selectedMunicipality] || MUNICIPALITIES_WEATHER['Bambang'];

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 animate-fade-in text-left">
      {/* 1. RESPONSIVE HERO NAVBAR / GATEKEEPER BAR */}
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
              <span className="text-base sm:text-lg font-black tracking-tight text-[#1F4B2C]">
                AgriMatch NV
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956]">
                {t.publicGatewayBadge}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 font-semibold hidden md:block">
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-neutral-600">
          <a href="#hero" className="hover:text-[#1F4B2C] transition-colors">{t.navOverview}</a>
          <a href="#intelligence" className="hover:text-[#1F4B2C] transition-colors">{t.navLiveIntel}</a>
          <a href="#offers" className="hover:text-[#1F4B2C] transition-colors">{t.navOffers}</a>
          <a href="#videos" className="hover:text-[#1F4B2C] transition-colors">{t.navVideos}</a>
          <a href="#developers" className="hover:text-[#1F4B2C] transition-colors">{t.navArchitects}</a>
        </div>

        {/* Demo Platform Entry */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEnvironmentMode('demo');
              navigateToTabWithGuard('dashboard');
            }}
            className="px-4 py-2 rounded-xl btn-sprout text-xs font-black flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1F4B2C]" />
            <span>{t.launchDemo}</span>
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION: Value Proposition, Guiding Principle & Direct Triggers */}
      <section id="hero" className="relative overflow-hidden rounded-3xl glass-light p-6 sm:p-12 border-2 border-[#91EAAF] shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#C3E956]/25 via-[#91EAAF]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Guiding Principle Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C3E956]" />
              <span className="italic font-semibold">
                "Connecting Agriculture, Empowering Communities, and Growing Opportunities through Intelligent Technology."
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#1F4B2C] tracking-tight leading-tight">
              Nueva Vizcaya Crop Tracking, AI Climate Forecasts & Direct Market Matching
            </h1>

            <p className="text-sm sm:text-base text-neutral-700 font-medium leading-relaxed">
              Multi-agent intelligence, 1–2 month PAGASA barangay weather projections, and direct NVAT Bambang supply trading for farmers, cooperatives, suppliers, and buyers.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setEnvironmentMode('demo');
                  navigateToTabWithGuard('dashboard');
                }}
                className="px-6 py-3.5 rounded-2xl btn-sprout text-xs sm:text-sm font-black flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
              >
                <span>Launch Interactive Demo Mode</span>
                <ArrowRight className="w-4 h-4 text-[#1F4B2C]" />
              </button>

              <button
                onClick={() => setIsPagasaModalOpen(true)}
                className="px-5 py-3.5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-blue-100 transition-colors"
              >
                <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Check Official Live PAGASA Feed</span>
              </button>

              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-5 py-3.5 rounded-2xl btn-forest text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#C3E956]" />
                <span>Launch AGRIBEE Guide</span>
              </button>
            </div>
          </div>

          {/* Hero Agri Bee Mascot Card */}
          <div className="relative flex flex-col items-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-white/95 p-3 shadow-2xl border-4 border-[#91EAAF] flex items-center justify-center animate-float-logo">
              <img
                src="/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121757_0000_ec40164d.webp"
                alt="Agri Bee Mascot"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3 text-center">
              <span className="text-sm font-black text-[#1F4B2C] uppercase tracking-wider">
                Agri Bee Virtual Onboarding
              </span>
              <p className="text-[11px] text-neutral-500 font-semibold">
                Autonomous Multi-Agent Companion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE PUBLIC INTELLIGENCE PREVIEW: Dynamic Summary Cards */}
      <section id="intelligence" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <h2 className="text-lg font-black text-[#1F4B2C] uppercase tracking-wider">
                Live Public Intelligence & Crop Hub Telemetry
              </h2>
            </div>
            <p className="text-xs text-neutral-600 font-medium mt-0.5">
              Live statistics from across all 15 municipalities of Nueva Vizcaya
            </p>
          </div>

          {/* Button to open official PAGASA Modal */}
          <button
            onClick={() => setIsPagasaModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-900 text-xs font-bold flex items-center gap-2 self-start sm:self-auto transition-colors shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Tap to View Official PAGASA Radar</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>

        {/* Counter Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-light p-4 rounded-2xl border border-[#91EAAF] shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-bold text-neutral-600">Total Site Visitors</span>
              <div className="p-1.5 rounded-lg bg-[#4D7111]/10 text-[#4D7111]">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
              {counters.totalVisitors.toLocaleString()}
            </div>
            <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1 font-semibold">
              <span className="text-emerald-700 font-bold">+18 today</span> • Verified sessions
            </p>
          </div>

          <div className="glass-light p-4 rounded-2xl border border-[#91EAAF] shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-bold text-neutral-600">Active Live Users</span>
              <div className="p-1.5 rounded-lg bg-[#C3E956]/20 text-[#1F4B2C]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
              {counters.currentlyLoggedIn}
            </div>
            <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected across 15 hubs
            </p>
          </div>

          <div className="glass-light p-4 rounded-2xl border border-[#91EAAF] shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-bold text-neutral-600">Completed Trades</span>
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
              {counters.totalCompletedTransactions}
            </div>
            <p className="text-[10px] text-neutral-500 mt-1 font-semibold text-emerald-700">
              Dual-Handshake Confirmed
            </p>
          </div>

          <div className="glass-light p-4 rounded-2xl border border-[#91EAAF] shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-bold text-neutral-600">Commodities in Stock</span>
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
              {(counters.totalCommoditiesPostedKg / 1000).toFixed(1)} MT
            </div>
            <p className="text-[10px] text-neutral-500 mt-1 font-semibold text-neutral-600">
              {counters.totalCommoditiesPostedKg.toLocaleString()} kg active listings
            </p>
          </div>
        </div>

        {/* Informational Intelligence Tabs */}
        <div className="space-y-4">
          <div className="flex gap-2 p-1.5 rounded-2xl bg-neutral-200/60 max-w-2xl mx-auto border border-[#91EAAF]/50 overflow-x-auto">
            <button
              onClick={() => setActiveLandingTab('weather')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeLandingTab === 'weather'
                  ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-md'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <CloudRain className="w-4 h-4 text-[#C3E956]" />
              <span>Current PAGASA Weather</span>
            </button>

            <button
              onClick={() => setActiveLandingTab('predictor')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeLandingTab === 'predictor'
                  ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-md'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#C3E956]" />
              <span>1-2 Month AI Climate</span>
            </button>

            <button
              onClick={() => setActiveLandingTab('nvat')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeLandingTab === 'nvat'
                  ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-md'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#91EAAF]" />
              <span>NVAT Live Prices</span>
            </button>

            <button
              onClick={() => setActiveLandingTab('commodities')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeLandingTab === 'commodities'
                  ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-md'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <Package className="w-4 h-4 text-[#C3E956]" />
              <span>Crops Preview</span>
            </button>
          </div>

          {/* TAB 1: Current PAGASA Weather */}
          {activeLandingTab === 'weather' && (
            <div className="glass-light p-6 rounded-3xl border-2 border-[#91EAAF] shadow-lg text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <Sun className="w-3 h-3 text-amber-500" />
                    PAGASA Synoptic Weather Station
                  </div>
                  <h3 className="text-xl font-black text-[#1F4B2C]">
                    Nueva Vizcaya Real-Time Microclimate Telemetry
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-neutral-600 whitespace-nowrap">
                    Select Town:
                  </label>
                  <select
                    value={selectedMunicipality}
                    onChange={(e) => setSelectedMunicipality(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-[#91EAAF] bg-white text-xs font-bold text-[#1F4B2C] focus:outline-none"
                  >
                    {Object.keys(MUNICIPALITIES_WEATHER).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weather Data Display */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C3E956]/40 to-[#91EAAF]/40 p-2 flex items-center justify-center border border-[#91EAAF]">
                    <CloudSun className="w-10 h-10 text-[#1F4B2C]" />
                  </div>
                  <div>
                    <div className="text-4xl font-black text-[#1F4B2C]">
                      {weather.temperatureC}°C
                    </div>
                    <div className="text-xs font-semibold text-neutral-500">
                      Feels like {weather.feelsLikeC}°C • {weather.condition}
                    </div>
                    <div className="text-[11px] text-[#4D7111] font-bold mt-0.5">
                      {selectedMunicipality}, Nueva Vizcaya
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-white border border-[#91EAAF]/60">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                      <Wind className="w-3 h-3 text-[#4D7111]" /> Wind Speed
                    </span>
                    <p className="text-base font-black text-[#1F4B2C] mt-1">{weather.windSpeedKmh} km/h</p>
                    <span className="text-[9px] text-neutral-500 font-semibold">Northeast Monsoon</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#91EAAF]/60">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" /> Humidity
                    </span>
                    <p className="text-base font-black text-[#1F4B2C] mt-1">{weather.humidityPercent}%</p>
                    <span className="text-[9px] text-neutral-500 font-semibold">Optimal for foliage</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#1F4B2C] text-[#F4FFFC] space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#C3E956] flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5" /> DOST-PAGASA Telemetry
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-[#91EAAF]">LIVE</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-snug">
                    Real-time atmospheric sensor connected to Bayombong radar and Bambang agromet station.
                  </p>
                  <button
                    onClick={() => setIsPagasaModalOpen(true)}
                    className="w-full py-2 rounded-xl btn-sprout text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Open Full PAGASA Radar Telemetry</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#1F4B2C]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 1 to 2-Month Advanced AI Climate Predictor (Municipality & Barangay Selectors) */}
          {activeLandingTab === 'predictor' && (
            <AdvancedAiClimatePredictor />
          )}

          {/* TAB 3: NVAT Market Prices */}
          {activeLandingTab === 'nvat' && (
            <div className="glass-light p-5 sm:p-6 rounded-3xl border-2 border-[#91EAAF] shadow-lg space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4D7111]/15 text-[#1F4B2C] text-[10px] font-bold uppercase tracking-wider mb-1">
                    <TrendingUp className="w-3 h-3 text-[#4D7111]" />
                    Nueva Vizcaya Agricultural Terminal (NVAT) Live Index
                  </div>
                  <h3 className="text-lg font-black text-[#1F4B2C]">
                    Bambang NVAT Daily Commodity Price Statistics
                  </h3>
                </div>
                <div className="text-xs text-neutral-500 font-medium">
                  Date: <strong className="text-[#1F4B2C]">{nvatReport.date}</strong> · Official Trading Post
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1F4B2C] text-[#F4FFFC]">
                      <th className="p-3 font-bold">Commodity Name</th>
                      <th className="p-3 font-bold">Unit of Measure</th>
                      <th className="p-3 font-bold">Price (PHP)</th>
                      <th className="p-3 font-bold">Price Type</th>
                      <th className="p-3 font-bold">Original Data Source</th>
                      <th className="p-3 font-bold">Volume Traded</th>
                      <th className="p-3 font-bold">Trend Status</th>
                      <th className="p-3 font-bold">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {nvatReport.items.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="p-3 font-bold text-[#1F4B2C]">
                          {item.commodityName}
                          <span className="block text-[10px] text-neutral-400 font-normal">{item.category}</span>
                        </td>
                        <td className="p-3 font-mono text-neutral-600">{item.unitOfMeasure || 'PHP / kg'}</td>
                        <td className="p-3 font-black text-[#1F4B2C] font-mono text-sm">₱{item.prevailingPricePhp}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.priceType === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {item.priceType || 'Confirmed'}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-neutral-600 font-medium">{item.originalDataSource || 'NVAT Daily Bulletin, Bambang'}</td>
                        <td className="p-3 font-mono text-[#4D7111]">{item.estimatedVolumeTradedTons} MT</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.marketTrendStatus === 'Surging'
                              ? 'bg-rose-100 text-rose-800'
                              : item.marketTrendStatus === 'Declining'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {item.marketTrendStatus}
                          </span>
                        </td>
                        <td className="p-3 text-[10px] text-neutral-400 font-mono whitespace-nowrap">{item.lastUpdated || 'Today 06:00 AM PHT'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Data Traceability Footer */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>Data Traceability:</strong> Extracted directly from Bambang Trading Post Terminal weighing logs and PAO-NV market monitors.
                </span>
                <span className="font-mono text-[10px] text-neutral-400">Calculation: Volume-Weighted Average Prevailing Rate</span>
              </div>
            </div>
          )}

          {/* TAB 4: Public Crop Listings Preview */}
          {activeLandingTab === 'commodities' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#1F4B2C]">
                    Verified Crop Supply Listings
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Direct from certified farmers and cooperatives in Nueva Vizcaya
                  </p>
                </div>
                <button
                  onClick={() => navigateToTabWithGuard('marketplace')}
                  className="px-4 py-1.5 rounded-full btn-sprout text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <span>View All Marketplace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {commodities.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!currentUser) {
                        navigateToTabWithGuard('marketplace');
                      } else {
                        setActiveOrderModalItem(item);
                      }
                    }}
                    className="glass-card rounded-2xl overflow-hidden border border-[#91EAAF] shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-36 bg-gradient-to-t from-black/60 to-transparent overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#1F4B2C] text-[#C3E956] shadow-xs">
                            {item.category}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          {item.municipality}, Nueva Vizcaya
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <h4 className="text-sm font-bold text-[#1F4B2C] leading-snug">
                          {item.name}
                        </h4>
                        <p className="text-xs text-neutral-500 font-medium">
                          By {item.supplierName} ({item.supplierRole})
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Available</span>
                            <p className="text-xs font-bold text-neutral-700">{item.availableKg.toLocaleString()} kg</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Price</span>
                            <p className="text-sm font-black text-[#1F4B2C]">₱{item.pricePerKg}/kg</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 pt-0">
                      <button className="w-full py-2 rounded-xl btn-sprout text-xs font-black flex items-center justify-center gap-1 shadow-xs">
                        {currentUser ? 'Order / Inquire Now' : 'Sign In to Trade'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. WHAT AGRIMATCH NV OFFERS: Tailored for All 4 Stakeholders */}
      <section id="offers" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#91EAAF]/40 text-[#1F4B2C] border border-[#91EAAF]">
            Value Proposition
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
            What AgriMatch NV Offers
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            Tailored digital tooling and autonomous agent pipelines engineered for every tier of Nueva Vizcaya's agricultural value chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Farmers */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 mb-3">
                <span className="text-2xl">👨‍🌾</span>
              </div>
              <h3 className="text-lg font-black text-[#1F4B2C]">For Farmers</h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Post crop harvests with photo/video authentication, receive 60-day barangay-level PAGASA microclimate alerts, and eliminate predatory intermediaries through direct wholesale bidding.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-neutral-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fair price parity with NVAT Bambang</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Frost & monsoon alerts for high ridges</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dual-handshake delivery protection</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setEnvironmentMode('demo');
                switchDemoRole('Farmer');
                navigateToTabWithGuard('dashboard');
              }}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-bold"
            >
              Test as Farmer (Demo)
            </button>
          </div>

          {/* Card 2: Suppliers / Traders */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-800 mb-3">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-lg font-black text-[#1F4B2C]">For Suppliers & Traders</h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Consolidate multi-ton shipments across Kayapa, Bambang, and Kasibu with Haversine route optimization, cold-chain scheduling, and verified inventory dispatches.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-neutral-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Interactive radius GIS procurement map</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Automated load capacity calculations</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>NVAT Bambang terminal bay scheduling</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setEnvironmentMode('demo');
                switchDemoRole('Supplier');
                navigateToTabWithGuard('dashboard');
              }}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-bold"
            >
              Test as Supplier (Demo)
            </button>
          </div>

          {/* Card 3: Cooperatives */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mb-3">
                <span className="text-2xl">🏢</span>
              </div>
              <h3 className="text-lg font-black text-[#1F4B2C]">For Cooperatives</h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Aggregate member production, manage shared hauling assets, post bulk commodities, and escrow trade settlements with complete transparency.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-neutral-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kasibu citrus & Kayapa vegetable aggregation</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Community chat bulletin announcements</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cooperative trade escrow integration</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setEnvironmentMode('demo');
                switchDemoRole('Cooperative');
                navigateToTabWithGuard('dashboard');
              }}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-bold"
            >
              Test as Cooperative (Demo)
            </button>
          </div>

          {/* Card 4: Institutional Buyers */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-800 mb-3">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-lg font-black text-[#1F4B2C]">For Wholesale Buyers</h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Source directly from highland terraced farms and cold-chain consolidators with verified quality scores, harvest lead times, and digital order cards.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-neutral-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Grade A premium quality certification</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Direct farm-to-door or terminal dispatch</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Buyer Agent automated supplier matching</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setEnvironmentMode('demo');
                switchDemoRole('Buyer');
                navigateToTabWithGuard('dashboard');
              }}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-bold"
            >
              Test as Buyer (Demo)
            </button>
          </div>
        </div>
      </section>

      {/* 5. WATCH INSPIRING VIDEOS: Responsive Showcase */}
      <section id="videos" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956]">
            Media Showcase
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
            Watch Inspiring Agricultural Videos
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            Highlighting agricultural innovation, cold-chain resilience, and farmer success stories across Nueva Vizcaya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video 1 */}
          <div className="p-5 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-lg space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-700 group">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/GcCkQoceR64?autoplay=1&mute=1&loop=1&playlist=GcCkQoceR64&rel=0"
                title="Nueva Vizcaya Agricultural Innovation Showcase"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                Field Innovation
              </span>
              <h3 className="text-base font-black text-[#1F4B2C] mt-1.5">
                Nueva Vizcaya Vegetable Hubs & Market Logistics
              </h3>
            </div>
          </div>

          {/* Video 2 */}
          <div className="p-5 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-lg space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-700 group">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/0ujMjn4mt6U?autoplay=1&mute=1&loop=1&playlist=0ujMjn4mt6U&rel=0"
                title="Agricultural Technology & Sustainability"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                Climate & Yield Resilience
              </span>
              <h3 className="text-base font-black text-[#1F4B2C] mt-1.5">
                Smart Highland Cultivation & Produce Care
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHO DEVELOPED THIS APP: Researcher & Coaches Portfolio */}
      <section id="developers" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#C3E956] text-[#1F4B2C]">
            Research & Development
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
            Who Developed This App
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            Researcher, Developer, and Advisory Coaches behind AgriMatch NV.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white border-2 border-[#91EAAF] shadow-xl overflow-hidden flex flex-col">
            <img
              src="/assets/aistudio/Modern_Putih_dan_Kuning_Perkenalan_Anggota_Mahasiswa_Kuliah_Kerja_Nyata_Ins_20261113_100657_0000_27651e95.png"
              alt="Russel Gurat — Researcher and Developer"
              className="w-full h-auto object-cover"
            />
            <div className="p-5 flex items-center justify-between gap-3 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name="Russel Gurat"
                  role="MASTER_ADMIN"
                  sizeClass="w-11 h-11"
                  className="border-2 border-[#91EAAF]"
                />
                <div>
                  <h3 className="text-base font-black text-[#1F4B2C]">Russel Gurat</h3>
                  <p className="text-xs font-bold text-[#4D7111]">Researcher / Lead Developer</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black uppercase">
                Lead Architect
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-white border-2 border-[#91EAAF] shadow-xl overflow-hidden flex flex-col">
            <img
              src="/assets/aistudio/Modern_Putih_dan_Kuning_Perkenalan_Anggota_Mahasiswa_Kuliah_Kerja_Nyata_Ins_20261113_100746_0000_c3315e93.png"
              alt="Research Coaches — Mark Anthony C. Malubag and Marc Andrei E. Basco"
              className="w-full h-auto object-cover"
            />
            <div className="p-5 flex items-center justify-between gap-3 border-t border-neutral-100">
              <div>
                <h3 className="text-base font-black text-[#1F4B2C]">Advisory & Research Coaches</h3>
                <p className="text-xs font-bold text-[#4D7111]">
                  Mark Anthony C. Malubag & Marc Andrei E. Basco
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#C3E956]/50 text-[#1F4B2C] text-[10px] font-black uppercase">
                Coaches
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
