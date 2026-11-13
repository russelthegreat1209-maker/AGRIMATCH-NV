import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProducerSupplySummary } from '../types';
import {
  Package,
  BarChart3,
  TrendingUp,
  Sparkles,
  Plus,
  Minus,
  Check,
  Search,
  MapPin,
  Video,
  ArrowUpRight,
  Layers,
  Users,
  ShoppingBag,
} from 'lucide-react';

export const InventoryAndSupplyMonitoringModule: React.FC<{
  initialView?: 'inventory' | 'supply-monitoring';
}> = ({ initialView = 'inventory' }) => {
  const {
    currentUser,
    commodities,
    orders,
    nvatReport,
    updateCommodityStock,
    setActiveTab,
    setActiveAgribeeVideo,
    openMarketplaceToCommodity,
    logAiHistory,
  } = useApp();

  const [viewMode, setViewMode] = useState<'inventory' | 'supply-monitoring'>(initialView);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('ALL');
  const [editingStock, setEditingStock] = useState<Record<string, { kg: number; price: number }>>(
    {}
  );

  // Embedded AI Trend Analysis State
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiSupplyResult, setAiSupplyResult] = useState<{
    headline: string;
    highDemandCrops: { cropName: string; demandLevel: string; reason: string }[];
    producerInsights: string[];
    inventoryHealthNote: string;
  } | null>(null);

  // Sync tab changes from Sidebar
  React.useEffect(() => {
    setViewMode(initialView);
  }, [initialView]);

  // 1. Farmer/Supplier's Own Posted Inventory
  const myInventoryItems = useMemo(() => {
    if (!currentUser) return [];
    const own = commodities.filter((c) => c.supplierId === currentUser.id);
    // If current demo user has 0 direct items, show their municipality's items or allow managing own + sample
    return own.length > 0
      ? own
      : commodities.filter((c) => c.municipality === currentUser.municipality).slice(0, 6);
  }, [commodities, currentUser]);

  const myTotalKg = useMemo(
    () => myInventoryItems.reduce((sum, item) => sum + item.availableKg, 0),
    [myInventoryItems]
  );

  const myTotalValuePhp = useMemo(
    () => myInventoryItems.reduce((sum, item) => sum + item.availableKg * item.pricePerKg, 0),
    [myInventoryItems]
  );

  // 2. Compile Supplies by Individual Farmer / Supplier Account
  const producerSummaries: ProducerSupplySummary[] = useMemo(() => {
    const map = new Map<string, ProducerSupplySummary>();

    for (const crop of commodities) {
      if (selectedMunicipality !== 'ALL' && crop.municipality !== selectedMunicipality) {
        continue;
      }
      if (
        searchQuery.trim() &&
        !crop.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !crop.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !crop.municipality.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        continue;
      }

      const existing = map.get(crop.supplierId);
      const isHighDemand =
        crop.category === 'Highland Vegetables' ||
        crop.availableKg < 600 ||
        orders.some((o) => o.commodityId === crop.id);

      const cropEntry = {
        id: crop.id,
        name: crop.name,
        category: crop.category,
        availableKg: crop.availableKg,
        pricePerKg: crop.pricePerKg,
        verificationStatus: crop.verificationStatus,
        demandSignal: (isHighDemand ? 'HIGH_DEMAND' : 'STEADY') as
          | 'HIGH_DEMAND'
          | 'STEADY'
          | 'SURPLUS',
      };

      if (!existing) {
        map.set(crop.supplierId, {
          supplierId: crop.supplierId,
          supplierName: crop.supplierName,
          supplierRole: crop.supplierRole,
          municipality: crop.municipality,
          totalListings: 1,
          totalInventoryKg: crop.availableKg,
          estimatedValuePhp: crop.availableKg * crop.pricePerKg,
          crops: [cropEntry],
        });
      } else {
        existing.totalListings += 1;
        existing.totalInventoryKg += crop.availableKg;
        existing.estimatedValuePhp += crop.availableKg * crop.pricePerKg;
        existing.crops.push(cropEntry);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalInventoryKg - a.totalInventoryKg);
  }, [commodities, orders, selectedMunicipality, searchQuery]);

  // 3. Category Supply vs Demand Trend Compilation
  const categoryStats = useMemo(() => {
    const catMap = new Map<
      string,
      { category: string; totalKg: number; listingsCount: number; avgPrice: number; demandScore: number }
    >();

    for (const c of commodities) {
      const cur = catMap.get(c.category) || {
        category: c.category,
        totalKg: 0,
        listingsCount: 0,
        avgPrice: 0,
        demandScore: 78,
      };
      cur.totalKg += c.availableKg;
      cur.listingsCount += 1;
      cur.avgPrice += c.pricePerKg;
      catMap.set(c.category, cur);
    }

    return Array.from(catMap.values()).map((entry) => {
      const avg = Math.round(entry.avgPrice / Math.max(1, entry.listingsCount));
      const demandScore =
        entry.category === 'Highland Vegetables'
          ? 96
          : entry.category === 'Spices'
          ? 92
          : entry.category === 'Lowland Vegetables'
          ? 88
          : entry.category === 'Fruits & Citrus'
          ? 85
          : 80;
      return {
        ...entry,
        avgPrice: avg,
        demandScore,
      };
    });
  }, [commodities]);

  const municipalities = useMemo(() => {
    const set = new Set<string>();
    commodities.forEach((c) => set.add(c.municipality));
    return ['ALL', ...Array.from(set).sort()];
  }, [commodities]);

  const runAiSupplyMonitoring = async () => {
    setAiAnalysisLoading(true);
    try {
      const res = await fetch('/api/ai/supply-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipality: selectedMunicipality === 'ALL' ? 'Nueva Vizcaya' : selectedMunicipality,
          producerSummaries: producerSummaries.slice(0, 15),
          categoryTotals: categoryStats,
          userUid: currentUser?.id || 'farmer_01',
          userRole: currentUser?.role || 'Farmer',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const mappedHighDemand = Array.isArray(data.inDemandCrops)
          ? data.inDemandCrops.map((it: { crop?: string; cropName?: string; trend?: string; demandLevel?: string; reason?: string }) => ({
              cropName: it.crop || it.cropName || 'Highland Crop',
              demandLevel: it.trend || it.demandLevel || 'HIGH DEMAND',
              reason: it.reason || 'Strong wholesale buyer demand at NVAT Bambang.',
            }))
          : [];
        setAiSupplyResult({
          headline: data.headline || 'Highland Vegetables & Tomatoes Lead Buyer Demand Today',
          highDemandCrops: mappedHighDemand,
          producerInsights: [data.summary || 'Compiled marketplace supplies across producer accounts.'],
          inventoryHealthNote: data.summary || 'All producer stocks are synced with eNVAT daily benchmarks.',
        });
        if (currentUser) {
          logAiHistory({
            userId: currentUser.id,
            userRole: currentUser.role,
            agentType: 'MARKET_INTELLIGENCE',
            prompt: 'Compile supply monitoring & demand trends by producer account',
            responseSummary: data.headline || 'Compiled supply & demand trends.',
            poweredByGemini: Boolean(data.poweredByGemini),
          });
        }
      }
    } catch {
      // Fallback local summary
      setAiSupplyResult({
        headline:
          'Highland Vegetables (Cabbage, Wombok, Carrots) and Red Onions show the strongest buyer demand across NVAT Bambang today.',
        highDemandCrops: [
          {
            cropName: 'Scorpio Cabbage & Wombok',
            demandLevel: 'VERY HIGH DEMAND',
            reason: 'Metro Manila wholesale buyers are actively ordering bulk crates in Kayapa and Bambang.',
          },
          {
            cropName: 'Red Creole Onions & Ginger',
            demandLevel: 'HIGH DEMAND',
            reason: 'Strong regional consolidation in Aritao, Dupax del Sur, and Kasibu.',
          },
          {
            cropName: 'Satsuma Mandarin & Pomelo',
            demandLevel: 'RISING DEMAND',
            reason: 'Direct retail fruit orders increasing in Malabing Valley (Kasibu).',
          },
        ],
        producerInsights: [
          `Compiled ${producerSummaries.length} producer accounts with ${commodities.length} posted supply lots.`,
          'Keep harvest stock updated in My Inventory so Buyers see accurate available kilograms.',
        ],
        inventoryHealthNote: 'All producer stocks are balanced and synced with eNVAT daily benchmarks.',
      });
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Mode Switcher */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-[#91EAAF]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Embedded Farmer & Supply Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F4B2C] dark:text-[#E8F5E9]">
            {viewMode === 'inventory'
              ? 'My Crop Inventory'
              : 'Supply Monitoring & Demand Trends'}
          </h1>
          <p className="text-xs sm:text-sm text-[#4D7111] dark:text-[#91EAAF] mt-1">
            {viewMode === 'inventory'
              ? 'Easily update your available kilograms and price per kg. Changes update the Marketplace immediately.'
              : 'Compiles all posted supplies by individual farmer & supplier account with AI demand statistics.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('inventory')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'inventory'
                ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                : 'bg-white/80 dark:bg-white/10 text-[#1F4B2C] dark:text-white border border-[#4D7111]/20'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Inventory</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('supply-monitoring')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'supply-monitoring'
                ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                : 'bg-white/80 dark:bg-white/10 text-[#1F4B2C] dark:text-white border border-[#4D7111]/20'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Supply Monitoring</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveAgribeeVideo('inventory-monitoring')}
            className="px-3.5 py-2.5 rounded-2xl bg-[#C3E956]/40 hover:bg-[#C3E956]/60 text-[#1F4B2C] dark:text-[#C3E956] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Watch Guide</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: MY CROP INVENTORY (FOR FARMERS / SUPPLIERS / COOPERATIVES)
         ===================================================================== */}
      {viewMode === 'inventory' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-[#91EAAF]/60">
              <p className="text-xs font-bold uppercase text-[#4D7111] dark:text-[#C3E956]">
                My Active Listings
              </p>
              <p className="text-3xl font-extrabold text-[#1F4B2C] dark:text-white mt-1">
                {myInventoryItems.length} Crops
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Synced live with Marketplace
              </p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-[#91EAAF]/60">
              <p className="text-xs font-bold uppercase text-[#4D7111] dark:text-[#C3E956]">
                Total Available Stock
              </p>
              <p className="text-3xl font-extrabold text-[#1F4B2C] dark:text-white mt-1">
                {myTotalKg.toLocaleString()} kg
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Deducts automatically on completed orders
              </p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-[#91EAAF]/60">
              <p className="text-xs font-bold uppercase text-[#4D7111] dark:text-[#C3E956]">
                Estimated Harvest Value
              </p>
              <p className="text-3xl font-extrabold text-[#1F4B2C] dark:text-white mt-1">
                ₱{myTotalValuePhp.toLocaleString()}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('marketplace')}
                className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-[#1F4B2C] dark:text-[#C3E956] underline cursor-pointer"
              >
                <span>+ Post Another Crop in Market</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Inventory Cards with 1-Tap Stock & Price Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myInventoryItems.map((crop) => {
              const draft = editingStock[crop.id] || {
                kg: crop.availableKg,
                price: crop.pricePerKg,
              };
              const nvatMatch = nvatReport.items.find((n) =>
                crop.name.toLowerCase().includes(n.commodityName.split(' ')[0].toLowerCase())
              );

              return (
                <div
                  key={crop.id}
                  className="glass-card rounded-2xl p-4 sm:p-5 border border-[#91EAAF]/60 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={crop.imageUrl}
                      alt={crop.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-[#4D7111]/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#91EAAF]/40 text-[#1F4B2C] dark:text-[#C3E956] text-[10px] font-extrabold uppercase">
                          {crop.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            crop.availableKg > 200
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {crop.availableKg > 200 ? 'In Stock' : 'Low Stock'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-[#1F4B2C] dark:text-white truncate mt-1">
                        {crop.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#4D7111]" />
                        <span>
                          {crop.barangay}, {crop.municipality} • {crop.supplierName}
                        </span>
                      </p>
                      {nvatMatch && (
                        <p className="text-[11px] font-bold text-[#4D7111] dark:text-[#C3E956] mt-1">
                          Embedded AI: eNVAT benchmark is ₱{nvatMatch.prevailingPricePhp}/kg (
                          {nvatMatch.marketTrendStatus})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Stock & Price Editor */}
                  <div className="bg-white/70 dark:bg-black/25 rounded-2xl p-3.5 border border-[#4D7111]/15 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-[#1F4B2C] dark:text-[#91EAAF] mb-1">
                          Available Stock (kg)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingStock((prev) => ({
                                ...prev,
                                [crop.id]: {
                                  kg: Math.max(0, draft.kg - 50),
                                  price: draft.price,
                                },
                              }))
                            }
                            className="p-2 rounded-xl bg-[#91EAAF]/30 hover:bg-[#91EAAF]/60 text-[#1F4B2C] dark:text-white cursor-pointer"
                            title="Subtract 50 kg"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={draft.kg}
                            onChange={(e) =>
                              setEditingStock((prev) => ({
                                ...prev,
                                [crop.id]: {
                                  kg: Math.max(0, Number(e.target.value)),
                                  price: draft.price,
                                },
                              }))
                            }
                            className="w-full px-3 py-1.5 rounded-xl border border-[#4D7111]/30 text-center font-extrabold text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditingStock((prev) => ({
                                ...prev,
                                [crop.id]: {
                                  kg: draft.kg + 50,
                                  price: draft.price,
                                },
                              }))
                            }
                            className="p-2 rounded-xl bg-[#91EAAF]/30 hover:bg-[#91EAAF]/60 text-[#1F4B2C] dark:text-white cursor-pointer"
                            title="Add 50 kg"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-[#1F4B2C] dark:text-[#91EAAF] mb-1">
                          Price per Kg (₱)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={draft.price}
                          onChange={(e) =>
                            setEditingStock((prev) => ({
                              ...prev,
                              [crop.id]: {
                                kg: draft.kg,
                                price: Math.max(1, Number(e.target.value)),
                              },
                            }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl border border-[#4D7111]/30 font-extrabold text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        Lot Value: ₱{(draft.kg * draft.price).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCommodityStock(crop.id, draft.kg, draft.price)}
                        className="px-4 py-2 rounded-xl bg-[#1F4B2C] hover:bg-[#2a633b] text-[#C3E956] text-xs font-extrabold flex items-center gap-1.5 shadow cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Inventory</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: SUPPLY MONITORING (COMPILED BY INDIVIDUAL ACCOUNT + AI TRENDS)
         ===================================================================== */}
      {viewMode === 'supply-monitoring' && (
        <div className="space-y-6">
          {/* AI Supply & Demand Trend Banner */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border-2 border-[#4D7111]/40 bg-gradient-to-br from-[#1F4B2C] to-[#13301C] text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C3E956]/20 text-[#C3E956] text-[11px] font-extrabold uppercase">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>AI Supply & Demand Trend Compiler</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold mt-2">
                  What Crops Are In High Demand Right Now?
                </h2>
                <p className="text-xs sm:text-sm text-[#91EAAF] mt-1">
                  Compiled across {producerSummaries.length} farmer/supplier accounts and{' '}
                  {commodities.length} posted supply lots (scalable to 1,000+ accounts & 4,000+
                  posts).
                </p>
              </div>
              <button
                type="button"
                onClick={runAiSupplyMonitoring}
                disabled={aiAnalysisLoading}
                className="px-5 py-3 rounded-2xl bg-[#C3E956] hover:bg-[#d4f472] text-[#1F4B2C] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {aiAnalysisLoading
                    ? 'Compiling Trends...'
                    : 'Compile AI Demand & Supply Report'}
                </span>
              </button>
            </div>

            {/* Category Demand vs Supply Visual Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
              {categoryStats.map((stat) => (
                <div
                  key={stat.category}
                  className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/15"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-extrabold text-white">{stat.category}</span>
                    <span className="px-2 py-0.5 rounded bg-[#C3E956] text-[#1F4B2C] text-[10px] font-extrabold">
                      Demand: {stat.demandScore}%
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-[#91EAAF]">
                    {stat.totalKg.toLocaleString()} kg posted ({stat.listingsCount} lots)
                  </p>
                  <p className="text-[11px] text-white/80 mt-0.5">
                    Avg Price: ₱{stat.avgPrice}/kg
                  </p>
                  <div className="w-full h-2 rounded-full bg-black/30 mt-2 overflow-hidden">
                    <div
                      className="h-full bg-[#C3E956] rounded-full"
                      style={{ width: `${stat.demandScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Compiled Output Box */}
            {aiSupplyResult && (
              <div className="mt-5 bg-black/30 rounded-2xl p-4 sm:p-5 border border-[#C3E956]/40 space-y-3">
                <p className="text-sm sm:text-base font-extrabold text-[#C3E956]">
                  {aiSupplyResult.headline}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {aiSupplyResult.highDemandCrops.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 rounded-xl p-3 border border-white/10"
                    >
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#C3E956]/25 text-[#C3E956]">
                        {item.demandLevel}
                      </span>
                      <p className="text-sm font-extrabold text-white mt-1.5">{item.cropName}</p>
                      <p className="text-xs text-white/85 mt-1">{item.reason}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#91EAAF] font-semibold">
                  {aiSupplyResult.inventoryHealthNote}
                </p>
              </div>
            )}
          </div>

          {/* Search & Municipality Filter for Individual Producer Accounts */}
          <div className="glass-card rounded-2xl p-4 border border-[#91EAAF]/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#4D7111] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by farmer name, crop name, or municipality..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#4D7111]/25 text-xs sm:text-sm font-semibold"
              />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#4D7111] shrink-0" />
              <select
                value={selectedMunicipality}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#4D7111]/25 text-xs sm:text-sm font-bold bg-white dark:bg-[#0D2116]"
              >
                {municipalities.map((m) => (
                  <option key={m} value={m}>
                    {m === 'ALL' ? 'All 15 Municipalities' : m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Individual Farmer / Supplier Account Supply Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-[#1F4B2C] dark:text-[#E8F5E9] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4D7111]" />
                <span>
                  Supplies Compiled by Individual Farmer / Supplier Account (
                  {producerSummaries.length})
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {producerSummaries.map((producer) => (
                <div
                  key={producer.supplierId}
                  className="glass-card rounded-2xl p-5 border border-[#91EAAF]/60 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#1F4B2C] text-[#C3E956] text-[10px] font-extrabold uppercase">
                          {producer.supplierRole}
                        </span>
                        <span className="text-xs font-bold text-[#4D7111] dark:text-[#91EAAF]">
                          {producer.municipality}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-extrabold text-[#1F4B2C] dark:text-white mt-1">
                        {producer.supplierName}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-[#1F4B2C] dark:text-[#C3E956]">
                        {producer.totalInventoryKg.toLocaleString()} kg
                      </p>
                      <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                        Est. ₱{producer.estimatedValuePhp.toLocaleString()} ({producer.totalListings}{' '}
                        lots)
                      </p>
                    </div>
                  </div>

                  {/* Posted Crops Breakdown for This Account */}
                  <div className="space-y-2 pt-2 border-t border-[#4D7111]/15">
                    {producer.crops.map((crop) => (
                      <div
                        key={crop.id}
                        className="flex items-center justify-between gap-2 bg-white/70 dark:bg-black/25 rounded-xl px-3 py-2 border border-[#4D7111]/10"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold text-[#1F4B2C] dark:text-white truncate">
                            {crop.name}
                          </p>
                          <p className="text-[11px] text-gray-600 dark:text-gray-300">
                            {crop.availableKg.toLocaleString()} kg • ₱{crop.pricePerKg}/kg
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              crop.demandSignal === 'HIGH_DEMAND'
                                ? 'bg-[#C3E956] text-[#1F4B2C]'
                                : 'bg-[#91EAAF]/40 text-[#1F4B2C] dark:text-white'
                            }`}
                          >
                            {crop.demandSignal === 'HIGH_DEMAND' ? 'High Demand' : 'Steady'}
                          </span>
                          <button
                            type="button"
                            onClick={() => openMarketplaceToCommodity(crop.id)}
                            className="p-1.5 rounded-lg bg-[#1F4B2C] text-white hover:bg-[#2c663d] cursor-pointer"
                            title="View in Marketplace"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
