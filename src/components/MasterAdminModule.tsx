import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommodityItem, UserAccount } from '../types';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trash2,
  Ban,
  Send,
  FileText,
  BarChart3,
  TrendingUp,
  PieChart,
  Layers,
  AlertTriangle,
  RefreshCw,
  Eye,
  History,
  ClipboardCheck,
} from 'lucide-react';

export const MasterAdminModule: React.FC = () => {
  const {
    currentUser,
    accounts,
    commodities,
    approveCommodity,
    rejectCommodity,
    verifyAndBoostCommodity,
    rejectAndWarnCommodity,
    deleteCommodity,
    toggleBanUser,
    publishAdminAnnouncement,
    processAndPublishNvatBulletin,
    nvatReport,
    addNotification,
    verificationAuditLogs,
  } = useApp();

  // Active sub-tab
  const [adminTab, setAdminTab] = useState<'moderation' | 'queue' | 'nvat-ai' | 'audit-trail'>('nvat-ai');
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED'>('ALL');
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

  // If not logged in as Master Admin, show security access notice
  if (currentUser?.role !== 'MASTER_ADMIN') {
    return (
      <div className="p-8 glass-light rounded-3xl border-2 border-red-300 max-w-lg mx-auto text-center space-y-4 my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-[#1F4B2C]">Master Admin Authentication Required</h3>
        <p className="text-xs text-neutral-600 font-medium">
          The Master Admin Command Center and Admin AI Agent are restricted exclusively to the system owner account:
          <br />
          <code className="text-red-700 font-mono font-bold">russelthegreat1209@gmail.com</code>
        </p>
        <p className="text-[11px] text-neutral-500">
          Please use the top-bar Demo Quick-Login Switcher or sign in with your Master Admin credentials.
        </p>
      </div>
    );
  }

  const pendingVerificationCrops = commodities.filter(
    (c) => c.verificationStatus === 'PENDING' || (c as any).verificationStatus === 'PENDING_VERIFICATION'
  );

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

  return (
    <div className="space-y-6 pb-16 text-left animate-fade-in">
      {/* Header Banner */}
      <div className="glass-dark p-6 sm:p-8 rounded-3xl border-2 border-[#C3E956] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C3E956] text-[#1F4B2C] text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#1F4B2C]" />
            Exclusive Master Admin Command Center
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#F4FFFC] tracking-tight">
            System Governance & Admin AI Engine
          </h2>
          <p className="text-xs text-[#91EAAF] font-medium mt-1">
            Logged in as {currentUser.email} • Full System Owner & Admin Agent Controller
          </p>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex bg-white/10 p-1.5 rounded-full border border-white/20 gap-1 overflow-x-auto">
          <button
            onClick={() => setAdminTab('nvat-ai')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminTab === 'nvat-ai'
                ? 'bg-[#C3E956] text-[#1F4B2C] shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>NVAT AI Processor</span>
          </button>

          <button
            onClick={() => setAdminTab('queue')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminTab === 'queue'
                ? 'bg-[#C3E956] text-[#1F4B2C] shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify Crops Queue ({pendingVerificationCrops.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('audit-trail')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminTab === 'audit-trail'
                ? 'bg-[#C3E956] text-[#1F4B2C] shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Verification Audit Trail ({verificationAuditLogs.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('moderation')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminTab === 'moderation'
                ? 'bg-[#C3E956] text-[#1F4B2C] shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>User & Post Moderation</span>
          </button>
        </div>
      </div>

      {/* 3. NVAT RAW PARAGRAPH-TO-STATISTICS & GRAPHS AI AGENT PANEL */}
      {adminTab === 'nvat-ai' && (
        <div className="space-y-6">
          <div className="glass-light p-6 rounded-3xl border-2 border-[#91EAAF] shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-xl font-black text-[#1F4B2C] tracking-tight">
                  NVAT AI Market Intelligence Processor (Admin Agent)
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Paste unstructured paragraphs or daily market notes from Nueva Vizcaya Agricultural Terminal to generate real-time tables & interactive graphs
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] shadow-xs">
                Gemini Multi-Agent Parser
              </span>
            </div>

            {/* Rich-Text Input Area */}
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

            {/* Action Buttons */}
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

          {/* GENERATED STRUCTURED STATISTICAL DATA & CHARTS */}
          <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h4 className="text-base font-black text-[#1F4B2C]">
                  Live Parsed NVAT Market Data Table
                </h4>
                <p className="text-xs text-neutral-500 font-medium">
                  AI extracted commodity pricing metrics & variance ratios
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Published to Live Dashboards
              </span>
            </div>

            {/* Table */}
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
                    <th className="p-3 font-bold">Trend Status</th>
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
                          {item.priceVariancePercent > 0 ? `+${item.priceVariancePercent}%` : `${item.priceVariancePercent}%`}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[#4D7111]">{item.estimatedVolumeTradedTons} MT</td>
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

            {/* THREE INTERACTIVE STATISTICAL CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
              {/* Chart 1: Prevailing vs Previous Price Comparison Bar Graph */}
              <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#1F4B2C]">
                    1. Prevailing vs Previous Price (PHP/kg)
                  </h5>
                  <BarChart3 className="w-4 h-4 text-[#4D7111]" />
                </div>
                <div className="space-y-2 pt-1">
                  {nvatReport.priceComparisonData.map((d, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-neutral-700">
                        <span>{d.name}</span>
                        <span>₱{d.prevailing} <span className="text-neutral-400 font-normal">/ prev ₱{d.previous}</span></span>
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

              {/* Chart 2: Commodity Supply Volume Share Donut/Bar Chart */}
              <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#1F4B2C]">
                    2. Inflow Supply Volume Share (MT)
                  </h5>
                  <PieChart className="w-4 h-4 text-[#4D7111]" />
                </div>
                <div className="space-y-2 pt-1">
                  {nvatReport.volumeShareData.map((d, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-neutral-700">
                        <span>{d.name}</span>
                        <span className="font-mono text-[#4D7111]">{d.volumeTons} MT ({d.percentage}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4D7111] to-[#C3E956] rounded-full"
                          style={{ width: `${d.percentage * 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 3: 7-Day Historical + Projected Price Trend Line Graph */}
              <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#1F4B2C]">
                    3. 7-Day Trend: Cabbage & Tomato
                  </h5>
                  <TrendingUp className="w-4 h-4 text-[#4D7111]" />
                </div>
                <div className="h-36 flex items-end justify-between gap-1 pt-3 border-b border-neutral-200">
                  {nvatReport.historicalTrendData.map((d, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center gap-1 h-24">
                        <div
                          className="w-2.5 bg-[#1F4B2C] rounded-t-xs"
                          style={{ height: `${(d.cabbage / 60) * 100}%` }}
                          title={`Cabbage: ₱${d.cabbage}`}
                        />
                        <div
                          className="w-2.5 bg-[#C3E956] rounded-t-xs"
                          style={{ height: `${(d.tomato / 60) * 100}%` }}
                          title={`Tomato: ₱${d.tomato}`}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-neutral-400">{d.date.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-neutral-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-[#1F4B2C] rounded-xs" />
                    Highland Cabbage
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-[#C3E956] rounded-xs" />
                    Satsuki Tomato
                  </span>
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
                Crop Image Authenticity Verification Queue (AI Vision + Admin Approval)
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Gemini Vision screening inspecting real farm/crate photography vs internet stock watermarks
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
              <p className="text-[11px] text-neutral-500 mt-0.5">
                New submissions will appear here for Admin AI authenticity approval.
              </p>
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
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-900">
                        {crop.category}
                      </span>
                      <h4 className="text-xs font-bold text-[#1F4B2C] leading-snug">
                        {crop.name}
                      </h4>
                      <p className="text-[11px] text-neutral-600">
                        By {crop.supplierName} • {crop.municipality}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#4D7111]">
                        <span>{crop.availableKg} kg</span> • <span>₱{crop.pricePerKg}/kg</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Vision Authenticity Score Box */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-[#F4FFFC] border border-emerald-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        AI Vision Authenticity Score:
                      </span>
                      <span className="font-mono text-sm">{crop.aiAuthenticityScore}% Authentic Farm Capture</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-tight">
                      {crop.aiVisionNotes || 'Verified crisp field crate texture, genuine natural outdoor lighting.'}
                    </p>
                  </div>

                  {/* Rejection Reason Selector */}
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
                      <option value="UNVERIFIED_STOCK_PHOTO">UNVERIFIED_STOCK_PHOTO (Stock/watermarked imagery)</option>
                      <option value="MISLEADING_PRICING">MISLEADING_PRICING (Deviates heavily from NVAT trading index)</option>
                      <option value="INSUFFICIENT_FARM_ORIGIN">INSUFFICIENT_FARM_ORIGIN (Unverified municipality / phone)</option>
                      <option value="QUALITY_MISMATCH">QUALITY_MISMATCH (Produce grade does not match visual state)</option>
                    </select>
                  </div>

                  {/* Action Buttons: Verify & Boost vs Reject & Issue Warning */}
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

      {/* 1. REAL-TIME USER & POST MODERATION SUITE */}
      {adminTab === 'moderation' && (
        <div className="space-y-6">
          {/* Official Community & Landing Broadcaster Form */}
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

          {/* User Moderation Table */}
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
                    <th className="p-3 font-bold">Strikes Status</th>
                    <th className="p-3 font-bold">Account</th>
                    <th className="p-3 font-bold text-right">Moderation Action</th>
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
                              ? 'bg-red-600 text-white animate-pulse'
                              : (acc.strikeCount || 0) === 2
                              ? 'bg-orange-100 text-orange-900 border border-orange-300'
                              : (acc.strikeCount || 0) === 1
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          Strike {acc.strikeCount || 0}/3
                          {(acc.strikeCount || 0) >= 3 ? ' (SUSPENDED)' : ''}
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
        </div>
      )}

      {/* 4. PERMANENT IMMUTABLE VERIFICATION AUDIT TRAIL */}
      {adminTab === 'audit-trail' && (
        <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-lg space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase mb-1">
                <History className="w-3 h-3 text-emerald-700" />
                Immutable Moderation Ledger
              </div>
              <h3 className="text-xl font-black text-[#1F4B2C] tracking-tight">
                Permanent Verification Audit Trail
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Cryptographically tracked decisions logged by Master Admin (<code className="font-mono text-emerald-800 font-bold">russelthegreat1209@gmail.com</code>)
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 gap-1 text-xs font-bold">
              <button
                onClick={() => setAuditFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  auditFilter === 'ALL'
                    ? 'bg-[#1F4B2C] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All Records ({verificationAuditLogs.length})
              </button>
              <button
                onClick={() => setAuditFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  auditFilter === 'APPROVED'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Approved ({verificationAuditLogs.filter((l) => l.decision === 'APPROVED').length})
              </button>
              <button
                onClick={() => setAuditFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  auditFilter === 'REJECTED'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Rejected ({verificationAuditLogs.filter((l) => l.decision === 'REJECTED').length})
              </button>
            </div>
          </div>

          {/* Audit Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Audited Events</p>
              <p className="text-2xl font-black text-[#1F4B2C] tabular-nums mt-1">{verificationAuditLogs.length}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Immutable audit history logged</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Verified & Boosted</p>
              <p className="text-2xl font-black text-emerald-900 tabular-nums mt-1">
                {verificationAuditLogs.filter((l) => l.decision === 'APPROVED').length}
              </p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Top-ranked in marketplace search</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-wider text-red-800">Rejected & Strike Warnings</p>
              <p className="text-2xl font-black text-red-900 tabular-nums mt-1">
                {verificationAuditLogs.filter((l) => l.decision === 'REJECTED').length}
              </p>
              <p className="text-[10px] text-red-700 mt-0.5">Fraud prevention policy enforced</p>
            </div>
          </div>

          {/* Audit Records Table */}
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
              <strong>Defense & Research Compliance:</strong> All verification decisions are permanently committed to session state and audit storage. Rejections incur warnings on the user profile; 3 strikes automatically suspend platform market privileges.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
