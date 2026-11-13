import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  ShieldCheck,
  MapPin,
  Phone,
  Building,
  CheckCircle2,
  Calendar,
  LogOut,
  Users,
  Camera,
  Image as ImageIcon,
  Edit3,
  X,
  Upload,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { NV_MUNICIPALITIES } from '../data/nvMunicipalBoundaries';

const PRESET_COVERS = [
  {
    name: 'Malico Mountain Ridge & Cloud Forest',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    tag: 'Highland Border',
  },
  {
    name: 'Bambang Rice Terraces & Magat Basin',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    tag: 'Trading Capital',
  },
  {
    name: 'Kasibu Mandarin & Citrus Orchards',
    url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=1200&q=80',
    tag: 'Citrus Capital',
  },
  {
    name: 'Kayapa Organic Vegetable Valleys',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    tag: 'Salad Bowl',
  },
  {
    name: 'Dalton Pass Agro-Logistics Highway',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    tag: 'Logistics Artery',
  },
];

const PRESET_AVATARS = [
  {
    name: 'AgriBee Companion (Default)',
    url: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121743_0000_c74c3479.webp',
  },
  {
    name: 'Analyst Bee (Thinking)',
    url: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121627_0000_f57600cd.webp',
  },
  {
    name: 'Trading Bee (Mobile)',
    url: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121637_0000_5f169ef9.webp',
  },
  {
    name: 'Harvest Bee (Honey)',
    url: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121651_0000_ca62b095.webp',
  },
  {
    name: 'Field Scout Bee (Alert)',
    url: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121640_0000_12f5433f.webp',
  },
  {
    name: 'AgriBee Cultivator (Watering)',
    url: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121731_0000_3693cdfa.webp',
  },
  {
    name: 'Master Farmer Profile',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Cooperative Officer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
];

export const UserProfileModule: React.FC = () => {
  const {
    currentUser,
    orders,
    commodities,
    setIsDemoSwitcherOpen,
    logout,
    updateUserProfile,
    environmentMode,
    t,
  } = useApp();

  // Modals for editing
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Profile fields state
  const [editName, setEditName] = useState('');
  const [editFarm, setEditFarm] = useState('');
  const [editMunicipality, setEditMunicipality] = useState('');
  const [editBarangay, setEditBarangay] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');

  // Custom photo inputs
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const myOrders = orders.filter(
    (o) => o.buyerId === currentUser.id || o.supplierId === currentUser.id
  );
  const myCommodities = commodities.filter((c) => c.supplierId === currentUser.id);

  const openEditModal = () => {
    setEditName(currentUser.name || '');
    setEditFarm(currentUser.farmOrWarehouseName || currentUser.organization || '');
    setEditMunicipality(currentUser.municipality || 'Bayombong');
    setEditBarangay(currentUser.barangay || '');
    setEditPhone(currentUser.phone || '');
    setEditBio(currentUser.bio || '');
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName.trim() || currentUser.name,
      farmOrWarehouseName: editFarm.trim(),
      organization: editFarm.trim() || currentUser.organization,
      municipality: editMunicipality,
      barangay: editBarangay.trim(),
      phone: editPhone.trim(),
      bio: editBio.trim(),
    });
    setIsEditProfileOpen(false);
  };

  const handleCoverSelect = (url: string) => {
    updateUserProfile({ coverPhoto: url });
    setIsCoverModalOpen(false);
  };

  const handleAvatarSelect = (url: string) => {
    updateUserProfile({ avatar: url });
    setIsAvatarModalOpen(false);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (type === 'avatar') {
          updateUserProfile({ avatar: result });
          setIsAvatarModalOpen(false);
        } else {
          updateUserProfile({ coverPhoto: result });
          setIsCoverModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activeCover =
    currentUser.coverPhoto ||
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="space-y-6 pb-20 text-left animate-fade-in max-w-5xl mx-auto">
      {/* Profile Header with Customizable Cover & Avatar */}
      <div className="bg-white rounded-3xl border border-[#91EAAF] shadow-xl overflow-hidden relative">
        {/* Cover Photo Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-neutral-800 overflow-hidden group">
          <img
            src={activeCover}
            alt="Profile Cover Banner"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Change Cover Button */}
          <button
            onClick={() => setIsCoverModalOpen(true)}
            className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border border-white/20 transition-all shadow-md"
            title="Customize Cover Photo"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t.changeCover}</span>
          </button>

          {/* Environment Tag */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ${
                environmentMode === 'production'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-400 text-neutral-900 font-extrabold'
              }`}
            >
              {environmentMode === 'production' ? 'Live Verified Profile' : 'Demo Sandbox Persona'}
            </span>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar Floating Over Cover */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group/avatar">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl bg-white"
                />
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-[#1F4B2C] text-[#C3E956] hover:bg-[#4D7111] shadow-lg border-2 border-white transition-transform hover:scale-110"
                  title="Change Avatar"
                  aria-label="Change Avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 sm:mb-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase bg-[#1F4B2C] text-[#C3E956] tracking-wider">
                    {currentUser.role}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    RSBSA Verified
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
                  {currentUser.name}
                </h1>
                {(currentUser.farmOrWarehouseName || currentUser.organization) && (
                  <p className="text-xs sm:text-sm text-neutral-600 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <Building className="w-3.5 h-3.5 text-[#4D7111]" />
                    {currentUser.farmOrWarehouseName || currentUser.organization}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:mb-2">
              <button
                onClick={openEditModal}
                className="px-4 py-2 rounded-full bg-[#1F4B2C] hover:bg-[#4D7111] text-[#F4FFFC] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C3E956]" />
                <span>{t.editProfile}</span>
              </button>
              {environmentMode === 'demo' && (
                <button
                  onClick={() => setIsDemoSwitcherOpen(true)}
                  className="px-4 py-2 rounded-full btn-sprout text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Users className="w-3.5 h-3.5 text-[#1F4B2C]" />
                  <span>{t.switchProfile}</span>
                </button>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full border border-neutral-300 bg-white hover:bg-red-50 hover:text-red-600 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.signOut}</span>
              </button>
            </div>
          </div>

          {/* Location & Contact Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 py-3 border-y border-neutral-100">
            <span className="flex items-center gap-1 font-semibold">
              <MapPin className="w-4 h-4 text-[#4D7111]" />
              {currentUser.municipality}, {currentUser.barangay} • Nueva Vizcaya
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <Phone className="w-4 h-4 text-[#4D7111]" />
              {currentUser.phone}
            </span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-500 font-medium">
              Registered ID: <span className="font-mono text-[#1F4B2C] font-bold">{currentUser.id}</span>
            </span>
          </div>

          {/* Agronomic Bio */}
          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              {t.agronomicBio}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              {currentUser.bio || 'No agronomic bio entered yet. Click "Edit Profile" to add farm details and crop specializations.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of User's Activity: Active Listings & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User's Marketplace Commodities */}
        <div className="bg-white p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-black text-[#1F4B2C] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#4D7111]" />
              {t.myCropListings} ({myCommodities.length})
            </h3>
            <span className="text-[11px] font-bold text-neutral-500">
              Verified Catalog
            </span>
          </div>

          {myCommodities.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl">
              No crops listed under this account yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {myCommodities.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-neutral-50 hover:bg-[#F4FFFC] border border-neutral-100 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
                    />
                    <div>
                      <h4 className="font-bold text-[#1F4B2C]">{item.name}</h4>
                      <p className="text-[11px] text-neutral-500">
                        {item.availableKg.toLocaleString()} kg available • {item.qualityGrade}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#1F4B2C] font-mono">
                      ₱{item.pricePerKg}/kg
                    </span>
                    <span className="block text-[10px] text-emerald-700 font-bold">
                      {item.verificationStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User's Trade Inquiries & Orders */}
        <div className="bg-white p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-black text-[#1F4B2C] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4D7111]" />
              {t.tradeOrdersHistory} ({myOrders.length})
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Ledger Recorded
            </span>
          </div>

          {myOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl">
              No active transactions yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {myOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1F4B2C]">Order #{ord.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          ord.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'ORDER_DISPATCHED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="font-bold text-[#1F4B2C] mt-0.5">{ord.commodityName}</p>
                    <p className="text-[11px] text-neutral-500">
                      {ord.quantityKg} kg • {ord.deliveryMode}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-black text-[#1F4B2C] font-mono">
                      ₱{ord.totalAmountPhp.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Details Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#91EAAF] animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-lg font-black text-[#1F4B2C] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#4D7111]" />
                Edit Profile Details
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs text-neutral-700">
              <div>
                <label className="block font-bold text-[#1F4B2C] mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#4D7111] font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F4B2C] mb-1">
                  Farm, Warehouse, or Organization Name
                </label>
                <input
                  type="text"
                  value={editFarm}
                  onChange={(e) => setEditFarm(e.target.value)}
                  placeholder="e.g. Kasibu Citrus Growers Coop / Bambang Farm"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#4D7111] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1F4B2C] mb-1">
                    Municipality (Nueva Vizcaya)
                  </label>
                  <select
                    value={editMunicipality}
                    onChange={(e) => setEditMunicipality(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#4D7111] font-medium bg-white"
                  >
                    {NV_MUNICIPALITIES.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.class})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1F4B2C] mb-1">Barangay</label>
                  <input
                    type="text"
                    value={editBarangay}
                    onChange={(e) => setEditBarangay(e.target.value)}
                    placeholder="e.g. Pudi, Antutot, Mabuslo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#4D7111] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1F4B2C] mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +63 917 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#4D7111] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F4B2C] mb-1">
                  Agronomic Bio & Crop Specialization
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Detail crops cultivated, acreage, harvest schedule, and hauling capacity..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#4D7111] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-full border border-neutral-300 text-neutral-600 font-bold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#1F4B2C] hover:bg-[#4D7111] text-[#F4FFFC] font-bold shadow-md"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customize Cover Photo Modal */}
      {isCoverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#91EAAF] animate-scale-up space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-lg font-black text-[#1F4B2C] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#4D7111]" />
                  Customize Cover Photo
                </h3>
                <p className="text-xs text-neutral-500">
                  Select a scenic Nueva Vizcaya landscape or upload your farm banner.
                </p>
              </div>
              <button
                onClick={() => setIsCoverModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Nueva Vizcaya Scenic Presets
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_COVERS.map((preset) => (
                  <div
                    key={preset.name}
                    onClick={() => handleCoverSelect(preset.url)}
                    className="relative h-28 rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#4D7111] shadow-xs group transition-all"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-left">
                      <span className="text-[10px] font-black uppercase text-[#C3E956] tracking-wide">
                        {preset.tag}
                      </span>
                      <span className="text-xs font-bold text-white leading-tight">
                        {preset.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload or Custom URL */}
            <div className="pt-3 border-t border-neutral-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Or Upload Custom Farm Banner
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={coverFileInputRef}
                  onChange={(e) => handleFileUpload(e, 'cover')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold text-[#1F4B2C] flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4 text-[#4D7111]" />
                  <span>Upload Image File</span>
                </button>

                <div className="flex-1 w-full flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={customCoverUrl}
                    onChange={(e) => setCustomCoverUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#4D7111]"
                  />
                  <button
                    type="button"
                    disabled={!customCoverUrl.trim()}
                    onClick={() => handleCoverSelect(customCoverUrl.trim())}
                    className="px-3 py-2 rounded-xl bg-[#1F4B2C] disabled:bg-neutral-300 text-[#F4FFFC] text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customize Avatar Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#91EAAF] animate-scale-up space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-lg font-black text-[#1F4B2C] flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#4D7111]" />
                  Change Profile Photo / Avatar
                </h3>
                <p className="text-xs text-neutral-500">
                  Select an AgriBee persona or upload your authentic farmer photo.
                </p>
              </div>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Character & Stakeholder Presets
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                {PRESET_AVATARS.map((av) => (
                  <div
                    key={av.name}
                    onClick={() => handleAvatarSelect(av.url)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-transparent hover:border-[#4D7111] hover:bg-[#F4FFFC] cursor-pointer transition-all group"
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#91EAAF] shadow-xs group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] font-bold text-neutral-700 text-center leading-tight line-clamp-1">
                      {av.name.split(' (')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload or Custom URL */}
            <div className="pt-3 border-t border-neutral-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Or Upload Custom Profile Photo
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarFileInputRef}
                  onChange={(e) => handleFileUpload(e, 'avatar')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold text-[#1F4B2C] flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4 text-[#4D7111]" />
                  <span>Upload Image File</span>
                </button>

                <div className="flex-1 w-full flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#4D7111]"
                  />
                  <button
                    type="button"
                    disabled={!customAvatarUrl.trim()}
                    onClick={() => handleAvatarSelect(customAvatarUrl.trim())}
                    className="px-3 py-2 rounded-xl bg-[#1F4B2C] disabled:bg-neutral-300 text-[#F4FFFC] text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
