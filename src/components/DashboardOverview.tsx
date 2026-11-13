import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MUNICIPALITIES_WEATHER } from '../data/seedData';
import {
  TrendingUp,
  Package,
  CheckCircle2,
  DollarSign,
  Sun,
  Droplets,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Cpu,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    currentUser,
    counters,
    commodities,
    orders,
    navigateToTabWithGuard,
    setIsDemoSwitcherOpen,
    t,
  } = useApp();

  const [selectedTown, setSelectedTown] = useState<string>(currentUser?.municipality || 'Bambang');
  const weather = MUNICIPALITIES_WEATHER[selectedTown] || MUNICIPALITIES_WEATHER['Bambang'];

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalVolumeKg = orders.reduce((acc, cur) => acc + cur.quantityKg, 0);
  const totalRevenuePhp = orders.reduce((acc, cur) => acc + cur.totalAmountPhp, 0);

  return (
    <div className="space-y-6 pb-16 text-left animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C3E956]" />
            {t.commandCenterBadge}
          </div>
          <h2 className="text-2xl font-black text-[#1F4B2C] tracking-tight">
            {t.welcomeBack}, {currentUser?.name || t.guestStakeholder}!
          </h2>
          <p className="text-xs text-neutral-600 font-medium">
            {t.roleLabel}: <span className="font-bold text-[#4D7111]">{currentUser?.role || t.guestStakeholder}</span> • {t.farmHubLabel}: <span className="font-bold text-[#1F4B2C]">{currentUser?.municipality || 'Nueva Vizcaya'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDemoSwitcherOpen(true)}
            className="px-4 py-2 rounded-full btn-sprout text-xs font-bold shadow-xs hover:scale-105 transition-transform"
          >
            {t.switchAccountBtn}
          </button>
        </div>
      </div>

      {/* 1. EXECUTIVE KPI SUMMARY TILES: 2x2 Metric Grid with trend pills & striped area chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Total Shipments / Volume (kg) */}
        <div className="glass-light p-4 rounded-3xl border border-[#91EAAF] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {t.kpiVolumeTraded}
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#1F4B2C] flex items-center justify-center font-bold">
              <Package className="w-4 h-4 text-[#4D7111]" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#1F4B2C] font-mono">
              {(totalVolumeKg + 11400).toLocaleString()} kg
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +4.2% {t.vsLastMonth}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium">Highland Cabbage & Onion dominance</p>
        </div>

        {/* Tile 2: Total Orders */}
        <div className="glass-light p-4 rounded-3xl border border-[#91EAAF] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {t.kpiActiveOrders}
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#1F4B2C] font-mono">
              {orders.length + 86} Orders
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +1.3% {t.vsLastMonth}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium">Dual-Handshake in progress</p>
        </div>

        {/* Tile 3: Market Revenue / Value (PHP) */}
        <div className="glass-light p-4 rounded-3xl border border-[#91EAAF] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {t.kpiMarketRevenue}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4 text-blue-700" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#1F4B2C] font-mono">
              ₱{(totalRevenuePhp + 482000).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +8.7% gross settlement
              </span>
            </div>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium">Escrow protected trade ledger</p>
        </div>

        {/* Tile 4: Completed Deliveries */}
        <div className="glass-light p-4 rounded-3xl border border-[#91EAAF] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {t.kpiCompletedDeals}
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#1F4B2C] font-mono">
              {counters.totalCompletedTransactions} Handshakes
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center">
                100% verified fulfillment
              </span>
            </div>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium">Zero-dispute resolution</p>
        </div>
      </div>

      {/* 2. WEATHER TELEMETRY WIDGET & 3. CROP & MARKET HEALTH CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Telemetry Widget */}
        <div className="glass-light p-6 rounded-3xl border-2 border-[#91EAAF] shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#4D7111]">
                <Sun className="w-3 h-3 text-[#4D7111]" />
                Municipal Weather Telemetry
              </div>
              <h3 className="text-lg font-black text-[#1F4B2C]">
                PAGASA Sensor: {selectedTown}
              </h3>
            </div>

            <select
              value={selectedTown}
              onChange={(e) => setSelectedTown(e.target.value)}
              className="px-2.5 py-1 text-xs font-bold rounded-xl border border-neutral-300 bg-white text-[#1F4B2C]"
            >
              {Object.keys(MUNICIPALITIES_WEATHER).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-5xl font-black text-[#1F4B2C]">{weather.temperatureC}°C</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#4D7111] text-[#F4FFFC] text-xs font-bold">
                  {weather.condition}
                </span>
                <span className="text-xs text-neutral-500 font-medium">Feels like {weather.feelsLikeC}°C</span>
              </div>
            </div>

            {/* Sparkline cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-[#91EAAF]/60">
                <span className="text-[10px] text-neutral-400 font-bold block">UV Index</span>
                <span className="text-sm font-black text-[#1F4B2C]">{weather.uvIndex} / 10</span>
                <div className="h-4 flex items-end gap-0.5 mt-1">
                  {weather.uvSparkline.map((v, i) => (
                    <div key={i} className="flex-1 bg-amber-400 rounded-t-xs" style={{ height: `${(v / 10) * 100}%` }} />
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-[#91EAAF]/60">
                <span className="text-[10px] text-neutral-400 font-bold block">Humidity</span>
                <span className="text-sm font-black text-[#1F4B2C]">{weather.humidityPercent}%</span>
                <div className="h-4 flex items-end gap-0.5 mt-1">
                  {weather.humiditySparkline.map((v, i) => (
                    <div key={i} className="flex-1 bg-cyan-500 rounded-t-xs" style={{ height: `${(v / 100) * 100}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Thermal Gradient Bar (09 AM to 02 PM) with vertical indicator needle */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] font-bold text-neutral-600">
              <span>Hourly Gradient (25°C – 31°C)</span>
              <span className="text-[#4D7111] font-mono">Peak Midday Radiation</span>
            </div>
            <div className="relative h-6 rounded-full bg-gradient-to-r from-[#91EAAF] via-[#C3E956] to-amber-400 p-0.5 shadow-inner">
              <div className="absolute inset-0 flex justify-between px-3 items-center text-[9px] font-black text-[#1F4B2C]">
                <span>09 AM</span>
                <span>10 AM</span>
                <span>12 PM</span>
                <span>01 PM</span>
                <span>02 PM</span>
              </div>
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white border border-neutral-700 shadow-md rounded-full -translate-x-1/2"
                style={{ left: '55%' }}
              />
            </div>
          </div>
        </div>

        {/* Crop & Market Health Cards: capsule bar charts for Mon-Sun */}
        <div className="glass-light p-6 rounded-3xl border-2 border-[#91EAAF] shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
                  Live Crop & Market Health
                </span>
              </div>
              <h3 className="text-lg font-black text-[#1F4B2C]">
                Terminal Harvest Quality Index
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              94% Authenticity Score
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-neutral-400">Supply Fulfillment</span>
              <div className="text-2xl font-black text-[#1F4B2C] mt-0.5">75% On-Time</div>
              <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-gradient-to-r from-[#4D7111] to-[#C3E956] rounded-full w-3/4" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-neutral-400">Days to Next Harvest</span>
              <div className="text-2xl font-black text-[#4D7111] mt-0.5">3 Days</div>
              <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-[#1F4B2C] rounded-full w-4/5" />
              </div>
            </div>
          </div>

          {/* Capsule Bar Charts (Sat, Sun, Mon, Tue, Wed, Thu, Fri) */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase text-neutral-500 mb-2 block">
              Weekly NVAT Inflow Volume (Mon – Sun)
            </span>
            <div className="h-24 flex items-end justify-between gap-2 pt-2">
              {[
                { day: 'Sat', val: 75 },
                { day: 'Sun', val: 60 },
                { day: 'Mon', val: 95 },
                { day: 'Tue', val: 85 },
                { day: 'Wed', val: 90 },
                { day: 'Thu', val: 70 },
                { day: 'Fri', val: 80 },
              ].map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-neutral-100 rounded-full h-16 flex items-end justify-center p-0.5">
                    <div
                      className={`w-full rounded-full ${i % 2 === 0 ? 'bg-[#1F4B2C]' : 'bg-[#4D7111]'}`}
                      style={{ height: `${b.val}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-500">{b.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Module Fast-Jumps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigateToTabWithGuard('gis')}
          className="p-5 rounded-3xl glass-light border border-[#91EAAF] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-[#1F4B2C] text-[#C3E956]">
              <MapPin className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#1F4B2C] group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-base font-black text-[#1F4B2C]">GIS Spatial Map</h4>
          <p className="text-xs text-neutral-600 mt-1">
            Explore 10m–100km radius circles and live road route polylines.
          </p>
        </div>

        <div
          onClick={() => navigateToTabWithGuard('marketplace')}
          className="p-5 rounded-3xl glass-light border border-[#91EAAF] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-[#4D7111] text-[#F4FFFC]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#4D7111] group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-base font-black text-[#1F4B2C]">Commodity Marketplace</h4>
          <p className="text-xs text-neutral-600 mt-1">
            Order verified highland and lowland harvests directly from growers.
          </p>
        </div>

        <div
          onClick={() => navigateToTabWithGuard('decision-support')}
          className="p-5 rounded-3xl glass-light border border-[#91EAAF] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-[#1F4B2C] text-[#91EAAF]">
              <Cpu className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#1F4B2C] group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-base font-black text-[#1F4B2C]">Multi-Agent Decision Support</h4>
          <p className="text-xs text-neutral-600 mt-1">
            5-Agent coordination mesh, automated matching, and NVAT intelligence.
          </p>
        </div>
      </div>
    </div>
  );
};
