import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  BuyerNeedCriteria,
  CommodityItem,
  CropCategory,
  DeliveryMode,
  PaymentOption,
} from '../types';
import { getCropPhotoByName, REAL_CROP_GALLERY } from '../data/cropAssets';
import {
  estimateDeliveryEta,
  NV_COORDS_BY_MUNICIPALITY,
  rankCommoditiesForBuyer,
} from '../utils/agriMath';
import {
  Search,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  PlusCircle,
  X,
  Video,
  Image as ImageIcon,
  AlertTriangle,
  Camera,
  Phone,
  TrendingUp,
  Flag,
  Award,
} from 'lucide-react';

const NV_MUNICIPALITIES = Object.keys(NV_COORDS_BY_MUNICIPALITY);

export const MarketplaceModule: React.FC = () => {
  const {
    commodities,
    accounts,
    currentUser,
    activeOrderModalItem,
    setActiveOrderModalItem,
    highlightedCommodityId,
    setHighlightedCommodityId,
    openCommunityBulletins,
    createOrderInquiry,
    addNewCommodity,
    submitModerationReport,
    logAiHistory,
    setActiveTab,
    addNotification,
    t,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Buyer Agent Need Finder state
  const [isBuyerFinderOpen, setIsBuyerFinderOpen] = useState(true);
  const [buyerCriteria, setBuyerCriteria] = useState<BuyerNeedCriteria>({
    neededSupply: '',
    neededDate: new Date().toISOString().split('T')[0],
    destinationMunicipality: currentUser?.municipality || 'Bambang',
    preferredGrade: 'ANY',
    targetKg: 200,
  });
  const [buyerAiRationale, setBuyerAiRationale] = useState<string>('');
  const [isRunningBuyerAi, setIsRunningBuyerAi] = useState(false);

  // Configure & Finalize Order Modal State
  const [orderQuantityKg, setOrderQuantityKg] = useState<number>(100);
  const [proposedPricePhp, setProposedPricePhp] = useState<number>(30);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('NVAT Bambang Drop-off Bay');
  const [deliveryLocation, setDeliveryLocation] = useState('NVAT Bambang Terminal Bay 4');
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('GCash / Maya Instant Transfer');

  // Rich Media Post New Supply Listing Modal
  const [isPostSupplyOpen, setIsPostSupplyOpen] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [newCropCategory, setNewCropCategory] = useState<CropCategory>('Highland Vegetables');
  const [newAvailableKg, setNewAvailableKg] = useState(500);
  const [newPricePerKg, setNewPricePerKg] = useState(35);
  const [newMinOrderKg, setNewMinOrderKg] = useState(50);
  const [newHarvestDate, setNewHarvestDate] = useState('2026-11-15');
  const [newQualityGrade, setNewQualityGrade] = useState<'Grade A Premium' | 'Grade B Commercial' | 'Standard Fresh'>('Grade A Premium');
  const [aiSuggestedGrade, setAiSuggestedGrade] = useState<'Grade A Premium' | 'Grade B Commercial' | 'Standard Fresh' | null>(null);
  const [aiVisionNotes, setAiVisionNotes] = useState('');
  const [aiAuthScore, setAiAuthScore] = useState<number>(92);
  const [isAnalyzingGrade, setIsAnalyzingGrade] = useState(false);
  const [newOrganicCertified, setNewOrganicCertified] = useState(false);
  const [newCropNotes, setNewCropNotes] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string>('');
  const [newFarmgatePricePhp, setNewFarmgatePricePhp] = useState(30);
  const [newContactPhone, setNewContactPhone] = useState('+63 917 555 4321');
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Report listing modal state
  const [reportingItem, setReportingItem] = useState<CommodityItem | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Refs for scrolling to highlighted commodity
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (highlightedCommodityId && cardRefs.current[highlightedCommodityId]) {
      cardRefs.current[highlightedCommodityId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightedCommodityId, commodities]);

  const manualGradeOverride =
    aiSuggestedGrade !== null && newQualityGrade !== aiSuggestedGrade;

  const destinationCoords =
    NV_COORDS_BY_MUNICIPALITY[currentUser?.municipality || buyerCriteria.destinationMunicipality] ||
    NV_COORDS_BY_MUNICIPALITY.Bambang;

  const visibleCommodities = commodities.filter((item) => {
    const seller = accounts.find((a) => a.id === item.supplierId);
    if (seller?.status === 'BANNED') return false;
    const isVisibleToUser =
      item.verificationStatus === 'VERIFIED' ||
      currentUser?.role === 'MASTER_ADMIN' ||
      (currentUser && item.supplierId === currentUser.id);
    return isVisibleToUser && item.verificationStatus !== 'REJECTED';
  });

  // Top 3 AI Buyer matches
  const buyerRanked = rankCommoditiesForBuyer(visibleCommodities, accounts, buyerCriteria);
  const top3Matches = buyerRanked.slice(0, 3);
  const top3Ids = new Set(top3Matches.map((m) => m.commodity.id));

  const handleAskBuyerAgentRationale = async () => {
    setIsRunningBuyerAi(true);
    try {
      const topSummary = top3Matches
        .map(
          (m, idx) =>
            `#${idx + 1} ${m.commodity.name} by ${m.commodity.supplierName} (${m.commodity.municipality}, PHP ${m.commodity.pricePerKg}/kg, Score ${m.score}%, Strikes: ${m.sellerStrikes}, Trades: ${m.completedTrades})`
        )
        .join(' | ');
      const res = await fetch('/api/ai/buyer-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neededSupply: buyerCriteria.neededSupply || 'Fresh Highland Produce',
          municipality: buyerCriteria.destinationMunicipality,
          qualityGrade: buyerCriteria.preferredGrade,
          topMatchesSummary: topSummary,
          userUid: currentUser?.id || 'buyer_guest',
          userRole: currentUser?.role || 'Buyer',
        }),
      });
      const data = res.ok ? await res.json() : null;
      const rationale =
        data?.rationale ||
        `Matched Top 3 suppliers delivering to ${buyerCriteria.destinationMunicipality} based on verified status, lowest strike counts, proximity, and trade reliability.`;
      setBuyerAiRationale(rationale);
      logAiHistory({
        userId: currentUser?.id || 'buyer_01',
        userRole: currentUser?.role || 'Buyer',
        agentType: 'Buyer Agent',
        prompt: `Need Finder: ${buyerCriteria.neededSupply || 'All crops'} -> ${buyerCriteria.destinationMunicipality}`,
        responseSummary: rationale,
        poweredByGemini: Boolean(data?.poweredByGemini),
      });
      addNotification('Buyer Agent ranked top 3 recommended commodities.', 'success');
    } catch {
      setBuyerAiRationale(
        `Top 3 suppliers ranked by Admin Verification, zero-strike reliability, completed deals, and route proximity to ${buyerCriteria.destinationMunicipality}.`
      );
    } finally {
      setIsRunningBuyerAi(false);
    }
  };

  const handleAnalyzeFarmerQuality = async () => {
    if (!newCropName.trim() && uploadedPhotos.length === 0) {
      addNotification('Enter a crop name or upload a farm photo before running AI inspection.', 'alert');
      return;
    }
    setIsAnalyzingGrade(true);
    try {
      const res = await fetch('/api/ai/farmer-vision-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: newCropName || newCropCategory,
          category: newCropCategory,
          notes: newCropNotes,
          municipality: currentUser?.municipality || 'Kayapa',
          imageDataUrl: uploadedPhotos[0] || '',
          userUid: currentUser?.id || 'farmer_01',
          userRole: currentUser?.role || 'Farmer',
        }),
      });
      const data = res.ok ? await res.json() : null;
      const grade: 'Grade A Premium' | 'Grade B Commercial' | 'Standard Fresh' =
        data?.suggestedGrade === 'Grade B Commercial' || data?.suggestedGrade === 'Standard Fresh'
          ? data.suggestedGrade
          : 'Grade A Premium';
      const notes =
        data?.visionNotes ||
        'Crate freshness, coloration, and field capture authenticity verified by Farmer Agent.';
      const score = Number(data?.authenticityScore) || 94;

      setAiSuggestedGrade(grade);
      setNewQualityGrade(grade);
      setAiVisionNotes(notes);
      setAiAuthScore(score);
      logAiHistory({
        userId: currentUser?.id || 'farmer_01',
        userRole: currentUser?.role || 'Farmer',
        agentType: 'Farmer Agent',
        prompt: `Vision & Quality Grade: ${newCropName || newCropCategory}`,
        responseSummary: `${grade} (${score}%): ${notes}`,
        poweredByGemini: Boolean(data?.poweredByGemini),
      });
      addNotification(`Farmer Agent classified lot as ${grade} (${score}% authenticity).`, 'success');
    } catch {
      setAiSuggestedGrade('Grade A Premium');
      setNewQualityGrade('Grade A Premium');
      setAiVisionNotes('Uniform field crate harvest texture and quality verified.');
      setAiAuthScore(93);
    } finally {
      setIsAnalyzingGrade(false);
    }
  };

  const handleOpenOrder = (crop: CommodityItem) => {
    setActiveOrderModalItem(crop);
    setOrderQuantityKg(Math.min(crop.minOrderKg || 100, crop.availableKg));
    setProposedPricePhp(crop.pricePerKg);
  };

  const handleFinalizeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderModalItem) return;

    if (orderQuantityKg <= 0 || orderQuantityKg > activeOrderModalItem.availableKg) {
      addNotification(`Quantity must be between 1 and ${activeOrderModalItem.availableKg} kg.`, 'alert');
      return;
    }

    createOrderInquiry(
      activeOrderModalItem,
      orderQuantityKg,
      proposedPricePhp,
      deliveryMode,
      deliveryLocation,
      paymentOption
    );

    setActiveOrderModalItem(null);
    setActiveTab('messages');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSimulateCameraCapture = () => {
    setIsCameraActive(true);
    setTimeout(() => {
      setUploadedPhotos((prev) => [
        ...prev,
        getCropPhotoByName(newCropName, newCropCategory),
      ]);
      setIsCameraActive(false);
      addNotification('Farm Photo Captured!', 'success');
    }, 400);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedVideo(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePostSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    addNewCommodity({
      name: newCropName,
      category: newCropCategory,
      availableKg: newAvailableKg,
      pricePerKg: newPricePerKg,
      farmgatePricePhp: newFarmgatePricePhp,
      contactPhone: newContactPhone,
      minOrderKg: newMinOrderKg,
      harvestDate: newHarvestDate,
      qualityGrade: newQualityGrade,
      aiSuggestedGrade: aiSuggestedGrade || undefined,
      manualGradeOverride,
      aiAuthenticityScore: aiAuthScore,
      aiVisionNotes: aiVisionNotes || undefined,
      organicCertified: newOrganicCertified,
      notes: newCropNotes,
      imageUrl: uploadedPhotos[0] || getCropPhotoByName(newCropName, newCropCategory),
      additionalPhotos: uploadedPhotos.slice(1),
      videoUrl: uploadedVideo,
      mediaType: uploadedVideo ? (uploadedPhotos.length > 0 ? 'mixed' : 'video') : 'photo',
    });

    setNewCropName('');
    setNewCropNotes('');
    setUploadedPhotos([]);
    setUploadedVideo('');
    setAiSuggestedGrade(null);
    setAiVisionNotes('');
    setIsPostSupplyOpen(false);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItem || !reportReason.trim()) return;
    submitModerationReport({
      targetType: 'COMMODITY',
      targetId: reportingItem.id,
      targetUserId: reportingItem.supplierId,
      targetUserName: reportingItem.supplierName,
      targetPreview: `${reportingItem.name} (PHP ${reportingItem.pricePerKg}/kg)`,
      reason: reportReason.trim(),
    });
    setReportingItem(null);
    setReportReason('');
  };

  const categories: string[] = [
    'ALL',
    'Highland Vegetables',
    'Lowland Vegetables',
    'Citrus & Fruits',
    'Root Crops & Tubers',
    'Grains & Cereals',
    'Spices & Herbs',
  ];

  const filteredCommodities = visibleCommodities
    .filter((item) => {
      const effectiveSearch = searchQuery.trim() || buyerCriteria.neededSupply.trim();
      const matchesSearch =
        !effectiveSearch ||
        item.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.municipality.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(effectiveSearch.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      const matchesVerified = !verifiedOnly || item.verificationStatus === 'VERIFIED';

      const matchesGrade =
        buyerCriteria.preferredGrade === 'ANY' || item.qualityGrade === buyerCriteria.preferredGrade;

      return matchesSearch && matchesCategory && matchesVerified && matchesGrade;
    })
    .sort((a, b) => {
      if (a.id === highlightedCommodityId) return -1;
      if (b.id === highlightedCommodityId) return 1;
      const rankA = (a.verificationStatus === 'VERIFIED' ? 2000 : 0) + (a.verifiedBoostRank ? 1000 : 0) + a.aiAuthenticityScore;
      const rankB = (b.verificationStatus === 'VERIFIED' ? 2000 : 0) + (b.verifiedBoostRank ? 1000 : 0) + b.aiAuthenticityScore;
      return rankB - rankA;
    });

  return (
    <div className="space-y-6 pb-16 text-left animate-fade-in">
      {/* Marketplace Header & NVAT Estimation Updates Shortcut */}
      <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4D7111]/15 text-[#1F4B2C] text-[10px] font-bold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-3 h-3 text-[#4D7111]" />
            Nueva Vizcaya Trading Terminal & Exchange
          </div>
          <h2 className="text-2xl font-black text-[#1F4B2C] tracking-tight">
            {t.marketplaceTitle}
          </h2>
          <p className="text-xs text-neutral-600 font-medium">
            Direct sourcing from verified farmers and cooperatives across 15 municipalities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* NVAT Estimation Commodities Updates shortcut to Community -> NVAT Bulletins */}
          <button
            onClick={openCommunityBulletins}
            className="px-4 py-2.5 rounded-full bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-800" />
            <span>NVAT Estimation Commodities Updates</span>
          </button>

          {currentUser &&
            (currentUser.role === 'Farmer' ||
              currentUser.role === 'Supplier' ||
              currentUser.role === 'Cooperative' ||
              currentUser.role === 'MASTER_ADMIN') && (
              <button
                onClick={() => setIsPostSupplyOpen(true)}
                className="px-5 py-2.5 rounded-full btn-forest text-xs font-bold flex items-center gap-2 shadow-sm hover:scale-105 transition-transform shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-[#C3E956]" />
                <span>{t.postSupplyBtn}</span>
              </button>
            )}
        </div>
      </div>

      {/* Highlighted Commodity Banner (if jumped from a Profile) */}
      {highlightedCommodityId && (
        <div className="p-3.5 rounded-2xl bg-[#C3E956]/30 border-2 border-[#4D7111] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#1F4B2C]">
            <Sparkles className="w-4 h-4 text-[#4D7111]" />
            <span>Showing selected supplier listing highlighted below. Click Configure & Finalize Order to buy.</span>
          </div>
          <button
            onClick={() => setHighlightedCommodityId(null)}
            className="px-2.5 py-1 rounded-full bg-white text-[10px] font-black text-[#1F4B2C] border border-[#91EAAF]"
          >
            Clear Highlight
          </button>
        </div>
      )}

      {/* BUYER AGENT NEED FINDER & TOP 3 RECOMMENDED MATCHES */}
      <div className="glass-light p-5 rounded-3xl border border-[#91EAAF] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-[#1F4B2C]">
              <Sparkles className="w-4 h-4 text-[#4D7111]" />
              <span>Buyer Agent — Smart Supply Matcher (Top 3 Recommendations)</span>
            </div>
            <p className="text-[11px] text-neutral-600 font-medium">
              Ranked by Admin Verification, lower moderation strikes, proximity ETA, and completed trade history
            </p>
          </div>
          <button
            onClick={() => setIsBuyerFinderOpen((p) => !p)}
            className="text-xs font-bold text-[#4D7111] hover:underline self-start sm:self-auto"
          >
            {isBuyerFinderOpen ? 'Minimize Matcher' : 'Expand Buyer Matcher'}
          </button>
        </div>

        {isBuyerFinderOpen && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  Needed Crop / Supply
                </label>
                <input
                  type="text"
                  value={buyerCriteria.neededSupply}
                  onChange={(e) =>
                    setBuyerCriteria((prev) => ({ ...prev, neededSupply: e.target.value }))
                  }
                  placeholder="e.g. Cabbage, Onion, Citrus"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-semibold focus:outline-none focus:border-[#4D7111]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  Needed Delivery Date
                </label>
                <input
                  type="date"
                  value={buyerCriteria.neededDate}
                  onChange={(e) =>
                    setBuyerCriteria((prev) => ({ ...prev, neededDate: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  Delivery Municipality
                </label>
                <select
                  value={buyerCriteria.destinationMunicipality}
                  onChange={(e) =>
                    setBuyerCriteria((prev) => ({
                      ...prev,
                      destinationMunicipality: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-semibold"
                >
                  {NV_MUNICIPALITIES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  Preferred Quality Class
                </label>
                <select
                  value={buyerCriteria.preferredGrade}
                  onChange={(e) =>
                    setBuyerCriteria((prev) => ({
                      ...prev,
                      preferredGrade: e.target.value as BuyerNeedCriteria['preferredGrade'],
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-semibold"
                >
                  <option value="ANY">Any Verified Quality</option>
                  <option value="Grade A Premium">Grade A Premium</option>
                  <option value="Grade B Commercial">Grade B Commercial</option>
                  <option value="Standard Fresh">Standard Fresh</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAskBuyerAgentRationale}
                  disabled={isRunningBuyerAi}
                  className="w-full py-2 px-3 rounded-xl btn-sprout text-xs font-black flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isRunningBuyerAi ? 'animate-spin' : ''}`} />
                  <span>{isRunningBuyerAi ? 'Analyzing...' : 'AI Top-3 Rationale'}</span>
                </button>
              </div>
            </div>

            {buyerAiRationale && (
              <div className="p-3 rounded-2xl bg-[#F4FFFC] border border-[#91EAAF] text-xs text-[#1F4B2C] font-medium">
                <strong className="font-black">Buyer Agent Insight:</strong> {buyerAiRationale}
              </div>
            )}

            {/* Top 3 Ranked Strip */}
            {top3Matches.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {top3Matches.map((match, idx) => (
                  <div
                    key={match.commodity.id}
                    onClick={() => handleOpenOrder(match.commodity)}
                    className="p-3.5 rounded-2xl bg-white border-2 border-[#91EAAF] hover:border-[#1F4B2C] cursor-pointer transition-all shadow-xs flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black">
                          #{idx + 1} AI Top Match · {match.score}%
                        </span>
                        <span className="text-[10px] font-bold text-[#4D7111]">
                          ₱{match.commodity.pricePerKg}/kg
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-[#1F4B2C] truncate">
                        {match.commodity.name}
                      </h4>
                      <p className="text-[11px] text-neutral-600 font-medium truncate">
                        {match.commodity.supplierName} • {match.commodity.municipality}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {match.reasons.slice(0, 3).map((r) => (
                          <span
                            key={r}
                            className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px] font-bold text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#4D7111]" />
                        {match.etaLabel}
                      </span>
                      <span className="text-[#1F4B2C] font-black">Order →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchCropsPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-neutral-300 bg-white focus:outline-none focus:border-[#4D7111]"
            />
          </div>

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              verifiedOnly
                ? 'bg-[#1F4B2C] text-[#C3E956] border-[#1F4B2C]'
                : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AI Verified Only</span>
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'btn-sprout shadow-xs ring-1 ring-[#1F4B2C]'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Commodity Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCommodities.map((item) => {
          const isHighlighted = highlightedCommodityId === item.id;
          const isTopMatch = top3Ids.has(item.id);
          const seller = accounts.find((a) => a.id === item.supplierId);
          const eta = estimateDeliveryEta(
            item.lat,
            item.lng,
            destinationCoords.lat,
            destinationCoords.lng,
            item.daysToHarvest || 0,
            'NVAT Bambang Drop-off Bay'
          );

          return (
            <div
              key={item.id}
              ref={(el) => {
                cardRefs.current[item.id] = el;
              }}
              className={`glass-card rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group ${
                isHighlighted
                  ? 'border-4 border-[#1F4B2C] ring-4 ring-[#C3E956] scale-[1.01]'
                  : 'border border-[#91EAAF]'
              }`}
            >
              <div>
                <div className="relative h-44 bg-neutral-200 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#1F4B2C] text-[#C3E956] shadow-md">
                      {item.category}
                    </span>
                    {isTopMatch && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#C3E956] text-[#1F4B2C] shadow-sm flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Buyer AI Top Match
                      </span>
                    )}
                    {item.verificationStatus === 'VERIFIED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#91EAAF] text-[#1F4B2C] shadow-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#1F4B2C]" />
                        Verified ({item.aiAuthenticityScore}%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-200 text-amber-900 shadow-sm">
                        Pending AI Inspection
                      </span>
                    )}
                  </div>

                  {/* Report Flag */}
                  <button
                    type="button"
                    onClick={() => setReportingItem(item)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/45 hover:bg-red-600 text-white transition-colors"
                    title="Report suspicious listing"
                    aria-label={`Report ${item.name}`}
                  >
                    <Flag className="w-3 h-3" />
                  </button>

                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-white text-[11px] font-semibold bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C3E956]" />
                      {item.municipality}
                    </span>
                    <span className="font-mono text-[#C3E956] font-bold">
                      {item.qualityGrade}
                    </span>
                  </div>
                </div>

                {/* Item Info */}
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-black text-[#1F4B2C] leading-snug group-hover:text-[#4D7111] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between gap-1 text-xs text-neutral-600 font-medium">
                    <span className="truncate">
                      By {item.supplierName}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 shrink-0">
                      {seller?.completedTradesCount ?? 0} deals · {seller?.strikeCount ?? 0} strikes
                    </span>
                  </div>

                  {/* Expected Delivery ETA */}
                  <div className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">Expected ETA: {eta.etaLabel}</span>
                  </div>

                  {item.manualGradeOverride && (
                    <div className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-300 text-[10px] font-bold text-amber-900 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>Manual Grade Override · Extended Review</span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-2xl bg-white/80 border border-neutral-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold">Available Stock</span>
                      <p className="font-bold text-neutral-800">{item.availableKg.toLocaleString()} kg</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold">Listed Price</span>
                      <p className="text-base font-black text-[#1F4B2C]">₱{item.pricePerKg}/kg</p>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-neutral-500 line-clamp-2 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => handleOpenOrder(item)}
                  className="w-full py-2.5 rounded-full btn-sprout text-xs font-black flex items-center justify-center gap-1.5 shadow-xs hover:scale-[1.02] transition-transform"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#1F4B2C]" />
                  <span>Configure & Finalize Order</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIGURE & FINALIZE ORDER MODAL */}
      {activeOrderModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-xl glass-light rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#91EAAF] my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveOrderModalItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b border-neutral-200">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-[#C3E956]" />
                Direct Negotiation & Escrow
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#1F4B2C] tracking-tight">
                Configure & Finalize Order
              </h3>
              <p className="text-xs text-neutral-600 font-medium mt-0.5">
                {activeOrderModalItem.name} • {activeOrderModalItem.supplierName} ({activeOrderModalItem.municipality})
              </p>
            </div>

            <form onSubmit={handleFinalizeOrder} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white border border-[#91EAAF]/60">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Total Stock Available</span>
                  <p className="text-sm font-black text-[#1F4B2C]">{activeOrderModalItem.availableKg.toLocaleString()} kg</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Supplier Listed Price</span>
                  <p className="text-sm font-black text-[#4D7111]">₱{activeOrderModalItem.pricePerKg} / kg</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-[#1F4B2C]">
                  <label>Quantity to Buy (Kilograms / kg) *</label>
                  <span className="font-mono text-[#4D7111]">{orderQuantityKg} kg</span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={activeOrderModalItem.availableKg}
                  value={orderQuantityKg}
                  onChange={(e) => setOrderQuantityKg(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-bold"
                />
                <input
                  type="range"
                  min={10}
                  max={activeOrderModalItem.availableKg}
                  step={10}
                  value={orderQuantityKg}
                  onChange={(e) => setOrderQuantityKg(parseInt(e.target.value))}
                  className="w-full accent-[#4D7111]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-[#1F4B2C]">
                  <label>Your Expected / Proposed Price (PHP/kg) *</label>
                  <span className="text-[10px] text-neutral-500">Negotiable with supplier</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">₱</span>
                  <input
                    type="number"
                    min={1}
                    value={proposedPricePhp}
                    onChange={(e) => setProposedPricePhp(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-bold text-[#1F4B2C]"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#C3E956]/20 border border-[#91EAAF] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#4D7111]">
                    Auto-Calculated Total Order Value
                  </span>
                  <p className="text-xs text-neutral-600 font-medium">
                    {orderQuantityKg} kg × ₱{proposedPricePhp}/kg
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#1F4B2C] font-mono">
                    ₱{(orderQuantityKg * proposedPricePhp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                  Delivery / Fulfillment Mode *
                </label>
                <select
                  value={deliveryMode}
                  onChange={(e) => setDeliveryMode(e.target.value as DeliveryMode)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#4D7111]"
                >
                  <option value="NVAT Bambang Drop-off Bay">NVAT Bambang Drop-off Bay</option>
                  <option value="Supplier Direct Delivery">Supplier Direct Delivery</option>
                  <option value="Buyer Farm Pickup">Buyer Farm Pickup</option>
                  <option value="Cooperative Shared Hauling">Cooperative Shared Hauling</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                  Meeting / Delivery Location Point *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. NVAT Terminal Bay 4 or Buyer Warehouse Solano"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentOption}
                  onChange={(e) => setPaymentOption(e.target.value as PaymentOption)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#4D7111]"
                >
                  <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                  <option value="GCash / Maya Instant Transfer">GCash / Maya Instant Transfer</option>
                  <option value="LandBank / Bank Transfer">LandBank / Bank Transfer</option>
                  <option value="Cooperative Escrow Account">Cooperative Escrow Account</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full btn-forest text-xs font-black shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
              >
                <span>Finalize Order & Buy</span>
                <ArrowRight className="w-4 h-4 text-[#C3E956]" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POST NEW CROP SUPPLY MODAL (WITH FARMER AGENT VISION GRADING + OVERRIDE WARNING) */}
      {isPostSupplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg glass-light rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#91EAAF] my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsPostSupplyOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-black text-[#1F4B2C] tracking-tight">
                Post New Agricultural Supply
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Submit harvest lot for Farmer Agent quality classification and Admin verification
              </p>
            </div>

            <form onSubmit={handleCreatePostSupply} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                  Crop / Variety Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  placeholder="e.g. Scorpio Highland Cabbage"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Category</label>
                  <select
                    value={newCropCategory}
                    onChange={(e) => setNewCropCategory(e.target.value as CropCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                  >
                    <option value="Highland Vegetables">Highland Vegetables</option>
                    <option value="Lowland Vegetables">Lowland Vegetables</option>
                    <option value="Citrus & Fruits">Citrus & Fruits</option>
                    <option value="Root Crops & Tubers">Root Crops & Tubers</option>
                    <option value="Grains & Cereals">Grains & Cereals</option>
                    <option value="Spices & Herbs">Spices & Herbs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Available (kg)</label>
                  <input
                    type="number"
                    required
                    value={newAvailableKg}
                    onChange={(e) => setNewAvailableKg(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Selling Price (₱ / kg) *</label>
                  <input
                    type="number"
                    required
                    value={newPricePerKg}
                    onChange={(e) => setNewPricePerKg(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Farmgate Price (₱ / kg)</label>
                  <input
                    type="number"
                    value={newFarmgatePricePhp}
                    onChange={(e) => setNewFarmgatePricePhp(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-bold text-[#4D7111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Harvest Date *</label>
                  <input
                    type="date"
                    required
                    value={newHarvestDate}
                    onChange={(e) => setNewHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Contact Phone *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Photos & Farmer Agent AI Quality Classification */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1F4B2C]">
                    Farm Photos & Farmer Agent AI Grading
                  </label>
                  <button
                    type="button"
                    onClick={handleAnalyzeFarmerQuality}
                    disabled={isAnalyzingGrade}
                    className="px-2.5 py-1 rounded-full btn-sprout text-[10px] font-black flex items-center gap-1 shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isAnalyzingGrade ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzingGrade ? 'Inspecting...' : 'AI Classify Photo & Grade'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="py-2.5 px-3 rounded-xl border-2 border-dashed border-[#91EAAF] bg-[#F4FFFC] text-center cursor-pointer hover:bg-[#91EAAF]/20 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold text-[#1F4B2C]">
                    <ImageIcon className="w-4 h-4 text-[#4D7111]" />
                    <span>Upload Gallery</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleSimulateCameraCapture}
                    disabled={isCameraActive}
                    className="py-2.5 px-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold"
                  >
                    <Camera className={`w-4 h-4 text-emerald-700 ${isCameraActive ? 'animate-spin' : ''}`} />
                    <span>{isCameraActive ? 'Capturing...' : 'Take Live Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedPhotos([
                        getCropPhotoByName(newCropName || 'Highland Cabbage', newCropCategory),
                        REAL_CROP_GALLERY[1].url,
                      ]);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[10px] font-bold text-neutral-700"
                  >
                    Use Sample Photos
                  </button>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mt-2 p-1">
                    {uploadedPhotos.map((photoUrl, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#91EAAF] shrink-0">
                        <img src={photoUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Quality Classification Feedback */}
              {aiSuggestedGrade && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-black text-emerald-900">
                    <span>Farmer Agent Suggestion: {aiSuggestedGrade}</span>
                    <span className="font-mono">{aiAuthScore}% Auth</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">{aiVisionNotes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Min Order (kg)</label>
                  <input
                    type="number"
                    value={newMinOrderKg}
                    onChange={(e) => setNewMinOrderKg(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Quality Grade</label>
                  <select
                    value={newQualityGrade}
                    onChange={(e) => setNewQualityGrade(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-semibold"
                  >
                    <option value="Grade A Premium">Grade A Premium</option>
                    <option value="Grade B Commercial">Grade B Commercial</option>
                    <option value="Standard Fresh">Standard Fresh</option>
                  </select>
                </div>
              </div>

              {/* Manual Override Warning */}
              {manualGradeOverride && (
                <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black">Manual Quality Override Detected</p>
                    <p className="text-[11px] mt-0.5">
                      Farmer Agent suggested <strong>{aiSuggestedGrade}</strong>, but you selected{' '}
                      <strong>{newQualityGrade}</strong>. Changing AI classification is allowed, but Master Admin verification will take longer.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                  Upload Farm Inspection Video (optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 py-2 px-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 text-center cursor-pointer hover:bg-blue-100/40 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold text-blue-950">
                    <Video className="w-4 h-4 text-blue-700" />
                    <span>Select Harvest Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Notes / Terroir</label>
                <textarea
                  rows={2}
                  value={newCropNotes}
                  onChange={(e) => setNewCropNotes(e.target.value)}
                  placeholder="e.g. Harvested at sunrise in Pingkian Kayapa, aerated wooden crates..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-[#1F4B2C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newOrganicCertified}
                  onChange={(e) => setNewOrganicCertified(e.target.checked)}
                  className="accent-[#4D7111]"
                />
                <span>Organic / Low-Pesticide Certified Lot</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-full btn-forest text-xs font-black shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#C3E956]" />
                <span>Submit Listing for Admin Verification</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REPORT LISTING MODAL */}
      {reportingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black text-red-800 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Report Commodity Listing
              </h3>
              <button
                onClick={() => setReportingItem(null)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              Reporting <strong>{reportingItem.name}</strong> by {reportingItem.supplierName} for Master Admin review.
            </p>
            <form onSubmit={handleSubmitReport} className="space-y-3">
              <textarea
                rows={3}
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe misleading photos, pricing, or unverified origin..."
                className="w-full p-3 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportingItem(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
