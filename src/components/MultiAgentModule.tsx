import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  aggregateReactions,
  calculateSupplierRecommendationScore,
  canAccessAgent,
  computeMunicipalSupplyDistribution,
  estimateDeliveryEta,
  formatDistance,
  haversineDistanceKm,
  NV_COORDS_BY_MUNICIPALITY,
  rankCommoditiesForBuyer,
} from '../utils/agriMath';
import { AgentDomain, BuyerNeedCriteria } from '../types';
import {
  Cpu,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ShieldAlert,
  Zap,
  ArrowLeftRight,
  Lock,
  ExternalLink,
  Search,
  Tractor,
  ShoppingCart,
  Package,
  BarChart3,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  History,
  FileText,
} from 'lucide-react';

const AGENT_DOMAINS: {
  id: AgentDomain;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'Farmer', label: 'Farmer Agent', subtitle: 'Crop intake, grading & farm logistics', icon: Tractor },
  { id: 'Buyer', label: 'Buyer Agent', subtitle: 'Need matching & supplier reliability', icon: ShoppingCart },
  { id: 'Supplier', label: 'Supplier Agent', subtitle: 'Coordinated demand & stock hub', icon: Package },
  { id: 'Market', label: 'Market Agent', subtitle: 'Supply pie, trends & search grounding', icon: BarChart3 },
  { id: 'Admin', label: 'Admin Agent', subtitle: 'Master audit, AI ledger & reports', icon: ShieldCheck },
];

