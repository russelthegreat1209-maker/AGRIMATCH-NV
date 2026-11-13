import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CommodityItem,
  CropCategory,
  DeliveryMode,
  PaymentOption,
} from '../types';
import { getCropPhotoByName, REAL_CROP_GALLERY } from '../data/cropAssets';
import {
  Search,
  Filter,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  PlusCircle,
  X,
  Sliders,
  DollarSign,
  Truck,
  Video,
  Image as ImageIcon,
  Play,
  Check,
  AlertCircle,
  Camera,
  Phone
} from 'lucide-react';

export const MarketplaceModule: React.FC = () => {
  const {
    commodities,
    currentUser,
    activeOrderModalItem,
    setActiveOrderModalItem,
    createOrderInquiry,
    addNewCommodity,
    setActiveTab,
    addNotification,
    t,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

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
  const [newOrganicCertified, setNewOrganicCertified] = useState(false);
  const [newCropNotes, setNewCropNotes] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string>('');

  const [newFarmgatePricePhp, setNewFarmgatePricePhp] = useState(30);
  const [newContactPhone, setNewContactPhone] = useState('+63 917 555 4321');
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Handle opening Configure & Finalize Order
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
      organicCertified: newOrganicCertified,
      notes: newCropNotes,
      imageUrl: uploadedPhotos[0] || getCropPhotoByName(newCropName, newCropCategory),
      additionalPhotos: uploadedPhotos.slice(1),
      videoUrl: uploadedVideo,
      mediaType: uploadedVideo ? (uploadedPhotos.length > 0 ? 'mixed' : 'video') : 'photo',
    });

    // Reset form
    setNewCropName('');
    setNewCropNotes('');
    setUploadedPhotos([]);
    setUploadedVideo('');
    setIsPostSupplyOpen(false);
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

  const filteredCommodities = commodities
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      const matchesVerified = !verifiedOnly || item.verificationStatus === 'VERIFIED';

      // Visibility Gate: Pending listings are hidden from public buyers,
      // but visible to Master Admin and the seller who submitted it!
      const isVisibleToUser =
        item.verificationStatus === 'VERIFIED' ||
        currentUser?.role === 'MASTER_ADMIN' ||
        (currentUser && item.supplierId === currentUser.id);

      return matchesSearch && matchesCategory && matchesVerified && isVisibleToUser;
    })
    .sort((a, b) => {
      // 1. VERIFIED and Boosted items pushed to top
      const rankA = (a.verificationStatus === 'VERIFIED' ? 2000 : 0) + (a.verifiedBoostRank ? 1000 : 0) + a.aiAuthenticityScore;
      const rankB = (b.verificationStatus === 'VERIFIED' ? 2000 : 0) + (b.verifiedBoostRank ? 1000 : 0) + b.aiAuthenticityScore;
      return rankB - rankA;
    });

  return (
    <div className="space-y-6 pb-16 text-left animate-fade-in">
      {/* Marketplace Header & Search Bar */}
      <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        {/* Post Supply CTA (if Farmer/Supplier/Coop) */}
        {currentUser && (currentUser.role === 'Farmer' || currentUser.role === 'Supplier' || currentUser.role === 'Cooperative' || currentUser.role === 'MASTER_ADMIN') && (
          <button
            onClick={() => setIsPostSupplyOpen(true)}
            className="px-5 py-2.5 rounded-full btn-forest text-xs font-bold flex items-center gap-2 shadow-sm hover:scale-105 transition-transform shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#C3E956]" />
            <span>{t.postSupplyBtn}</span>
          </button>
        )}
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
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

          {/* Verified Toggle */}
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

        {/* Category Pills */}
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
        {filteredCommodities.map((item) => (
          <div
            key={item.id}
            className="glass-card rounded-3xl overflow-hidden border border-[#91EAAF] shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image & Verified Badges */}
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
                  {item.verificationStatus === 'VERIFIED' ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#91EAAF] text-[#1F4B2C] shadow-sm flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#1F4B2C]" />
                      Admin Verified ({item.aiAuthenticityScore}%)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-200 text-amber-900 shadow-sm">
                      Pending AI Inspection
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-white text-[11px] font-semibold bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-xs">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C3E956]" />
                    {item.municipality}
                  </span>
                  <span className="font-mono text-[#C3E956] font-bold">
                    Grade A
                  </span>
                </div>
              </div>

              {/* Item Info */}
              <div className="p-4 space-y-2">
                <h3 className="text-base font-black text-[#1F4B2C] leading-snug group-hover:text-[#4D7111] transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  By {item.supplierName} ({item.supplierRole})
                </p>

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

            {/* Card Action */}
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
        ))}
      </div>

      {/* CONFIGURE & FINALIZE ORDER GLASSMORPHIC MODAL */}
      {activeOrderModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-xl glass-light rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#91EAAF] my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveOrderModalItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
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

            {/* Form */}
            <form onSubmit={handleFinalizeOrder} className="mt-5 space-y-4">
              {/* Available Stock & Reference Price Display */}
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

              {/* 1) Quantity to Buy (kg) Numeric input + slider */}
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

              {/* 2 & 3) Expected / Proposed Price per kg */}
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

              {/* 4) Auto-Calculated Total Order Value */}
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

              {/* 5) Delivery / Fulfillment Mode */}
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

              {/* 6) Meeting / Delivery Location */}
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

              {/* 7) Payment Option */}
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

              {/* Action */}
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

      {/* POST NEW CROP SUPPLY MODAL */}
      {isPostSupplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg glass-light rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#91EAAF] my-8">
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
                Submit harvest lot for AI Vision inspection and NVAT market broadcast
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
                    placeholder="Negotiable farmgate base"
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
                      placeholder="+63 9XX XXX XXXX"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

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

              {/* RICH MEDIA: MULTIPLE PHOTOS UPLOAD & NATIVE MOBILE CAMERA */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1F4B2C]">
                    Farm Photos & Live Mobile Camera
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    WebP Compressed (-75% Bandwidth)
                  </span>
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
                    <span>{isCameraActive ? 'Capturing...' : 'Take Live Farm Photo'}</span>
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

                {/* Instant Photo Previews */}
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

              {/* RICH MEDIA: VIDEO UPLOAD (accept="video/*") */}
              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                  Upload Farm Inspection Video (accept="video/*")
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
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedVideo('https://www.w3schools.com/html/mov_bbb.mp4');
                    }}
                    className="px-2.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[10px] font-bold text-neutral-700"
                  >
                    Sample Video
                  </button>
                </div>

                {/* Instant Video Preview */}
                {uploadedVideo && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border-2 border-blue-300 bg-black">
                    <video
                      src={uploadedVideo}
                      controls
                      className="w-full h-32 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedVideo('')}
                      className="absolute top-1 right-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold"
                    >
                      Remove Video
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] mb-1">Notes / Terroir</label>
                <textarea
                  rows={2}
                  value={newCropNotes}
                  onChange={(e) => setNewCropNotes(e.target.value)}
                  placeholder="e.g. Harvested at sunrise in Pingkian Kayapa, tight cabbage heads, aerated wooden crates..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              {/* 3-Stage Verification Policy Notice */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#91EAAF]/20 to-[#C3E956]/20 border border-[#91EAAF] text-[11px] text-[#1F4B2C] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4D7111]" />
                  3-Stage Moderation Protocol:
                </p>
                <p className="text-[10px] text-neutral-600">
                  New submissions start as <strong className="text-amber-800">PENDING</strong>. Upon Master Admin review, valid listings become <strong className="text-emerald-800">VERIFIED</strong> and auto-boosted to top. Unverified media is <strong className="text-red-700">REJECTED</strong> and incurs official warnings (3 strikes = Account Suspension).
                </p>
              </div>

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
    </div>
  );
};
