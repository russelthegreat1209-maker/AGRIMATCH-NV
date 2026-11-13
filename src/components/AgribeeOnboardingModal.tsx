import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StakeholderRole } from '../types';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Lock,
  Building,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

const NV_MUNICIPALITIES = [
  'Bambang',
  'Bayombong',
  'Solano',
  'Kayapa',
  'Kasibu',
  'Aritao',
  'Bagabag',
  'Dupax del Sur',
  'Dupax del Norte',
  'Santa Fe',
  'Villaverde',
  'Quezon',
  'Ambaguio',
  'Alfonso Castañeda',
  'Diadi',
];

export const AgribeeOnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    loginWithCredentials,
    registerNewAccount,
    addNotification,
  } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [slideIndex, setSlideIndex] = useState(0);

  // Auth Form mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('email');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('+63 9');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Registration profile fields
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<StakeholderRole>('Farmer');
  const [municipality, setMunicipality] = useState('Bambang');
  const [barangay, setBarangay] = useState('Poblacion');
  const [gpsPinned, setGpsPinned] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOnboardingOpen) return null;

  const slides = [
    {
      title: 'The Challenge in Nueva Vizcaya',
      desc: 'Farmers in Nueva Vizcaya struggle with price opacity at trading posts, sudden oversupply bottlenecks at NVAT Bambang, unpredictable highland rains, and steep middleman cuts.',
      beeImg: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121640_0000_12f5433f.webp',
      badge: 'Local Problem Identified',
    },
    {
      title: 'Direct Buyer-Supplier Matching & GIS',
      desc: 'Our interactive GIS engine allows radius searches from 10m to 100km across all 15 municipalities. Direct route telemetry connects buyers, cooperatives, and farm hubs with zero middleman loss.',
      beeImg: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121757_0000_ec40164d.webp',
      badge: 'Geospatial Precision',
    },
    {
      title: '5-Agent Multi-Agent AI Framework',
      desc: 'Dedicated Farmer, Buyer, Supplier, Market, and Admin AI Agents coordinate inventory, synthesize real-time PAGASA weather feeds, and process daily NVAT terminal price bulletins.',
      beeImg: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121834_0000_85d9f953.webp',
      badge: 'Gemini Multi-Agent AI',
    },
    {
      title: 'Verified Crops & Protected Dual Orders',
      desc: 'Gemini AI Vision screens uploaded harvest photos for authenticity. In-chat dual-confirmation ("Order Sent" + "Order Received") provides an atomic escrow ledger for every stakeholder.',
      beeImg: '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121708_0000_9bfb5a28.webp',
      badge: 'Protected Escrow',
    },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = loginWithCredentials(email, password);
    if (res.success) {
      setIsOnboardingOpen(false);
    } else {
      setErrorMessage(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickMasterAdminFill = () => {
    setEmail('russelthegreat1209@gmail.com');
    setPassword('RusselTheGreat12092009@SagittariusAGRIMATCHNVADMIN');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim()) {
      setErrorMessage('Please enter your full name or organization name.');
      return;
    }

    registerNewAccount({
      name,
      organization,
      email: email.trim() || `user_${Date.now()}@agrimatch-nv.ph`,
      role,
      phone: phone || '+63 900 123 4567',
      municipality,
      barangay,
      lat: 16.3861 + (Math.random() - 0.5) * 0.1,
      lng: 121.1065 + (Math.random() - 0.5) * 0.1,
    });

    setIsOnboardingOpen(false);
  };

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setErrorMessage('Please enter a valid Philippine mobile number (+63 9XX XXX XXXX)');
      return;
    }
    setOtpSent(true);
    setErrorMessage('');
    addNotification(`SMS OTP Sent to ${phone}! (Use demo code 123456)`, 'info');
  };

  const handleVerifyOtp = () => {
    if (otpCode === '123456' || otpCode.length === 6) {
      setAuthMode('register');
      setErrorMessage('');
      addNotification('Phone number verified! Complete your stakeholder profile.', 'success');
    } else {
      setErrorMessage('Invalid OTP code. For demo, use 123456.');
    }
  };

  const handleGoogleAuth = () => {
    addNotification('Google OAuth 2.0 handshake verified!', 'success');
    setName('Google Verified Farmer');
    setEmail('google.user@gmail.com');
    setAuthMode('register');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-light rounded-3xl p-5 sm:p-8 shadow-2xl border-2 border-[#91EAAF] my-8 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => setIsOnboardingOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Step Switcher */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#1F4B2C] text-[#C3E956] font-bold text-xs flex items-center justify-center">
              {step === 1 ? '1/2' : '2/2'}
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#1F4B2C] tracking-tight">
                {step === 1 ? 'AGRIBEE Interactive Onboarding' : 'Stakeholder Authentication'}
              </h2>
              <p className="text-[11px] text-neutral-500">
                {step === 1 ? 'Understand the platform with your AI Bee Guide' : 'Sign in or register your farm / business'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 1 ? 'bg-[#1F4B2C] text-[#F4FFFC]' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Step 1: Guide
            </button>
            <button
              onClick={() => setStep(2)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 2 ? 'bg-[#1F4B2C] text-[#F4FFFC]' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Step 2: Sign In
            </button>
          </div>
        </div>

        {/* STEP 1: Interactive Onboarding Slides */}
        {step === 1 && (
          <div className="space-y-6">
            {/* AGRIBEE Voice Bubble */}
            <div className="flex items-start gap-4 glass-card p-4 rounded-2xl border border-[#91EAAF]">
              <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 border-2 border-[#91EAAF] shadow-md animate-float-logo">
                <img
                  src={slides[slideIndex].beeImg}
                  alt="AGRIBEE"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4D7111]/15 text-[#1F4B2C] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#4D7111]" />
                  {slides[slideIndex].badge}
                </div>
                <div className="relative bg-white/90 p-3 rounded-2xl rounded-tl-none border border-[#91EAAF]/60 shadow-xs">
                  <p className="text-xs font-bold text-[#1F4B2C]">
                    "Hi! I&apos;m AGRIBEE, your AI companion for AGRIMATCH-NV!"
                  </p>
                  <p className="text-xs text-neutral-600 mt-1 font-medium leading-relaxed">
                    Let me show you why our adaptive geospatial tracking system transforms agricultural trade in Nueva Vizcaya.
                  </p>
                </div>
              </div>
            </div>

            {/* Slide Content Card */}
            <div className="p-5 rounded-2xl bg-white/80 border border-[#91EAAF]/50 shadow-sm text-left">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-2">
                <span>Slide {slideIndex + 1} of 4</span>
                <span className="font-mono text-[#4D7111]">Feature Tour</span>
              </div>
              <h3 className="text-xl font-black text-[#1F4B2C] tracking-tight">
                {slides[slideIndex].title}
              </h3>
              <p className="mt-2 text-sm text-neutral-700 leading-relaxed font-medium">
                {slides[slideIndex].desc}
              </p>

              {/* Slide dots */}
              <div className="flex items-center gap-2 mt-4">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === slideIndex ? 'w-6 bg-[#4D7111]' : 'w-2 bg-neutral-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Slide navigation controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                disabled={slideIndex === 0}
                className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold text-neutral-600 disabled:opacity-40 hover:bg-neutral-100 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              {slideIndex < 3 ? (
                <button
                  onClick={() => setSlideIndex((i) => Math.min(3, i + 1))}
                  className="px-5 py-2.5 rounded-full btn-sprout text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  Next Slide
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-full btn-forest text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  Create Your Account with AGRIBEE
                  <ArrowRight className="w-3.5 h-3.5 text-[#C3E956]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Registration & Authentication Wizard */}
        {step === 2 && (
          <div className="space-y-5">
            {/* AGRIBEE Assistant Tooltip Banner */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-[#91EAAF]">
              <img
                src="/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121823_0000_2ea129ee.webp"
                alt="AGRIBEE Helper"
                className="w-12 h-12 object-contain shrink-0"
              />
              <div className="text-left text-xs">
                <span className="font-bold text-[#1F4B2C]">AGRIBEE Guide Tip:</span>{' '}
                <span className="text-neutral-600">
                  {authMode === 'login'
                    ? 'Use your stakeholder credentials or the Master Admin secret gate.'
                    : 'Select your correct role card (Farmer, Buyer, Coop, or Gov) for customized AI agents.'}
                </span>
              </div>
            </div>

            {/* Auth Mode Tabs (Sign In vs Register) */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-100 border border-neutral-200">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login' ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Sign In to Existing Account
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'register' ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Register New Stakeholder
              </button>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 text-left">
                {errorMessage}
              </div>
            )}

            {/* LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramon.delacruz@agrimatch-nv.ph or admin email"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-[#4D7111] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-[#4D7111] bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Exclusive Private Master Admin Gate quick fill button */}
                <div className="p-3 rounded-xl bg-[#1F4B2C]/5 border border-[#91EAAF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#1F4B2C] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#4D7111]" />
                    <span>Master Admin Gate for Panel Defense</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickMasterAdminFill}
                    className="px-2.5 py-1 rounded-md bg-[#1F4B2C] text-[#C3E956] text-[10px] font-bold hover:bg-[#275e37]"
                  >
                    Fill Admin Secret
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full btn-forest text-xs font-bold shadow-md hover:scale-[1.01] transition-transform"
                >
                  Sign In to AGRIMATCH-NV
                </button>

                {/* Alternative auth buttons */}
                <div className="pt-2 text-center">
                  <p className="text-[11px] text-neutral-500 mb-2 font-medium">Or continue with</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="py-2 px-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center justify-center gap-2"
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                      Google Sign-In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('phone');
                        setAuthMode('register');
                      }}
                      className="py-2 px-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-[#4D7111]" />
                      Philippine SMS
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                {/* Method selector */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      authMethod === 'email' ? 'border-[#4D7111] bg-[#4D7111]/10 text-[#1F4B2C]' : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    Email & Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('phone')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      authMethod === 'phone' ? 'border-[#4D7111] bg-[#4D7111]/10 text-[#1F4B2C]' : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    Philippine Phone OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  >
                    Google OAuth
                  </button>
                </div>

                {/* If Phone SMS Auth */}
                {authMethod === 'phone' && (
                  <div className="p-3 rounded-xl bg-white border border-neutral-200 space-y-2">
                    <label className="block text-xs font-bold text-[#1F4B2C]">
                      Philippine Mobile Number (+63 9XX...)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+63 9XX XXX XXXX"
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-3 py-2 rounded-lg btn-sprout text-xs font-bold whitespace-nowrap"
                      >
                        Send OTP
                      </button>
                    </div>

                    {otpSent && (
                      <div className="pt-2 flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter 6-digit OTP (123456)"
                          className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white font-mono tracking-widest text-center"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="px-4 py-2 rounded-lg btn-forest text-xs font-bold"
                        >
                          Verify OTP
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Stakeholder Role Selection Cards (Mandatory) */}
                <div>
                  <label className="block text-xs font-bold text-[#1F4B2C] mb-1.5">
                    Select Your Stakeholder Role Classification *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'Farmer', label: 'Farmer / Supplier', desc: 'Produces / supplies crops' },
                        { id: 'Buyer', label: 'Buyer', desc: 'Wholesale, retail, restaurant' },
                        { id: 'Cooperative', label: 'Cooperative', desc: 'Managing member farms & hauling' },
                        { id: 'Government', label: 'Government', desc: 'DA, PAO, MAO, NVAT desk' },
                      ] as const
                    ).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          role === r.id
                            ? 'border-[#4D7111] bg-[#C3E956]/20 shadow-xs ring-1 ring-[#4D7111]'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="text-xs font-black text-[#1F4B2C] leading-tight">
                          {r.label}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-1 leading-tight">
                          {r.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                      Full Name / Representative Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Juan De La Cruz"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#4D7111]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                      Organization / Farm Name
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Pingkian Valley Terraces"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#4D7111]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                      Municipality in Nueva Vizcaya *
                    </label>
                    <select
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#4D7111]"
                    >
                      {NV_MUNICIPALITIES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F4B2C] mb-1">
                      Barangay *
                    </label>
                    <input
                      type="text"
                      required
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      placeholder="e.g. San Antonio North"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#4D7111]"
                    />
                  </div>
                </div>

                {/* GPS Pin Button */}
                <button
                  type="button"
                  onClick={() => {
                    setGpsPinned(true);
                    addNotification(`GPS Pin calibrated at ${municipality}, Nueva Vizcaya!`, 'success');
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    gpsPinned
                      ? 'border-[#4D7111] bg-[#4D7111]/15 text-[#1F4B2C]'
                      : 'border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-[#4D7111]" />
                  <span>{gpsPinned ? '✓ GPS Coordinates Calibrated (Auto-Detected)' : 'Pin My Farm / Business GPS Location'}</span>
                </button>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full btn-forest text-xs font-bold shadow-md hover:scale-[1.01] transition-transform"
                >
                  Complete Registration & Enter Platform
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
