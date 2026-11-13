import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAccount } from '../types';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Ban,
  Send,
  BarChart3,
  TrendingUp,
  PieChart,
  AlertTriangle,
  RefreshCw,
  History,
  ClipboardCheck,
  Database,
  Flag,
  Trash2,
  FileSpreadsheet,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface DbOverviewResponse {
  configured: boolean;
  counts?: {
    users: number;
    commodities: number;
    communityPosts: number;
    orders: number;
    privateMessages: number;
    aiHistory: number;
    nvatBulletins: number;
    pendingReports: number;
  };
  users?: Array<Record<string, unknown>>;
  commodities?: Array<Record<string, unknown>>;
  communityPosts?: Array<Record<string, unknown>>;
  orders?: Array<Record<string, unknown>>;
  privateMessages?: Array<Record<string, unknown>>;
  aiHistory?: Array<Record<string, unknown>>;
  nvatBulletins?: Array<Record<string, unknown>>;
  moderationReports?: Array<Record<string, unknown>>;
}

export const MasterAdminModule: React.FC = () => {
  const {
    currentUser,
    accounts,
    commodities,
    orders,
    chatMessages,
    communityPosts,
    deleteCommunityPost,
    verifyAndBoostCommodity,
    rejectAndWarnCommodity,
    toggleBanUser,
    publishAdminAnnouncement,
    processAndPublishNvatBulletin,
    nvatReport,
    nvatArchive,
    verificationAuditLogs,
    moderationReports,
    adminResolveReport,
    aiHistory,
    exportCurrentBulletinToSheets,
    setIsAdminPasswordModalOpen,
    addNotification,
  } = useApp();

  const [adminTab, setAdminTab] = useState<
    'nvat-ai' | 'queue' | 'reports' | 'moderation' | 'audit-trail' | 'db-explorer'
  >('nvat-ai');
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED'>('ALL');
  const [reportFilter, setReportFilter] = useState<'PENDING' | 'ALL'>('PENDING');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  // Broadcast announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<
    'Price Advisory' | 'Weather Warning' | 'Subsidy Announcement' | 'NVAT Logistics Update'
  >('Price Advisory');

  // NVAT Raw text input
  const [rawNvatInput, setRawNvatInput] = useState<string>(
    `NVAT Bambang Daily Price Bulletin: Highland cabbage inflows reached 42 metric tons today with prevailing wholesale prices dropping from Php 38/kg to Php 32/kg due to peak harvest in Kayapa. Red onions remained steady at Php 95/kg to Php 110/kg with 18 tons traded, while Satsuki tomatoes surged to Php 55/kg amid strong Metro Manila buyer demand. Satsuma mandarins traded at Php 75/kg average with 12 tons inbound from Kasibu orchards.`
  );
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Google Sheets sync confirmation dialog
  const [isSheetsConfirmOpen, setIsSheetsConfirmOpen] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);

  // Database Explorer state
  const [dbOverview, setDbOverview] = useState<DbOverviewResponse | null>(null);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [dbTableTab, setDbTableTab] = useState<
    'orders' | 'messages' | 'commodities' | 'posts' | 'ai-history' | 'nvat'
  >('orders');

  const fetchDatabaseOverview = async () => {
    setIsDbLoading(true);
    try {
      const res = await fetch('/api/db/overview');
      if (res.ok) {
        const data = (await res.json()) as DbOverviewResponse;
        setDbOverview(data);
      }
    } catch {
      // keep session view if offline
    } finally {
      setIsDbLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'MASTER_ADMIN' && adminTab === 'db-explorer') {
      void fetchDatabaseOverview();
    }
  }, [currentUser?.role, adminTab]);

  // If not logged in as Master Admin, show password gate button (zero auto-fill)
  if (currentUser?.role !== 'MASTER_ADMIN') {
    return (
      <div className="p-8 glass-light rounded-3xl border-2 border-red-300 max-w-lg mx-auto text-center space-y-4 my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-[#1F4B2C]">
          Master Admin Authentication Required
        </h3>
        <p className="text-xs text-neutral-600 font-medium leading-relaxed">
          The Master Admin Command Center, Moderation Queue, and Database Explorer are locked exclusively to:
          <br />
          <code className="text-red-700 font-mono font-bold">russelthegreat1209@gmail.com</code>
        </p>
        <button
          onClick={() => setIsAdminPasswordModalOpen(true)}
          className="px-6 py-3 rounded-full btn-forest text-xs font-black inline-flex items-center gap-2 shadow-md"
        >
          <ShieldCheck className="w-4 h-4 text-[#C3E956]" />
          <span>Authenticate as Master Admin (Password)</span>
        </button>
      </div>
    );
  }

  const pendingVerificationCrops = commodities.filter(
    (c) => c.verificationStatus === 'PENDING' || (c as any).verificationStatus === 'PENDING_VERIFICATION'
  );
  const pendingReportsCount = moderationReports.filter((r) => r.status === 'PENDING').length;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    publishAdminAnnouncement(annTitle, annContent, annCategory);
    setAnnTitle('');
    setAnnContent('');
  };

  const handleProcessNvat = async () => {
    if (!rawNvatInput.trim()) return;
    setIsAiProcessing(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await fetch('/api/ai/nvat-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawNvatInput, defaultDate: today }),
      });
      const data = res.ok ? await res.json() : { items: null };
      const parsed =
        Array.isArray(data.items) && data.items.length > 0
          ? data.items.map((it: any, idx: number) => {
              const prev = Number(it.prevailingPricePhp) || 35;
              const previous = Number(it.previousPricePhp) || prev;
              const variance = Math.round(((prev - previous) / Math.max(previous, 1)) * 1000) / 10;
              return {
                id: `nvat-${Date.now()}-${idx}`,
                commodityName: String(it.commodityName || 'NVAT Commodity'),
                category: (it.category as any) || 'Highland Vegetables',
                minPricePhp: Number(it.minPricePhp) || Math.round(prev * 0.9),
                maxPricePhp: Number(it.maxPricePhp) || Math.round(prev * 1.1),
                prevailingPricePhp: prev,
                previousPricePhp: previous,
                priceVariancePercent: variance,
                estimatedVolumeTradedTons: Number(it.estimatedVolumeTradedTons) || 15,
                marketTrendStatus: variance > 2 ? 'Surging' : variance < -2 ? 'Declining' : 'Stable',
                date: today,
                unitOfMeasure: 'PHP / kg',
                priceType: 'Confirmed',
                originalDataSource: 'NVAT Daily Bulletin, Bambang',
                requiresReview: false,
                lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' PHT',
              };
            })
          : undefined;
      processAndPublishNvatBulletin(rawNvatInput, parsed);
    } catch {
      processAndPublishNvatBulletin(rawNvatInput);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleConfirmSheetsExport = async () => {
    setIsExportingSheets(true);
    try {
      await exportCurrentBulletinToSheets(nvatReport);
      setIsSheetsConfirmOpen(false);
    } catch {
      addNotification('Google Sheets authorization was cancelled or could not complete.', 'alert');
    } finally {
      setIsExportingSheets(false);
    }
  };

  const filteredReports = moderationReports.filter((rep) =>
    reportFilter === 'PENDING' ? rep.status === 'PENDING' : true
  );

  return (
    <div className="space-y-6 pb-16 text-left animate-fade-in">
      {/* Header Banner */}
      <div className="glass-dark p-6 sm:p-8 rounded-3xl border-2 border-[#C3E956] shadow-xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C3E956] text-[#1F4B2C] text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#1F4B2C]" />
            Exclusive Master Admin Command Center
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#F4FFFC] tracking-tight">
            System Governance, Moderation & Database Control
          </h2>
          <p className="text-xs text-[#91EAAF] font-medium mt-1">
            Authenticated as {currentUser.email} • Full System Owner & Cloud SQL / Firestore Controller
          </p>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex flex-wrap bg-white/10 p-1.5 rounded-2xl border border-white/20 gap-1">
          <button
            onClick={() => setAdminTab('nvat-ai')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              adminTab === 'nvat-ai'
                ? 'bg-[#C3E956] text-[#1F4B2C] shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>NVAT AI</span>
          </button>

          <button
            onClick={() => setAdminTab('queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              adminTab === 'queue'
                ? 'bg-[#C3E956] text-[#1F4B2C] shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify Crops ({pendingVerificationCrops.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              adminTab === 'reports'
                ? 'bg-[#C3E956] text-[#1F4B2C] shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reports Queue ({pendingReportsCount})</span>
          </button>

          <button
            onClick={() => setAdminTab('moderation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              adminTab === 'moderation'
                ? 'bg-[#C3E956] text-[#1F4B2C] shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Users & Posts</span>
          </button>

          <button
            onClick={() => setAdminTab('audit-trail')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              adminTab === 'audit-trail'
                ? 'bg-[#C3E956] text-[#1F4B2C] shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({verificationAuditLogs.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('db-explorer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              adminTab === 'db-explorer'
                ? 'bg-[#C3E956] text-[#1F4B2C] shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Explorer</span>
          </button>
        </div>
      </div>

      {/* 1. NVAT AI PROCESSOR & GOOGLE SHEETS SYNC */}
      {adminTab === 'nvat-ai' && (
        <div className="space-y-6">
          <div className="glass-light p-6 rounded-3xl border-2 border-[#91EAAF] shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-xl font-black text-[#1F4B2C] tracking-tight">
                  NVAT AI Market Intelligence Processor
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Paste daily trading notes from NVAT Bambang to generate structured tables, archive past dates, and export to Google Sheets
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsSheetsConfirmOpen(true)}
                  className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Sync Bulletin to Google Sheets</span>
                </button>
              </div>
            </div>

            {nvatReport.googleSheetUrl && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">
                  Latest NVAT Bulletin ({nvatReport.date}) synced to Google Sheets
                </span>
                <a
                  href={nvatReport.googleSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-black text-emerald-800 underline"
                >
                  <span>Open Spreadsheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1F4B2C]">
                Paste Raw NVAT Daily Price Bulletin Text:
              </label>
              <textarea
                rows={4}
                value={rawNvatInput}
                onChange={(e) => setRawNvatInput(e.target.value)}
                placeholder="Paste NVAT trading terminal price bulletin paragraphs here..."
                className="w-full p-3.5 text-xs rounded-2xl border border-neutral-300 bg-white font-mono leading-relaxed focus:outline-none focus:border-[#4D7111]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleProcessNvat}
                disabled={isAiProcessing}
                className="px-6 py-3 rounded-full btn-sprout text-xs font-black flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
              >
                {isAiProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#1F4B2C]" />
                    <span>Processing with Admin AI Agent...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#1F4B2C]" />
                    <span>Process NVAT Text with AI Agent & Publish</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setRawNvatInput(
                    `NVAT Bambang Daily Price Bulletin: Highland cabbage inflows reached 42 metric tons today with prevailing wholesale prices dropping from Php 38/kg to Php 32/kg due to peak harvest in Kayapa. Red onions remained steady at Php 95/kg to Php 110/kg with 18 tons traded, while Satsuki tomatoes surged to Php 55/kg amid strong Metro Manila buyer demand.`
                  );
                }}
                className="px-4 py-2.5 rounded-full border border-neutral-300 bg-white text-xs font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Load Sample Kayapa Cabbage Bulletin
              </button>
            </div>
          </div>

          {/* LIVE PARSED TABLE & CHARTS */}
          <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h4 className="text-base font-black text-[#1F4B2C]">
                  Published NVAT Market Table ({nvatReport.date})
                </h4>
                <p className="text-xs text-neutral-500 font-medium">
                  AI extracted commodity pricing metrics & variance ratios
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Synced to Community Bulletins
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1F4B2C] text-[#F4FFFC]">
                    <th className="p-3 font-bold">Commodity Name</th>
                    <th className="p-3 font-bold">Category</th>
                    <th className="p-3 font-bold">Min (₱/kg)</th>
                    <th className="p-3 font-bold">Max (₱/kg)</th>
                    <th className="p-3 font-bold">Prevailing</th>
                    <th className="p-3 font-bold">Previous</th>
                    <th className="p-3 font-bold">Variance (%)</th>
                    <th className="p-3 font-bold">Volume Traded</th>
                    <th className="p-3 font-bold">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {nvatReport.items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-bold text-[#1F4B2C]">{item.commodityName}</td>
                      <td className="p-3 text-neutral-600 text-[11px]">{item.category}</td>
                      <td className="p-3 text-neutral-700">₱{item.minPricePhp}</td>
                      <td className="p-3 text-neutral-700">₱{item.maxPricePhp}</td>
                      <td className="p-3 font-black text-[#1F4B2C]">₱{item.prevailingPricePhp}/kg</td>
                      <td className="p-3 text-neutral-400 line-through">₱{item.previousPricePhp}</td>
                      <td className="p-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            item.priceVariancePercent > 0
                              ? 'bg-red-100 text-red-700'
                              : item.priceVariancePercent < 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {item.priceVariancePercent > 0
                            ? `+${item.priceVariancePercent}%`
                            : `${item.priceVariancePercent}%`}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[#4D7111]">
                        {item.estimatedVolumeTradedTons} MT
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            item.marketTrendStatus === 'Surging'
                              ? 'bg-amber-100 text-amber-800'
                              : item.marketTrendStatus === 'Declining'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.marketTrendStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#1F4B2C]">1. Prevailing vs Previous Price</h5>
                  <BarChart3 className="w-4 h-4 text-[#4D7111]" />
                </div>
                <div className="space-y-2 pt-1">
                  {nvatReport.priceComparisonData.map((d, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-neutral-700">
                        <span>{d.name}</span>
                        <span>
                          ₱{d.prevailing}{' '}
                          <span className="text-neutral-400 font-normal">/ prev ₱{d.previous}</span>
                        </span>
                      </div>
                      <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden flex gap-0.5">
                        <div
                          className="h-full bg-[#1F4B2C] rounded-full"
                          style={{ width: `${Math.min(100, (d.prevailing / 120) * 100)}%` }}
                        />
                        <div
                          className="h-full bg-[#C3E956] rounded-full opacity-60"
                          style={{ width: `${Math.min(100, (d.previous / 120) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#1F4B2C]">2. Inflow Supply Share (MT)</h5>
                  <PieChart className="w-4 h-4 text-[#4D7111]" />
                </div>
                <div className="space-y-2 pt-1">
                  {nvatReport.volumeShareData.map((d, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-neutral-700">
                        <span>{d.name}</span>
                        <span className="font-mono text-[#4D7111]">
                          {d.volumeTons} MT ({d.percentage}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4D7111] to-[#C3E956] rounded-full"
                          style={{ width: `${Math.min(100, d.percentage * 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#1F4B2C]">3. 7-Day Price Trend</h5>
                  <TrendingUp className="w-4 h-4 text-[#4D7111]" />
                </div>
                <div className="h-36 flex items-end justify-between gap-1 pt-3 border-b border-neutral-200">
                  {nvatReport.historicalTrendData.map((d, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center gap-1 h-24">
                        <div
                          className="w-2.5 bg-[#1F4B2C] rounded-t-xs"
                          style={{ height: `${Math.min(100, (d.cabbage / 60) * 100)}%` }}
                          title={`Cabbage: ₱${d.cabbage}`}
                        />
                        <div
                          className="w-2.5 bg-[#C3E956] rounded-t-xs"
                          style={{ height: `${Math.min(100, (d.tomato / 60) * 100)}%` }}
                          title={`Tomato: ₱${d.tomato}`}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-neutral-400">
                        {d.date.split(' ')[1] || d.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CROP IMAGE AUTHENTICITY VERIFICATION QUEUE */}
      {adminTab === 'queue' && (
        <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-lg font-black text-[#1F4B2C]">
                Crop Image Authenticity Verification Queue
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Inspect AI quality class classifications, manual overrides, and authentic farm photography
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
              {pendingVerificationCrops.length} Pending Approval
            </span>
          </div>

          {pendingVerificationCrops.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/70 border border-neutral-200 text-center text-neutral-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#1F4B2C]">All crop harvest submissions verified!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingVerificationCrops.map((crop) => (
                <div
                  key={crop.id}
                  className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-3"
                >
                  <div className="flex gap-4">
                    <img
                      src={crop.imageUrl}
                      alt={crop.name}
                      className="w-24 h-24 rounded-2xl object-cover border border-neutral-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-900">
                          {crop.category}
                        </span>
                        {crop.manualGradeOverride && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-800">
                            Manual Override Flag
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#1F4B2C] leading-snug">{crop.name}</h4>
                      <p className="text-[11px] text-neutral-600">
                        By {crop.supplierName} • {crop.municipality}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#4D7111]">
                        <span>{crop.availableKg} kg</span> • <span>₱{crop.pricePerKg}/kg</span> •{' '}
                        <span>{crop.qualityGrade}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-[#F4FFFC] border border-emerald-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        AI Vision Authenticity Score:
                      </span>
                      <span className="font-mono text-sm">{crop.aiAuthenticityScore}% Authentic</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-tight">
                      {crop.aiVisionNotes || 'Verified natural farm lighting and packaging.'}
                    </p>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-neutral-100">
                    <label className="block text-[10px] font-bold text-neutral-500">
                      Rejection Reason Code (if rejecting):
                    </label>
                    <select
                      value={rejectionReasons[crop.id] || 'UNVERIFIED_STOCK_PHOTO'}
                      onChange={(e) =>
                        setRejectionReasons((prev) => ({
                          ...prev,
                          [crop.id]: e.target.value,
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-neutral-200 bg-neutral-50 font-medium"
                    >
                      <option value="UNVERIFIED_STOCK_PHOTO">
                        UNVERIFIED_STOCK_PHOTO (Stock/watermarked imagery)
                      </option>
                      <option value="MISLEADING_PRICING">
                        MISLEADING_PRICING (Deviates heavily from NVAT trading index)
                      </option>
                      <option value="INSUFFICIENT_FARM_ORIGIN">
                        INSUFFICIENT_FARM_ORIGIN (Unverified municipality / phone)
                      </option>
                      <option value="QUALITY_MISMATCH">
                        QUALITY_MISMATCH (Produce grade does not match visual state)
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => verifyAndBoostCommodity(crop.id)}
                      className="py-2.5 px-3 rounded-xl btn-forest text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#C3E956]" />
                      Verify & Boost to Top
                    </button>
                    <button
                      onClick={() => {
                        const reason = rejectionReasons[crop.id] || 'UNVERIFIED_STOCK_PHOTO';
                        rejectAndWarnCommodity(
                          crop.id,
                          `Listing failed verification protocol: ${reason}. Official warning logged.`
                        );
                      }}
                      className="py-2.5 px-3 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-red-800 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      Reject & Issue Warning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. MODERATION REPORTS QUEUE (STRIKE+DELETE AUTO-BAN @ 3 / BAN DIRECTLY / DISMISS) */}
      {adminTab === 'reports' && (
        <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-lg font-black text-[#1F4B2C]">
                Community & Marketplace Moderation Reports Queue
              </h3>
              <p className="text-xs text-neutral-600">
                Review stakeholder reports on posts, comments, listings, or accounts. Issuing 3 strikes automatically bans the account.
              </p>
            </div>
            <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 gap-1 text-xs font-bold">
              <button
                onClick={() => setReportFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg ${
                  reportFilter === 'PENDING' ? 'bg-[#1F4B2C] text-white' : 'text-neutral-600'
                }`}
              >
                Pending ({pendingReportsCount})
              </button>
              <button
                onClick={() => setReportFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg ${
                  reportFilter === 'ALL' ? 'bg-[#1F4B2C] text-white' : 'text-neutral-600'
                }`}
              >
                All Reports ({moderationReports.length})
              </button>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-neutral-200 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#1F4B2C]">No pending moderation reports.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((rep) => {
                const targetAccount = accounts.find((a) => a.id === rep.targetUserId);
                return (
                  <div
                    key={rep.id}
                    className={`p-4 rounded-2xl bg-white border-2 space-y-3 ${
                      rep.status === 'PENDING' ? 'border-amber-300' : 'border-neutral-200 opacity-85'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase">
                          {rep.targetType} Report
                        </span>
                        <span className="text-xs font-black text-[#1F4B2C]">
                          Target: {rep.targetUserName}
                        </span>
                        {targetAccount && (
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-bold">
                            Strikes: {targetAccount.strikeCount || 0}/3 • {targetAccount.status}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          rep.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-900'
                            : rep.status === 'DISMISSED'
                            ? 'bg-neutral-100 text-neutral-600'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                      <p className="font-bold text-red-800">Reason: {rep.reason}</p>
                      <p className="text-neutral-600 italic">&ldquo;{rep.targetPreview}&rdquo;</p>
                      <p className="text-[10px] text-neutral-400">
                        Reported by {rep.reporterName} • {new Date(rep.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {rep.status === 'PENDING' ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => adminResolveReport(rep.id, 'STRIKE_DELETE')}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition-colors"
                        >
                          Strike + Delete + Notify (Auto-Ban @ 3)
                        </button>
                        <button
                          onClick={() => adminResolveReport(rep.id, 'BAN_DIRECT')}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors"
                        >
                          Ban Account Directly
                        </button>
                        <button
                          onClick={() => adminResolveReport(rep.id, 'DISMISS')}
                          className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-colors"
                        >
                          Dismiss Report
                        </button>
                      </div>
                    ) : (
                      rep.resolutionAction && (
                        <p className="text-[11px] font-bold text-[#1F4B2C]">
                          Resolution: {rep.resolutionAction}
                        </p>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. USERS & COMMUNITY POSTS MODERATION */}
      {adminTab === 'moderation' && (
        <div className="space-y-6">
          {/* Official Broadcaster */}
          <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <h3 className="text-base font-black text-[#1F4B2C]">
                Official Community & Landing Page Broadcaster
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956]">
                Broadcast to All Stakeholders
              </span>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. NVAT Terminal Gate 2 Temporary Traffic Advisory"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Category</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                  >
                    <option value="Price Advisory">Price Advisory</option>
                    <option value="Weather Warning">Weather Warning</option>
                    <option value="Subsidy Announcement">Subsidy Announcement</option>
                    <option value="NVAT Logistics Update">NVAT Logistics Update</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Content Bulletin *</label>
                <textarea
                  rows={2}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Enter official statement, guidelines, or subsidy details..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-full btn-forest text-xs font-bold shadow-md flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-[#C3E956]" />
                Publish Live Broadcast
              </button>
            </form>
          </div>

          {/* Stakeholder Accounts Governance */}
          <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
            <h3 className="text-base font-black text-[#1F4B2C]">
              Platform Stakeholder Accounts Governance ({accounts.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100 text-[#1F4B2C]">
                    <th className="p-3 font-bold">User / Organization</th>
                    <th className="p-3 font-bold">Role</th>
                    <th className="p-3 font-bold">Location</th>
                    <th className="p-3 font-bold">Strikes</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {accounts.map((acc: UserAccount) => (
                    <tr key={acc.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-bold text-[#1F4B2C]">
                        {acc.name}
                        {acc.organization && (
                          <span className="block text-[10px] text-neutral-400 font-normal">
                            {acc.organization}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold">{acc.role}</td>
                      <td className="p-3 text-neutral-600">{acc.municipality}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            (acc.strikeCount || 0) >= 3
                              ? 'bg-red-600 text-white'
                              : (acc.strikeCount || 0) >= 1
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          Strike {acc.strikeCount || 0}/3
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            acc.status === 'BANNED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {acc.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {acc.role !== 'MASTER_ADMIN' && (
                          <button
                            onClick={() => toggleBanUser(acc.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                              acc.status === 'BANNED'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {acc.status === 'BANNED' ? 'Unban Account' : 'Ban Account'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Community Posts Management */}
          <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
            <h3 className="text-base font-black text-[#1F4B2C]">
              Community Posts Moderation ({communityPosts.length})
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100 text-[#1F4B2C]">
                    <th className="p-3 font-bold">Author</th>
                    <th className="p-3 font-bold">Category</th>
                    <th className="p-3 font-bold">Content</th>
                    <th className="p-3 font-bold text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {communityPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-bold text-[#1F4B2C] whitespace-nowrap">
                        {post.authorName}
                        <span className="block text-[10px] text-neutral-400 font-normal">
                          {post.authorMunicipality} • {post.timestamp}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-bold">
                          {post.category}
                        </span>
                      </td>
                      <td className="p-3 text-neutral-700 max-w-md truncate">{post.content}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => deleteCommunityPost(post.id)}
                          className="px-3 py-1 rounded-full bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-black inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Post</span>
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

      {/* 5. PERMANENT VERIFICATION AUDIT TRAIL */}
      {adminTab === 'audit-trail' && (
        <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-lg space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-xl font-black text-[#1F4B2C] tracking-tight">
                Permanent Verification Audit Trail
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Tracked decisions logged by Master Admin (<code className="font-mono text-emerald-800 font-bold">russelthegreat1209@gmail.com</code>)
              </p>
            </div>

            <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 gap-1 text-xs font-bold">
              <button
                onClick={() => setAuditFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  auditFilter === 'ALL' ? 'bg-[#1F4B2C] text-white shadow-xs' : 'text-neutral-600'
                }`}
              >
                All ({verificationAuditLogs.length})
              </button>
              <button
                onClick={() => setAuditFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  auditFilter === 'APPROVED'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-neutral-600'
                }`}
              >
                Approved ({verificationAuditLogs.filter((l) => l.decision === 'APPROVED').length})
              </button>
              <button
                onClick={() => setAuditFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  auditFilter === 'REJECTED' ? 'bg-red-700 text-white shadow-xs' : 'text-neutral-600'
                }`}
              >
                Rejected ({verificationAuditLogs.filter((l) => l.decision === 'REJECTED').length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4FFFC] text-[#1F4B2C] font-black border-b border-neutral-200">
                <tr>
                  <th className="p-3">Audit Reference</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Commodity & Supplier</th>
                  <th className="p-3">Decision</th>
                  <th className="p-3">Reason Code / Notes</th>
                  <th className="p-3">Reviewer ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {verificationAuditLogs
                  .filter((log) => auditFilter === 'ALL' || log.decision === auditFilter)
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3 font-mono text-[11px] font-bold text-neutral-600">
                        {log.id}
                      </td>
                      <td className="p-3 whitespace-nowrap text-neutral-500 tabular-nums">
                        {new Date(log.timestamp).toLocaleString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-[#1F4B2C]">{log.commodityName}</p>
                        <p className="text-[10px] text-neutral-500">{log.supplierName}</p>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {log.decision === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            APPROVED & BOOSTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                            <XCircle className="w-3 h-3 text-red-700" />
                            REJECTED & WARNED
                          </span>
                        )}
                      </td>
                      <td className="p-3 max-w-xs">
                        <span className="px-1.5 py-0.5 rounded-xs bg-neutral-100 text-neutral-800 font-mono text-[10px] font-bold block w-fit mb-0.5">
                          {log.reasonCode}
                        </span>
                        {log.notes && (
                          <p className="text-[11px] text-neutral-600 line-clamp-1">{log.notes}</p>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-neutral-600">
                        {log.reviewerEmail}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              All verification decisions commit to session audit storage and Cloud SQL. 3 strikes automatically suspend market privileges.
            </span>
          </div>
        </div>
      )}

      {/* 6. CLOUD SQL & FIREBASE DATABASE EXPLORER */}
      {adminTab === 'db-explorer' && (
        <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-lg font-black text-[#1F4B2C]">
                Cloud SQL & Firebase Database Explorer
              </h3>
              <p className="text-xs text-neutral-600">
                Inspect transactions, stakeholder private messages, posted commodities, AI history, and archived NVAT bulletins
              </p>
            </div>
            <button
              onClick={() => void fetchDatabaseOverview()}
              disabled={isDbLoading}
              className="px-4 py-2 rounded-full btn-forest text-xs font-black flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C3E956] ${isDbLoading ? 'animate-spin' : ''}`} />
              <span>{isDbLoading ? 'Refreshing...' : 'Refresh Cloud SQL'}</span>
            </button>
          </div>

          {/* Summary Count Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Accounts', val: Math.max(accounts.length, dbOverview?.counts?.users || 0) },
              { label: 'Commodities', val: Math.max(commodities.length, dbOverview?.counts?.commodities || 0) },
              { label: 'Orders', val: Math.max(orders.length, dbOverview?.counts?.orders || 0) },
              { label: 'Messages', val: Math.max(chatMessages.length, dbOverview?.counts?.privateMessages || 0) },
              { label: 'AI History', val: Math.max(aiHistory.length, dbOverview?.counts?.aiHistory || 0) },
              { label: 'NVAT Dates', val: Math.max(nvatArchive.length, dbOverview?.counts?.nvatBulletins || 0) },
            ].map((card) => (
              <div key={card.label} className="p-3.5 rounded-2xl bg-white border border-neutral-200">
                <span className="text-[10px] font-black uppercase text-neutral-400">{card.label}</span>
                <p className="text-xl font-black text-[#1F4B2C] mt-0.5 tabular-nums">{card.val}</p>
              </div>
            ))}
          </div>

          {/* Sub-table Selector */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'orders', label: 'Orders & Trades' },
              { id: 'messages', label: 'Private Messages' },
              { id: 'commodities', label: 'Commodities' },
              { id: 'posts', label: 'Community Posts' },
              { id: 'ai-history', label: 'AI History Ledger' },
              { id: 'nvat', label: 'NVAT Bulletins Archive' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setDbTableTab(t.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
                  dbTableTab === t.id
                    ? 'bg-[#1F4B2C] text-[#C3E956]'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          {dbTableTab === 'orders' && (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-[#1F4B2C] font-black border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Commodity</th>
                    <th className="p-3">Buyer → Supplier</th>
                    <th className="p-3">Qty & Total</th>
                    <th className="p-3">Delivery Mode</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-mono font-bold text-[#1F4B2C]">{ord.id}</td>
                      <td className="p-3 font-bold">{ord.commodityName}</td>
                      <td className="p-3 text-neutral-600">
                        {ord.buyerName} → {ord.supplierName}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#4D7111]">
                        {ord.quantityKg} kg (₱{ord.totalAmountPhp.toLocaleString()})
                      </td>
                      <td className="p-3 text-neutral-600">{ord.deliveryMode}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Private Messages Table */}
          {dbTableTab === 'messages' && (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-[#1F4B2C] font-black border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Thread ID</th>
                    <th className="p-3">Sender</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {chatMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-mono text-[11px] text-neutral-500">{msg.threadId}</td>
                      <td className="p-3 font-bold text-[#1F4B2C]">{msg.senderName}</td>
                      <td className="p-3 text-neutral-600">{msg.senderRole}</td>
                      <td className="p-3 text-neutral-700 max-w-md truncate">{msg.text}</td>
                      <td className="p-3 text-neutral-400 whitespace-nowrap">
                        {new Date(msg.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Commodities Table */}
          {dbTableTab === 'commodities' && (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-[#1F4B2C] font-black border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Commodity</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Municipality</th>
                    <th className="p-3">Stock & Price</th>
                    <th className="p-3">Quality Grade</th>
                    <th className="p-3">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {commodities.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-bold text-[#1F4B2C]">{c.name}</td>
                      <td className="p-3 text-neutral-600">{c.supplierName}</td>
                      <td className="p-3 text-neutral-600">{c.municipality}</td>
                      <td className="p-3 font-mono font-bold text-[#4D7111]">
                        {c.availableKg} kg @ ₱{c.pricePerKg}/kg
                      </td>
                      <td className="p-3 text-neutral-700">{c.qualityGrade}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          {c.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Community Posts Table */}
          {dbTableTab === 'posts' && (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-[#1F4B2C] font-black border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Author</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Content</th>
                    <th className="p-3">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {communityPosts.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-bold text-[#1F4B2C]">{p.authorName}</td>
                      <td className="p-3 text-neutral-600">{p.category}</td>
                      <td className="p-3 text-neutral-700 max-w-md truncate">{p.content}</td>
                      <td className="p-3 font-mono font-bold">{p.comments?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AI History Table */}
          {dbTableTab === 'ai-history' && (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-[#1F4B2C] font-black border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Agent</th>
                    <th className="p-3">User Role</th>
                    <th className="p-3">Prompt</th>
                    <th className="p-3">Response Summary</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {aiHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-bold text-[#1F4B2C] whitespace-nowrap">
                        {h.agentType}
                      </td>
                      <td className="p-3 text-neutral-600">{h.userRole}</td>
                      <td className="p-3 text-neutral-700 max-w-xs truncate">{h.prompt}</td>
                      <td className="p-3 text-neutral-600 max-w-md truncate">{h.responseSummary}</td>
                      <td className="p-3 text-neutral-400 whitespace-nowrap">
                        {new Date(h.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* NVAT Bulletins Archive Table */}
          {dbTableTab === 'nvat' && (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-[#1F4B2C] font-black border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Bulletin Date</th>
                    <th className="p-3">Commodities Count</th>
                    <th className="p-3">Executive Summary</th>
                    <th className="p-3">Google Sheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {nvatArchive.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-mono font-bold text-[#1F4B2C]">{b.date}</td>
                      <td className="p-3 font-bold">{b.items.length} commodities</td>
                      <td className="p-3 text-neutral-700 max-w-md truncate">
                        {b.executiveSummary[0]}
                      </td>
                      <td className="p-3">
                        {b.googleSheetUrl ? (
                          <a
                            href={b.googleSheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 font-bold underline"
                          >
                            Open Sheet
                          </a>
                        ) : (
                          <span className="text-neutral-400">Not synced</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {dbOverview?.configured === false && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Cloud SQL connection pool falls back cleanly to live session records whenever a local environment lacks database credentials.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Google Sheets Export Confirmation Modal */}
      {isSheetsConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-[#91EAAF] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-[#1F4B2C]">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-black">Export NVAT Bulletin to Google Sheets</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              This will authorize your Google account and create a Google Sheets spreadsheet containing the structured NVAT daily prices for{' '}
              <span className="font-bold text-[#1F4B2C]">{nvatReport.date}</span> ({nvatReport.items.length} commodities).
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSheetsConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSheetsExport}
                disabled={isExportingSheets}
                className="flex-1 py-2.5 rounded-xl btn-forest text-xs font-black disabled:opacity-50"
              >
                {isExportingSheets ? 'Exporting...' : 'Authorize & Export'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