function buildPieSlices(
  data: Array<{ municipality: string; percentage: number; color: string; totalKg: number }>
) {
  let cumulativePercent = 0;
  const radius = 64;
  const center = 84;

  return data.map((slice) => {
    const startAngle = (cumulativePercent / 100) * 2 * Math.PI - Math.PI / 2;
    const pct = slice.percentage > 0 ? slice.percentage : 0;
    cumulativePercent += pct;
    const endAngle = (cumulativePercent / 100) * 2 * Math.PI - Math.PI / 2;

    if (pct >= 99.9) {
      return { ...slice, isFullCircle: true, d: '', center, radius };
    }

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const largeArcFlag = pct > 50 ? 1 : 0;

    const d = [
      `M ${center} ${center}`,
      `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      'Z',
    ].join(' ');

    return { ...slice, isFullCircle: false, d, center, radius };
  });
}

export const MultiAgentModule: React.FC = () => {
  const {
    currentUser,
    commodities,
    accounts,
    agentPackets,
    triggerAgentPacket,
    setActiveOrderModalItem,
    addNotification,
    nvatReport,
    aiHistory,
    logAiHistory,
    moderationReports,
    verificationAuditLogs,
    openMarketplaceToCommodity,
    navigateToTabWithGuard,
    setActiveTab,
    setIsAdminPasswordModalOpen,
  } = useApp();

  // Top sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'agents' | 'decision-support' | 'coordination-hub'>('agents');

  // Active 5-domain workbench selection
  const defaultDomain: AgentDomain = useMemo(() => {
    if (canAccessAgent(currentUser?.role, 'Farmer')) return 'Farmer';
    if (canAccessAgent(currentUser?.role, 'Buyer')) return 'Buyer';
    if (canAccessAgent(currentUser?.role, 'Supplier')) return 'Supplier';
    return 'Market';
  }, [currentUser?.role]);

  const [selectedAgent, setSelectedAgent] = useState<AgentDomain>(defaultDomain);

  // Decision support 5 modules sub-tab
  const [dsModule, setDsModule] = useState<'recommendations' | 'matching' | 'inventory' | 'scheduling' | 'policy'>('recommendations');

  // Intelligent recommendations search
  const [selectedCropQuery, setSelectedCropQuery] = useState('Highland Cabbage');
  const [targetVolumeKg] = useState(500);
  const [isCoordinating, setIsCoordinating] = useState(false);
  const [roleDirective, setRoleDirective] = useState('Optimize morning harvest dispatch and NVAT Bambang buyer matching.');
  const [roleAiResult, setRoleAiResult] = useState<{
    fromAgent: string;
    toAgent: string;
    intent: string;
    reasoning: string;
    priorityHub?: string;
    confidenceScore?: number;
  } | null>(null);

  // Market Agent State (Search Grounding + Trend Search)
  const [marketCommodityQuery, setMarketCommodityQuery] = useState('Highland Cabbage');
  const [marketMuniQuery, setMarketMuniQuery] = useState('Bambang');
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [marketIntelResult, setMarketIntelResult] = useState<{
    summary: string;
    sources: Array<{ title: string; url: string }>;
    poweredByGemini: boolean;
  } | null>(null);

  // Buyer Agent Need Finder State
  const [buyerCriteria, setBuyerCriteria] = useState<BuyerNeedCriteria>({
    neededSupply: 'Cabbage',
    neededDate: new Date().toISOString().split('T')[0],
    destinationMunicipality: currentUser?.municipality || 'Bayombong',
    preferredGrade: 'ANY',
    targetKg: 500,
  });
  const [buyerRationale, setBuyerRationale] = useState<string>('');
  const [isBuyerLoading, setIsBuyerLoading] = useState(false);

  // Supplier Agent Demand Forecast State
  const [isSupplierLoading, setIsSupplierLoading] = useState(false);
  const [supplierForecast, setSupplierForecast] = useState<{
    forecastSummary: string;
    priorityCrops: Array<{
      crop: string;
      demandLevel: string;
      suggestedStockKg: number;
      targetHub: string;
    }>;
    poweredByGemini: boolean;
  } | null>(null);

  const municipalDistribution = useMemo(
    () => computeMunicipalSupplyDistribution(commodities),
    [commodities]
  );

  const pieSlices = useMemo(
    () => buildPieSlices(municipalDistribution),
    [municipalDistribution]
  );

  const buyerTopMatches = useMemo(
    () => rankCommoditiesForBuyer(commodities, accounts, buyerCriteria).slice(0, 3),
    [commodities, accounts, buyerCriteria]
  );

  const supplierOwnInventory = useMemo(() => {
    const mine = commodities.filter((c) => c.supplierId === currentUser?.id);
    return mine.length > 0 ? mine : commodities.filter((c) => c.verificationStatus !== 'REJECTED').slice(0, 6);
  }, [commodities, currentUser?.id]);

  // Compute composite weighted supplier ranking scores for Decision Support
  const scoredSuppliers = commodities
    .filter((c) => c.name.toLowerCase().includes(selectedCropQuery.toLowerCase()) || selectedCropQuery === 'ALL')
    .map((crop) => {
      const userLat = currentUser?.lat || 16.3861;
      const userLng = currentUser?.lng || 121.1065;
      const dist = haversineDistanceKm(userLat, userLng, crop.lat, crop.lng);

      const score = calculateSupplierRecommendationScore({
        itemPrice: crop.pricePerKg,
        benchmarkPrice: 35,
        distanceKm: dist,
        maxDistanceThresholdKm: 80,
        isVerified: crop.verificationStatus === 'VERIFIED',
        aiAuthenticityScore: crop.aiAuthenticityScore,
        availableKg: crop.availableKg,
        targetKg: targetVolumeKg,
      });

      return { crop, dist, score };
    })
    .sort((a, b) => b.score - a.score);

  const openBuyerRequests = [
    {
      id: 'req-1',
      buyerName: 'Metro Balintawak Bulk Buyers Corp.',
      commodity: 'Highland Cabbage',
      targetKg: 3000,
      maxPrice: 35,
      location: 'Bambang / Bayombong Pickup',
    },
    {
      id: 'req-2',
      buyerName: 'Isabela-Vizcaya Supermarket Chain',
      commodity: 'Satsuma Mandarin Citrus',
      targetKg: 1500,
      maxPrice: 75,
      location: 'Solano Depot Delivery',
    },
    {
      id: 'req-3',
      buyerName: 'Solano Farm-to-Table Restaurant Group',
      commodity: 'Broccoli',
      targetKg: 400,
      maxPrice: 85,
      location: 'Solano Central Branch',
    },
  ];

  const normalizeAgentName = (
    raw?: string,
    fallbackRole?: string
  ): 'Farmer Agent' | 'Buyer Agent' | 'Supplier Agent' | 'Market Agent' | 'Admin Agent' => {
    const val = (raw || fallbackRole || '').toLowerCase();
    if (val.includes('buyer')) return 'Buyer Agent';
    if (val.includes('supplier')) return 'Supplier Agent';
    if (val.includes('market') || val.includes('cooperative')) return 'Market Agent';
    if (val.includes('admin') || val.includes('government') || val.includes('master')) return 'Admin Agent';
    return 'Farmer Agent';
  };

  const handleRunAgentCoordination = async (customQuery?: string, domainOverride?: AgentDomain) => {
    setIsCoordinating(true);
    const activeRole = domainOverride || currentUser?.role || 'Farmer';
    const mappedAgent = normalizeAgentName(domainOverride, activeRole);
    const activeMuni = currentUser?.municipality || 'Kayapa';
    const directive = customQuery || roleDirective;
    const marketSnapshot = commodities
      .slice(0, 4)
      .map((c) => `${c.name} (${c.municipality}): PHP ${c.pricePerKg}/kg, ${c.availableKg}kg`)
      .join('; ');

    try {
      const res = await fetch('/api/ai/multi-agent-coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: activeRole,
          municipality: activeMuni,
          query: directive,
          marketSnapshot,
          userUid: currentUser?.id || 'guest',
        }),
      });
      const data = res.ok ? await res.json() : null;
      const packet = {
        fromAgent: normalizeAgentName(data?.fromAgent, mappedAgent),
        toAgent: normalizeAgentName(data?.toAgent, 'Market Agent'),
        intent: data?.intent || 'LIVE_COORDINATION_DISPATCH',
        payload: {
          timestamp: new Date().toISOString(),
          stakeholder: currentUser?.name || 'Stakeholder',
          municipality: activeMuni,
          reasoning:
            data?.reasoning ||
            `Matched ${activeMuni} stock with NVAT Bambang demand corridor.`,
          ...(data?.payload || {}),
        },
      };
      triggerAgentPacket(packet);
      setRoleAiResult({
        fromAgent: packet.fromAgent,
        toAgent: packet.toAgent,
        intent: packet.intent,
        reasoning: packet.payload.reasoning,
        priorityHub: packet.payload.priorityHub,
        confidenceScore: packet.payload.confidenceScore,
      });
      logAiHistory({
        userId: currentUser?.id || 'guest',
        userRole: currentUser?.role || 'Farmer',
        agentType: packet.fromAgent,
        prompt: directive,
        responseSummary: packet.payload.reasoning,
        poweredByGemini: Boolean(data?.poweredByGemini),
      });
      addNotification(`${packet.fromAgent} coordination packet generated and logged.`, 'success');
    } catch {
      triggerAgentPacket({
        fromAgent: mappedAgent,
        toAgent: 'Market Agent',
        intent: 'LOCAL_SYNC_PING',
        payload: {
          timestamp: new Date().toISOString(),
          municipality: activeMuni,
          directive,
        },
      });
      addNotification('Coordination ping logged to mesh.', 'info');
    } finally {
      setIsCoordinating(false);
    }
  };

  const handleRunMarketGrounding = async () => {
    setIsMarketLoading(true);
    try {
      const res = await fetch('/api/ai/market-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: marketCommodityQuery,
          municipality: marketMuniQuery,
          userUid: currentUser?.id || 'guest',
          userRole: currentUser?.role || 'Farmer',
        }),
      });
      const data = await res.json();
      setMarketIntelResult({
        summary: data.summary,
        sources: Array.isArray(data.sources) ? data.sources : [],
        poweredByGemini: Boolean(data.poweredByGemini),
      });
      logAiHistory({
        userId: currentUser?.id || 'guest',
        userRole: currentUser?.role || 'Farmer',
        agentType: 'Market Agent',
        prompt: `Search-grounded assessment: ${marketCommodityQuery} (${marketMuniQuery})`,
        responseSummary: data.summary || 'Market telemetry computed.',
        metadata: { sources: data.sources },
        poweredByGemini: Boolean(data.poweredByGemini),
      });
      triggerAgentPacket({
        fromAgent: 'Market Agent',
        toAgent: 'Buyer Agent',
        intent: 'MARKET_SEARCH_GROUNDING_SYNC',
        payload: {
          commodity: marketCommodityQuery,
          municipality: marketMuniQuery,
          sourcesCount: data.sources?.length || 0,
        },
      });
      addNotification('Market Agent search-grounded assessment updated.', 'success');
    } catch {
      addNotification('Unable to fetch Market Agent assessment.', 'alert');
    } finally {
      setIsMarketLoading(false);
    }
  };

  const handleRunBuyerRecommend = async () => {
    setIsBuyerLoading(true);
    const summaryText = buyerTopMatches
      .map(
        (m, i) =>
          `#${i + 1} ${m.commodity.name} by ${m.commodity.supplierName} (${m.commodity.municipality}, PHP ${m.commodity.pricePerKg}/kg, Score ${m.score}%, ${m.etaLabel})`
      )
      .join(' | ');
    try {
      const res = await fetch('/api/ai/buyer-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neededSupply: buyerCriteria.neededSupply,
          municipality: buyerCriteria.destinationMunicipality,
          qualityGrade: buyerCriteria.preferredGrade,
          topMatchesSummary: summaryText,
          userUid: currentUser?.id || 'buyer',
          userRole: currentUser?.role || 'Buyer',
        }),
      });
      const data = await res.json();
      setBuyerRationale(data.rationale || 'Top 3 supplier matches computed.');
      logAiHistory({
        userId: currentUser?.id || 'buyer',
        userRole: currentUser?.role || 'Buyer',
        agentType: 'Buyer Agent',
        prompt: `Top 3 match for ${buyerCriteria.neededSupply || 'produce'} to ${buyerCriteria.destinationMunicipality}`,
        responseSummary: data.rationale || 'Top 3 ranked.',
        poweredByGemini: Boolean(data.poweredByGemini),
      });
    } catch {
      setBuyerRationale('Ranked verified suppliers closest to destination with zero moderation strikes.');
    } finally {
      setIsBuyerLoading(false);
    }
  };

  const handleRunSupplierDemand = async () => {
    setIsSupplierLoading(true);
    const invSummary = supplierOwnInventory
      .slice(0, 5)
      .map((c) => `${c.name} (${c.availableKg}kg @ PHP ${c.pricePerKg}/kg in ${c.municipality})`)
      .join('; ');
    const demandSummary = openBuyerRequests
      .map((r) => `${r.commodity}: ${r.targetKg}kg <= PHP ${r.maxPrice}/kg`)
      .join('; ');

    try {
      const res = await fetch('/api/ai/supplier-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipality: currentUser?.municipality || 'Bambang',
          inventorySummary: invSummary,
          buyerDemandSummary: demandSummary,
          userUid: currentUser?.id || 'supplier',
          userRole: currentUser?.role || 'Supplier',
        }),
      });
      const data = await res.json();
      setSupplierForecast({
        forecastSummary: data.forecastSummary,
        priorityCrops: Array.isArray(data.priorityCrops) ? data.priorityCrops : [],
        poweredByGemini: Boolean(data.poweredByGemini),
      });
      logAiHistory({
        userId: currentUser?.id || 'supplier',
        userRole: currentUser?.role || 'Supplier',
        agentType: 'Supplier Agent',
        prompt: `Demand coordination for ${currentUser?.municipality || 'Bambang'}`,
        responseSummary: data.forecastSummary,
        poweredByGemini: Boolean(data.poweredByGemini),
      });
      triggerAgentPacket({
        fromAgent: 'Supplier Agent',
        toAgent: 'Market Agent',
        intent: 'DEMAND_STOCK_ALLOCATION',
        payload: {
          municipality: currentUser?.municipality || 'Bambang',
          priorityCropsCount: data.priorityCrops?.length || 0,
        },
      });
      addNotification('Supplier & Market Agents synchronized demand forecast.', 'success');
    } catch {
      addNotification('Unable to generate Supplier demand forecast.', 'alert');
    } finally {
      setIsSupplierLoading(false);
    }
  };

  // Commodity municipal price comparison for Market Agent
  const filteredMarketCommodities = useMemo(() => {
    const q = marketCommodityQuery.trim().toLowerCase();
    return commodities.filter((c) => {
      if (c.verificationStatus === 'REJECTED') return false;
      if (!q || q === 'all') return true;
      return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    });
  }, [commodities, marketCommodityQuery]);

  const isSelectedDomainAccessible = canAccessAgent(currentUser?.role, selectedAgent);

  // Unused import guard check
  void aggregateReactions;
  void estimateDeliveryEta;

  return (
    <div className="space-y-6 pb-16 text-left animate-fade-in">
      {/* Top Banner */}
      <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5 text-[#C3E956]" />
            Role-Guarded 5-Agent Agricultural AI Suite
          </div>
          <h2 className="text-2xl font-black text-[#1F4B2C] tracking-tight">
            AgriMatch NV Multi-Agent AI Hub
          </h2>
          <p className="text-xs text-neutral-600 font-medium">
            Active Role: <span className="font-black text-[#1F4B2C]">{currentUser?.role || 'Guest'}</span> • Select an agent workbench tailored to your stakeholder permissions
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex bg-neutral-100 p-1 rounded-full border border-neutral-200 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('agents')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'agents'
                ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            5 AI Agents Workbench
          </button>
          <button
            onClick={() => setActiveSubTab('decision-support')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'decision-support'
                ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Decision Support (5 Modules)
          </button>
          <button
            onClick={() => setActiveSubTab('coordination-hub')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'coordination-hub'
                ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Knowledge Sharing Hub (Live JSON)
          </button>
        </div>
      </div>

      {/* Mandatory Governance Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="font-medium leading-relaxed">
          <span className="font-bold">Decision-Support Governance:</span> Agent permissions enforce strict role access control. All recommendations remain advisory and subject to stakeholder validation.
        </p>
      </div>

      {/* SUB-TAB 1: 5 DOMAIN AI AGENTS WORKBENCH */}
      {activeSubTab === 'agents' && (
        <div className="space-y-5">
          {/* 5 Explicit Agent Domain Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {AGENT_DOMAINS.map((agent) => {
              const Icon = agent.icon;
              const unlocked = canAccessAgent(currentUser?.role, agent.id);
              const isSelected = selectedAgent === agent.id;

              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#1F4B2C] text-[#F4FFFC] border-[#C3E956] shadow-md'
                      : unlocked
                      ? 'bg-white text-[#1F4B2C] border-[#91EAAF] hover:bg-[#F4FFFC]'
                      : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#C3E956] text-[#1F4B2C]'
                          : unlocked
                          ? 'bg-[#F4FFFC] text-[#1F4B2C] border border-[#91EAAF]'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {unlocked ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          isSelected
                            ? 'bg-[#C3E956]/20 text-[#C3E956]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-700">
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-tight">{agent.label}</h3>
                    <p
                      className={`text-[10px] mt-0.5 leading-snug ${
                        isSelected ? 'text-[#91EAAF]' : 'text-neutral-500'
                      }`}
                    >
                      {agent.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ACCESS CONTROL GATE WHEN LOCKED */}
          {!isSelectedDomainAccessible ? (
            <div className="glass-light p-8 rounded-3xl border-2 border-red-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#1F4B2C]">
                {selectedAgent} Agent Restricted for {currentUser?.role || 'Guest'}
              </h3>
              <p className="text-xs text-neutral-600 max-w-lg mx-auto leading-relaxed">
                {selectedAgent === 'Admin'
                  ? 'The Admin Agent, moderation enforcement, and system audit ledgers are restricted exclusively to authenticated Master Administrators.'
                  : `Your active role (${currentUser?.role || 'Guest'}) cannot execute ${selectedAgent} Agent workflows. Switch to an authorized stakeholder profile or select an unlocked agent above.`}
              </p>
              {selectedAgent === 'Admin' && (
                <button
                  onClick={() => setIsAdminPasswordModalOpen(true)}
                  className="px-5 py-2.5 rounded-full btn-forest text-xs font-black inline-flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C3E956]" />
                  Authenticate Master Admin Password
                </button>
              )}
            </div>
          ) : (
            <>
              {/* 1. FARMER AGENT WORKBENCH */}
              {selectedAgent === 'Farmer' && (
                <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                    <div>
                      <h3 className="text-lg font-black text-[#1F4B2C]">
                        Farmer Agent — Harvest, Quality Grading & Delivery ETA
                      </h3>
                      <p className="text-xs text-neutral-600">
                        Manage farm locations, harvest readiness, photo authenticity checks, and dispatch ETA
                      </p>
                    </div>
                    <button
                      onClick={() => navigateToTabWithGuard('marketplace')}
                      className="px-4 py-2 rounded-full btn-sprout text-xs font-black inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Tractor className="w-3.5 h-3.5" />
                      Post & AI-Grade Produce
                    </button>
                  </div>

                  {/* Active Farm Profiles & Harvest Lots */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {commodities
                      .filter((c) => c.verificationStatus !== 'REJECTED')
                      .slice(0, 6)
                      .map((crop) => {
                        const hub = NV_COORDS_BY_MUNICIPALITY.Bambang;
                        const eta = estimateDeliveryEta(
                          crop.lat,
                          crop.lng,
                          hub.lat,
                          hub.lng,
                          crop.daysToHarvest || 0
                        );
                        return (
                          <div
                            key={crop.id}
                            className="p-4 rounded-2xl bg-white border border-[#91EAAF] space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-black uppercase text-[#4D7111]">
                                  {crop.municipality} • Brgy. {crop.barangay}
                                </span>
                                <h4 className="text-xs font-black text-[#1F4B2C]">{crop.name}</h4>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                  crop.verificationStatus === 'VERIFIED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {crop.verificationStatus}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Producer:</span>
                                <span className="font-bold text-[#1F4B2C]">{crop.supplierName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Stock & Price:</span>
                                <span className="font-bold">
                                  {crop.availableKg} kg @ ₱{crop.pricePerKg}/kg
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Quality Class:</span>
                                <span className="font-bold text-emerald-700">{crop.qualityGrade}</span>
                              </div>
                              <div className="flex justify-between items-center pt-1 border-t border-neutral-100">
                                <span className="flex items-center gap-1 text-neutral-500">
                                  <Clock className="w-3 h-3" />
                                  ETA to NVAT:
                                </span>
                                <span className="font-bold text-[#1F4B2C]">{eta.etaLabel}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => openMarketplaceToCommodity(crop.id)}
                              className="w-full py-1.5 rounded-xl bg-[#F4FFFC] border border-[#91EAAF] text-[11px] font-black text-[#1F4B2C] hover:bg-[#1F4B2C] hover:text-[#C3E956] transition-colors flex items-center justify-center gap-1"
                            >
                              <span>Inspect in Marketplace</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  {/* Direct Farmer Agent Directive */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRunAgentCoordination(roleDirective, 'Farmer');
                    }}
                    className="p-4 rounded-2xl bg-white border border-neutral-200 flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="text"
                      value={roleDirective}
                      onChange={(e) => setRoleDirective(e.target.value)}
                      placeholder="Ask Farmer Agent about harvest window, quality grade, or NVAT dispatch..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#4D7111]"
                    />
                    <button
                      type="submit"
                      disabled={isCoordinating}
                      className="px-4 py-2 rounded-xl btn-forest text-xs font-black flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-[#C3E956] ${isCoordinating ? 'animate-spin' : ''}`} />
                      <span>Run Farmer Agent</span>
                    </button>
                  </form>

                  {roleAiResult && (
                    <div className="p-3.5 rounded-2xl bg-[#F4FFFC] border border-[#91EAAF] text-xs space-y-1">
                      <span className="font-black text-[#1F4B2C]">
                        {roleAiResult.fromAgent} → {roleAiResult.toAgent}
                      </span>
                      <p className="text-neutral-700">{roleAiResult.reasoning}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 2. BUYER AGENT WORKBENCH */}
              {selectedAgent === 'Buyer' && (
                <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-5">
                  <div className="pb-3 border-b border-neutral-200">
                    <h3 className="text-lg font-black text-[#1F4B2C]">
                      Buyer Agent — Need Matching & Top 3 Reliable Suppliers
                    </h3>
                    <p className="text-xs text-neutral-600">
                      Ranks verified farmers & suppliers weighted by proximity, price, quality grade, zero strikes, and trade history
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-neutral-200">
                    <div>
                      <label className="block text-[10px] font-bold text-[#1F4B2C] mb-1">
                        Needed Supply
                      </label>
                      <input
                        type="text"
                        value={buyerCriteria.neededSupply}
                        onChange={(e) =>
                          setBuyerCriteria((p) => ({ ...p, neededSupply: e.target.value }))
                        }
                        placeholder="e.g. Cabbage, Onion, Citrus"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#1F4B2C] mb-1">
                        Destination Municipality
                      </label>
                      <select
                        value={buyerCriteria.destinationMunicipality}
                        onChange={(e) =>
                          setBuyerCriteria((p) => ({
                            ...p,
                            destinationMunicipality: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                      >
                        {Object.keys(NV_COORDS_BY_MUNICIPALITY).map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#1F4B2C] mb-1">
                        Quality Class
                      </label>
                      <select
                        value={buyerCriteria.preferredGrade}
                        onChange={(e) =>
                          setBuyerCriteria((p) => ({
                            ...p,
                            preferredGrade: e.target.value as BuyerNeedCriteria['preferredGrade'],
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                      >
                        <option value="ANY">Any Quality Grade</option>
                        <option value="Grade A Premium">Grade A Premium</option>
                        <option value="Grade B Commercial">Grade B Commercial</option>
                        <option value="Standard Fresh">Standard Fresh</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleRunBuyerRecommend}
                        disabled={isBuyerLoading}
                        className="w-full py-2 px-4 rounded-xl btn-forest text-xs font-black flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className={`w-3.5 h-3.5 text-[#C3E956] ${isBuyerLoading ? 'animate-spin' : ''}`} />
                        <span>{isBuyerLoading ? 'Analyzing...' : 'Explain Top 3 Matches'}</span>
                      </button>
                    </div>
                  </div>

                  {buyerRationale && (
                    <div className="p-3.5 rounded-2xl bg-[#1F4B2C] text-[#F4FFFC] text-xs leading-relaxed">
                      <span className="font-black text-[#C3E956] uppercase text-[10px] block mb-0.5">
                        Buyer AI Match Rationale
                      </span>
                      {buyerRationale}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {buyerTopMatches.map((m, idx) => (
                      <div
                        key={m.commodity.id}
                        className="p-4 rounded-2xl bg-white border-2 border-[#91EAAF] flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black">
                              Rank #{idx + 1} • {m.score}% Match
                            </span>
                            <span className="text-[10px] font-bold text-neutral-500">
                              {m.etaLabel}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-[#1F4B2C]">{m.commodity.name}</h4>
                          <p className="text-xs text-neutral-600">
                            {m.commodity.supplierName} • {m.commodity.municipality}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {m.reasons.map((r) => (
                              <span
                                key={r}
                                className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs font-black text-[#4D7111]">
                            ₱{m.commodity.pricePerKg}/kg • {m.commodity.availableKg.toLocaleString()} kg avail.
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openMarketplaceToCommodity(m.commodity.id)}
                            className="flex-1 py-2 rounded-xl border border-[#1F4B2C] text-[#1F4B2C] text-[11px] font-black hover:bg-neutral-50"
                          >
                            View in Market
                          </button>
                          <button
                            onClick={() => setActiveOrderModalItem(m.commodity)}
                            className="flex-1 py-2 rounded-xl btn-sprout text-[11px] font-black"
                          >
                            Initiate Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. SUPPLIER AGENT WORKBENCH */}
              {selectedAgent === 'Supplier' && (
                <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                    <div>
                      <h3 className="text-lg font-black text-[#1F4B2C]">
                        Supplier Agent — Coordinated Buyer Demand & Stock Allocation
                      </h3>
                      <p className="text-xs text-neutral-600">
                        Coordinates directly with the Market Agent to forecast procurement demand and manage your posted stock
                      </p>
                    </div>
                    <button
                      onClick={handleRunSupplierDemand}
                      disabled={isSupplierLoading}
                      className="px-4 py-2.5 rounded-full btn-forest text-xs font-black flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <Zap className={`w-3.5 h-3.5 text-[#C3E956] ${isSupplierLoading ? 'animate-spin' : ''}`} />
                      <span>
                        {isSupplierLoading ? 'Coordinating Agents...' : 'Coordinate Buyer Demand Forecast'}
                      </span>
                    </button>
                  </div>

                  {supplierForecast && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-[#1F4B2C] text-[#F4FFFC] text-xs leading-relaxed">
                        <span className="text-[10px] font-black uppercase text-[#C3E956] block mb-1">
                          Supplier ↔ Market Agent Forecast ({supplierForecast.poweredByGemini ? 'Gemini AI' : 'System Telemetry'})
                        </span>
                        {supplierForecast.forecastSummary}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {supplierForecast.priorityCrops.map((item, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-white border border-[#91EAAF] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-[#1F4B2C]">{item.crop}</span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                                {item.demandLevel} DEMAND
                              </span>
                            </div>
                            <p className="text-xs font-mono font-bold text-[#4D7111]">
                              Suggested Stock: {item.suggestedStockKg.toLocaleString()} kg
                            </p>
                            <p className="text-[11px] text-neutral-500">Target Hub: {item.targetHub}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Supplier Active Inventory Table (Clickable to Marketplace) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1F4B2C]">
                      Active Stock Allocation (Click any commodity to open highlighted in Marketplace)
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 text-[#1F4B2C] font-black border-b border-neutral-200">
                          <tr>
                            <th className="p-3">Commodity</th>
                            <th className="p-3">Origin</th>
                            <th className="p-3">Available Volume</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Grade & Status</th>
                            <th className="p-3 text-right">Marketplace</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {supplierOwnInventory.map((crop) => (
                            <tr key={crop.id} className="hover:bg-[#F4FFFC]">
                              <td className="p-3 font-bold text-[#1F4B2C]">{crop.name}</td>
                              <td className="p-3 text-neutral-600">{crop.municipality}</td>
                              <td className="p-3 font-mono font-bold">{crop.availableKg.toLocaleString()} kg</td>
                              <td className="p-3 font-bold text-[#4D7111]">₱{crop.pricePerKg}/kg</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  {crop.qualityGrade} • {crop.verificationStatus}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => openMarketplaceToCommodity(crop.id)}
                                  className="px-3 py-1 rounded-full btn-sprout text-[11px] font-black inline-flex items-center gap-1"
                                >
                                  <span>Open</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. MARKET AGENT WORKBENCH */}
              {selectedAgent === 'Market' && (
                <div className="space-y-5">
                  {/* Top Row: Municipal Supply Pie Chart + Search Grounded Assessment */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* SVG Pie Chart of Crop Supply by Municipality */}
                    <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
                      <div>
                        <h3 className="text-base font-black text-[#1F4B2C]">
                          Provincial Crop Supply Share by Municipality (%)
                        </h3>
                        <p className="text-xs text-neutral-600">
                          Live volumetric distribution across Nueva Vizcaya producing municipalities
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <svg
                          viewBox="0 0 168 168"
                          className="w-44 h-44 shrink-0"
                          aria-label="Municipal Crop Supply Distribution Pie Chart"
                        >
                          {pieSlices.map((slice) =>
                            slice.isFullCircle ? (
                              <circle
                                key={slice.municipality}
                                cx={slice.center}
                                cy={slice.center}
                                r={slice.radius}
                                fill={slice.color}
                              />
                            ) : (
                              <path
                                key={slice.municipality}
                                d={slice.d}
                                fill={slice.color}
                                stroke="#ffffff"
                                strokeWidth="1.5"
                              >
                                <title>
                                  {slice.municipality}: {slice.percentage}% ({slice.totalKg.toLocaleString()} kg)
                                </title>
                              </path>
                            )
                          )}
                          <circle cx="84" cy="84" r="30" fill="#FFFFFF" />
                          <text
                            x="84"
                            y="81"
                            textAnchor="middle"
                            className="fill-[#1F4B2C] text-[10px] font-black"
                          >
                            {municipalDistribution.length} Hubs
                          </text>
                          <text
                            x="84"
                            y="95"
                            textAnchor="middle"
                            className="fill-[#4D7111] text-[9px] font-bold"
                          >
                            100% Share
                          </text>
                        </svg>

                        <div className="flex-1 w-full space-y-1.5">
                          {municipalDistribution.slice(0, 7).map((item) => (
                            <div
                              key={item.municipality}
                              className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white border border-neutral-100"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-3 h-3 rounded-xs shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="font-bold text-[#1F4B2C] truncate">
                                  {item.municipality}
                                </span>
                                <span className="text-[10px] text-neutral-400 truncate hidden sm:inline">
                                  ({item.topCrop})
                                </span>
                              </div>
                              <span className="font-mono font-black text-[#4D7111] shrink-0">
                                {item.percentage}% ({item.totalKg.toLocaleString()} kg)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Google Search Grounded Market Intelligence */}
                    <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
                      <div>
                        <h3 className="text-base font-black text-[#1F4B2C]">
                          Search-Grounded Market Intelligence
                        </h3>
                        <p className="text-xs text-neutral-600">
                          Query real-time Philippine & Cagayan Valley pricing benchmarks with clickable reference sources
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-[#1F4B2C] mb-1">
                            Search Commodity
                          </label>
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={marketCommodityQuery}
                              onChange={(e) => setMarketCommodityQuery(e.target.value)}
                              placeholder="Highland Cabbage, Tomato..."
                              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#1F4B2C] mb-1">
                            Target Municipality
                          </label>
                          <select
                            value={marketMuniQuery}
                            onChange={(e) => setMarketMuniQuery(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                          >
                            {Object.keys(NV_COORDS_BY_MUNICIPALITY).map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleRunMarketGrounding}
                        disabled={isMarketLoading}
                        className="w-full py-2.5 px-4 rounded-xl btn-forest text-xs font-black flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className={`w-4 h-4 text-[#C3E956] ${isMarketLoading ? 'animate-spin' : ''}`} />
                        <span>
                          {isMarketLoading
                            ? 'Querying Search Grounding...'
                            : 'Run Live Market Assessment'}
                        </span>
                      </button>

                      {marketIntelResult && (
                        <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] space-y-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[#1F4B2C]">Assessment Summary</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {marketIntelResult.poweredByGemini ? 'Search Grounded' : 'Regional Index'}
                            </span>
                          </div>
                          <p className="text-neutral-700 leading-relaxed">{marketIntelResult.summary}</p>
                          {marketIntelResult.sources.length > 0 && (
                            <div className="pt-2 border-t border-neutral-100 space-y-1">
                              <span className="text-[10px] font-black uppercase text-neutral-500 block">
                                Grounded Reference Sources
                              </span>
                              {marketIntelResult.sources.map((src, i) => (
                                <a
                                  key={i}
                                  href={src.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#1F4B2C] hover:text-[#4D7111] underline"
                                >
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{src.title}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Municipal Price Comparison & Trend View */}
                  <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200">
                      <div>
                        <h4 className="text-sm font-black text-[#1F4B2C]">
                          Searchable Commodity Price Comparison & 7-Day NVAT Trend
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Matching listings for &ldquo;{marketCommodityQuery || 'All'}&rdquo; across Nueva Vizcaya municipalities
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#4D7111]">
                        Bulletin Date: {nvatReport.date}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Municipal Price Bars */}
                      <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-2.5">
                        <h5 className="text-xs font-black text-[#1F4B2C]">
                          Active Municipal Farmgate/Wholesale Prices
                        </h5>
                        {filteredMarketCommodities.slice(0, 5).map((item) => (
                          <div key={item.id} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-[#1F4B2C]">
                                {item.name} ({item.municipality})
                              </span>
                              <span className="text-[#4D7111]">₱{item.pricePerKg}/kg</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1F4B2C] rounded-full"
                                style={{ width: `${Math.min(100, (item.pricePerKg / 120) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 7-Day Trend Snapshot */}
                      <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-3">
                        <h5 className="text-xs font-black text-[#1F4B2C] flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-[#4D7111]" />
                          <span>7-Day NVAT Price Trajectory (₱/kg)</span>
                        </h5>
                        <div className="h-32 flex items-end justify-between gap-1.5 border-b border-neutral-200 pb-1">
                          {nvatReport.historicalTrendData.map((pt, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full flex items-end justify-center gap-1 h-24">
                                <div
                                  className="w-2.5 bg-[#1F4B2C] rounded-t-xs"
                                  style={{ height: `${Math.min(100, (pt.cabbage / 120) * 100)}%` }}
                                  title={`Cabbage: ₱${pt.cabbage}`}
                                />
                                <div
                                  className="w-2.5 bg-[#82B729] rounded-t-xs"
                                  style={{ height: `${Math.min(100, (pt.tomato / 120) * 100)}%` }}
                                  title={`Tomato: ₱${pt.tomato}`}
                                />
                                <div
                                  className="w-2.5 bg-amber-500 rounded-t-xs"
                                  style={{ height: `${Math.min(100, (pt.onion / 120) * 100)}%` }}
                                  title={`Onion: ₱${pt.onion}`}
                                />
                              </div>
                              <span className="text-[9px] font-bold text-neutral-400">
                                {pt.date.split(' ')[1] || pt.date}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-neutral-600">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-[#1F4B2C] rounded-xs" /> Cabbage
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-[#82B729] rounded-xs" /> Tomato
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" /> Onion
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. ADMIN AGENT WORKBENCH (MASTER ADMIN ONLY) */}
              {selectedAgent === 'Admin' && (
                <div className="glass-light p-6 rounded-3xl border-2 border-[#C3E956] shadow-md space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                    <div>
                      <h3 className="text-lg font-black text-[#1F4B2C]">
                        Admin Agent — AI Audit Ledger, Verification & Governance
                      </h3>
                      <p className="text-xs text-neutral-600">
                        Oversees NVAT AI parsing, crop authenticity queue, moderation reports, and persistent AI execution history
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="px-4 py-2.5 rounded-full btn-forest text-xs font-black inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#C3E956]" />
                      <span>Open Master Admin Command Center</span>
                    </button>
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200">
                      <span className="text-[10px] font-black uppercase text-neutral-400">
                        Pending Moderation Reports
                      </span>
                      <p className="text-2xl font-black text-red-700 mt-1">
                        {moderationReports.filter((r) => r.status === 'PENDING').length}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200">
                      <span className="text-[10px] font-black uppercase text-neutral-400">
                        Verification Audit Records
                      </span>
                      <p className="text-2xl font-black text-[#1F4B2C] mt-1">
                        {verificationAuditLogs.length}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200">
                      <span className="text-[10px] font-black uppercase text-neutral-400">
                        Logged AI Interactions
                      </span>
                      <p className="text-2xl font-black text-[#4D7111] mt-1">
                        {aiHistory.length}
                      </p>
                    </div>
                  </div>

                  {/* Recent AI Execution History Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1F4B2C] flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      <span>Recent Platform AI History Log</span>
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 text-[#1F4B2C] font-black border-b border-neutral-200">
                          <tr>
                            <th className="p-3">Agent</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Prompt / Action</th>
                            <th className="p-3">Response Summary</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {aiHistory.slice(0, 8).map((entry) => (
                            <tr key={entry.id} className="hover:bg-neutral-50">
                              <td className="p-3 font-bold text-[#1F4B2C] whitespace-nowrap">
                                {entry.agentType}
                              </td>
                              <td className="p-3 text-neutral-600">{entry.userRole}</td>
                              <td className="p-3 text-neutral-700 max-w-xs truncate">{entry.prompt}</td>
                              <td className="p-3 text-neutral-600 max-w-md truncate">
                                {entry.responseSummary}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SUB-TAB 2: AGRICULTURAL SUPPLY CHAIN DECISION SUPPORT LAYER (5 MODULES) */}
      {activeSubTab === 'decision-support' && (
        <div className="space-y-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'recommendations', label: '(a) Intelligent Supplier Recommendations' },
              { id: 'matching', label: '(b) Buyer-Supplier Matching Engine' },
              { id: 'inventory', label: '(c) Agricultural Inventory & Heatmap' },
              { id: 'scheduling', label: '(d) Delivery & Hauling Coordination' },
              { id: 'policy', label: '(e) Policy & Market Intelligence Brief' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setDsModule(m.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                  dsModule === m.id
                    ? 'btn-sprout shadow-xs ring-1 ring-[#1F4B2C]'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {dsModule === 'recommendations' && (
            <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                <div>
                  <h3 className="text-base font-black text-[#1F4B2C]">
                    Intelligent Supplier Recommendations (Composite Weighted Score)
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Weighted scoring: Price (35%) • Distance (30%) • Crop Quality (20%) • Availability (15%)
                  </p>
                </div>

                <select
                  value={selectedCropQuery}
                  onChange={(e) => setSelectedCropQuery(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1F4B2C]"
                >
                  <option value="Highland Cabbage">Highland Cabbage</option>
                  <option value="Red Creole Onion">Red Creole Onion</option>
                  <option value="Citrus">Satsuma Citrus</option>
                  <option value="Tomato">Satsuki Tomato</option>
                  <option value="ALL">All Commodities</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scoredSuppliers.slice(0, 6).map(({ crop, dist, score }) => (
                  <div
                    key={crop.id}
                    className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black uppercase">
                          {crop.category}
                        </span>
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{score}% Match</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-black text-[#1F4B2C] mt-2 leading-snug">
                        {crop.name}
                      </h4>
                      <p className="text-xs text-neutral-600 font-medium">
                        By {crop.supplierName} • {crop.municipality} ({formatDistance(dist)} away)
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Price:</span>
                          <span className="font-black text-[#1F4B2C]">₱{crop.pricePerKg}/kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Available:</span>
                          <span className="font-bold text-neutral-700">{crop.availableKg.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Authenticity:</span>
                          <span className="font-bold text-emerald-700">{crop.aiAuthenticityScore}% Farm Capture</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveOrderModalItem(crop)}
                      className="w-full py-2 rounded-xl btn-sprout text-xs font-black shadow-xs"
                    >
                      Initiate Order with Ranked Supplier
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dsModule === 'matching' && (
            <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
              <div className="pb-3 border-b border-neutral-200">
                <h3 className="text-base font-black text-[#1F4B2C]">
                  Automated Two-Way Matching Board (Demand vs Supply)
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Direct pairing of open buyer purchase requirements against verified farm yields
                </p>
              </div>

              <div className="space-y-3">
                {openBuyerRequests.map((req) => {
                  const matchingCrop = commodities.find((c) =>
                    c.name.toLowerCase().includes(req.commodity.toLowerCase())
                  );

                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold uppercase">
                            Demand Request
                          </span>
                          <span className="text-xs font-black text-[#1F4B2C]">{req.commodity}</span>
                        </div>
                        <h4 className="text-xs font-bold text-neutral-700">{req.buyerName}</h4>
                        <p className="text-[11px] text-neutral-500">
                          Target Volume: <span className="font-bold text-neutral-800">{req.targetKg.toLocaleString()} kg</span> • Ceiling Budget: <span className="font-bold text-neutral-800">₱{req.maxPrice}/kg</span> • {req.location}
                        </p>
                      </div>

                      {matchingCrop ? (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-left text-xs">
                            <span className="text-[10px] text-emerald-800 font-bold block">✓ Matched Harvest Lot:</span>
                            <span className="font-bold text-[#1F4B2C]">{matchingCrop.supplierName}</span>
                            <span className="text-neutral-500 block text-[11px]">₱{matchingCrop.pricePerKg}/kg ({matchingCrop.availableKg} kg)</span>
                          </div>
                          <button
                            onClick={() => {
                              setActiveOrderModalItem(matchingCrop);
                              addNotification(`Matched trade initiated for ${req.commodity}!`, 'success');
                            }}
                            className="px-4 py-2.5 rounded-full btn-forest text-xs font-black whitespace-nowrap shadow-xs"
                          >
                            Initiate Matched Trade
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 font-medium">Scanning for new crop posts...</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {dsModule === 'inventory' && (
            <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
              <div className="pb-3 border-b border-neutral-200">
                <h3 className="text-base font-black text-[#1F4B2C]">
                  Municipal Agricultural Heatmap & Regional Inventory
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Regional stock volumes across Nueva Vizcaya municipal hubs
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {municipalDistribution.map((item) => (
                  <div key={item.municipality} className="p-3 rounded-2xl bg-white border border-[#91EAAF]/60 shadow-xs text-left">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.percentage}% Share
                    </span>
                    <h5 className="text-xs font-bold text-[#1F4B2C] mt-1.5">{item.municipality}</h5>
                    <p className="text-sm font-black text-[#4D7111] font-mono mt-0.5">
                      {item.totalKg.toLocaleString()} kg
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate">Top: {item.topCrop}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dsModule === 'scheduling' && (
            <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-3">
              <h3 className="text-base font-black text-[#1F4B2C]">
                Transaction & Delivery Scheduling Support
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Optimized route coordination across Maharlika Highway (AH26) and Dalton Pass
              </p>
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 text-xs text-neutral-700 space-y-2">
                <div className="flex items-center gap-2 text-[#4D7111] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fleet Availability: 8 Cooperative Hauling Trucks Staged at Bambang NVAT</span>
                </div>
                <p>
                  Batch dispatching scheduled for 04:00 AM, 11:00 AM, and 06:00 PM to bypass heavy mountain fog in Santa Fe and ensure crisp vegetable delivery to NCR terminals.
                </p>
              </div>
            </div>
          )}

          {dsModule === 'policy' && (
            <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-3">
              <h3 className="text-base font-black text-[#1F4B2C]">
                PAO-NV Provincial Food Security & Price Stability Index
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Macro telemetry compiled by the Market Agent
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Price Stability Index</span>
                  <div className="text-2xl font-black text-[#1F4B2C] mt-1">92.4 / 100</div>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">✓ Highland Cabbage supply steady</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Cold Storage Capacity</span>
                  <div className="text-2xl font-black text-[#1F4B2C] mt-1">78% Utilized</div>
                  <p className="text-[10px] text-amber-700 font-bold mt-1">Bayombong + Bambang Lockers</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Average Hauler Transit</span>
                  <div className="text-2xl font-black text-[#1F4B2C] mt-1">42 Minutes</div>
                  <p className="text-[10px] text-neutral-500 font-semibold mt-1">Farm gate to NVAT Bay</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: KNOWLEDGE SHARING HUB (LIVE JSON MESSAGE PACKETS FLOWING) */}
      {activeSubTab === 'coordination-hub' && (
        <div className="glass-light p-6 rounded-3xl border-2 border-[#91EAAF] shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-lg font-black text-[#1F4B2C]">
                Multi-Agent Coordination & Knowledge Sharing Mesh
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Real-time JSON message packets flowing between Farmer ↔ Buyer ↔ Supplier ↔ Market ↔ Admin Agents
              </p>
            </div>
            <button
              onClick={() => handleRunAgentCoordination('Run live harvest and price dispatch sync')}
              disabled={isCoordinating}
              className="px-4 py-2 rounded-full btn-forest text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 text-[#C3E956] ${isCoordinating ? 'animate-spin' : ''}`} />
              <span>{isCoordinating ? 'Coordinating Agents...' : 'Trigger Live Coordination Ping'}</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {agentPackets.map((pkt) => (
              <div
                key={pkt.id}
                className="p-4 rounded-2xl bg-[#1F4B2C] text-[#F4FFFC] border border-[#C3E956]/40 shadow-sm space-y-2 font-mono text-xs"
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#C3E956] text-[#1F4B2C] text-[10px] font-black uppercase">
                      {pkt.fromAgent}
                    </span>
                    <ArrowLeftRight className="w-3 h-3 text-[#91EAAF]" />
                    <span className="px-2 py-0.5 rounded-md bg-[#91EAAF] text-[#1F4B2C] text-[10px] font-black uppercase">
                      {pkt.toAgent}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(pkt.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#C3E956] font-bold text-[11px]">
                  <FileText className="w-3 h-3" />
                  <span>Intent:</span>
                  <span>{pkt.intent}</span>
                </div>

                <pre className="p-2.5 rounded-xl bg-black/40 text-[#91EAAF] overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(pkt.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
