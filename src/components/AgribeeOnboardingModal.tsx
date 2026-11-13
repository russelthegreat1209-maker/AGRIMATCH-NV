import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StakeholderRole } from '../types';
import { AgribeeInlineVideoPlayer } from './AgribeeVideoPlayerModal';
import {
  X,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Video,
  LogIn,
  UserPlus,
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
    loginWithGoogle,
    verifyMasterAdminPassword,
    registerNewAccount,
    switchDemoRole,
    addNotification,
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [showVideoGuide, setShowVideoGuide] = useState<boolean>(true);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (email.trim().toLowerCase() === 'russelthegreat1209@gmail.com') {
      const adminRes = await verifyMasterAdminPassword(password, email);
      if (adminRes.success) {
        setIsOnboardingOpen(false);
      } else {
        setErrorMessage(adminRes.message || 'Invalid Master Admin password.');
      }
      return;
    }
    const res = loginWithCredentials(email, password);
    if (res.success) {
      setIsOnboardingOpen(false);
    } else {
      setErrorMessage(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim()) {
      setErrorMessage('Please enter your full name or farm name.');
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
    addNotification(`SMS OTP Sent to ${phone}! (Use code 123456)`, 'info');
  };

  const handleVerifyOtp = () => {
    if (otpCode === '123456' || otpCode.length === 6) {
      setAuthMode('register');
      setErrorMessage('');
      addNotification('Phone number verified! Complete your profile below.', 'success');
    } else {
      setErrorMessage('Invalid OTP code. Use 123456.');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      setIsOnboardingOpen(false);
    } catch {
      setName('Google Verified Farmer');
      setEmail('google.user@gmail.com');
      setAuthMode('register');
    }
  };

  const handleQuickRoleSignIn = (selectedRole: StakeholderRole) => {
    switchDemoRole(selectedRole);
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-light rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-[#91EAAF] my-6 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          type="button"
          onClick={() => setIsOnboardingOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-200/60 text-neutral-600 dark:text-neutral-200 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-200 dark:border-white/15 mb-4 pr-8">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#1F4B2C] dark:text-white tracking-tight">
              {authMode === 'login' ? 'Log In to AgriMatch NV' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold">
              Sign in with Google Gmail, Philippine Phone Number, or Verified Account
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowVideoGuide((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-[#C3E956]/40 text-[#1F4B2C] dark:text-[#C3E956] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>{showVideoGuide ? 'Hide Video 2 Guide' : 'Watch Video 2 Guide'}</span>
          </button>
        </div>

        {/* Embedded AgriBee Video 2: How to Make an Account */}
        {showVideoGuide && (
          <div className="mb-5">
            <AgribeeInlineVideoPlayer videoId="register-guide" compact />
          </div>
        )}

        {/* Auth Mode Tabs (Log In vs Register) */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-neutral-200/70 dark:bg-white/10 border border-[#91EAAF]/50 mb-4">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
            }}
            className={`py-2.5 text-xs sm:text-sm font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                : 'text-[#1F4B2C] dark:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage('');
            }}
            className={`py-2.5 text-xs sm:text-sm font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                : 'text-[#1F4B2C] dark:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Account</span>
          </button>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 text-left">
            {errorMessage}
          </div>
        )}

        {/* LOGIN FORM */}
        {authMode === 'login' && (
          <div className="space-y-4 text-left">
            {/* 1-Tap Quick Verified Stakeholder Login */}
            <div className="p-3.5 rounded-2xl bg-[#91EAAF]/25 dark:bg-white/5 border border-[#91EAAF] space-y-2">
              <p className="text-xs font-extrabold text-[#1F4B2C] dark:text-[#C3E956]">
                1-Tap Quick Stakeholder Sign-In (Instant Access):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    { role: 'Farmer', label: '👨‍🌾 Farmer' },
                    { role: 'Buyer', label: '🛒 Buyer' },
                    { role: 'Supplier', label: '🚚 Supplier' },
                    { role: 'Cooperative', label: '🏢 Coop' },
                    { role: 'Government', label: '🏛️ Gov / DA' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleQuickRoleSignIn(item.role)}
                    className="py-2 px-2.5 rounded-xl bg-[#1F4B2C] hover:bg-[#2a633b] text-white text-xs font-extrabold text-center shadow-xs transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Google & Phone OTP Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="py-2.5 px-4 rounded-xl border-2 border-[#91EAAF] bg-white dark:bg-black/30 hover:bg-neutral-50 text-xs font-extrabold text-[#1F4B2C] dark:text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-4 h-4"
                />
                <span>Sign In with Google Gmail</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setAuthMode('register');
                }}
                className="py-2.5 px-4 rounded-xl border-2 border-[#91EAAF] bg-white dark:bg-black/30 hover:bg-neutral-50 text-xs font-extrabold text-[#1F4B2C] dark:text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#4D7111]" />
                <span>Sign In with Phone Number</span>
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2 border-t border-neutral-200 dark:border-white/10">
              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] dark:text-white mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramon.delacruz@agrimatch-nv.ph"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] dark:text-white mb-1">
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
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white font-mono"
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

              <div className="p-2.5 rounded-xl bg-[#1F4B2C]/5 border border-[#91EAAF] flex items-center gap-2 text-xs text-[#1F4B2C] dark:text-[#91EAAF] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#4D7111] shrink-0" />
                <span>Master Admin requires manual password verification</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl btn-forest text-xs sm:text-sm font-black shadow-md cursor-pointer"
              >
                Sign In with Email
              </button>
            </form>
          </div>
        )}

        {/* REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  authMethod === 'email'
                    ? 'border-[#1F4B2C] bg-[#1F4B2C] text-[#C3E956]'
                    : 'border-neutral-300 text-neutral-700 dark:text-white'
                }`}
              >
                Name & Role
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  authMethod === 'phone'
                    ? 'border-[#1F4B2C] bg-[#1F4B2C] text-[#C3E956]'
                    : 'border-neutral-300 text-neutral-700 dark:text-white'
                }`}
              >
                Phone OTP (+63)
              </button>
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex-1 py-2 px-2 rounded-xl text-xs font-bold border border-neutral-300 text-neutral-700 dark:text-white hover:bg-neutral-100 cursor-pointer"
              >
                Google Gmail
              </button>
            </div>

            {authMethod === 'phone' && (
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-black/30 border border-[#91EAAF] space-y-2">
                <label className="block text-xs font-bold text-[#1F4B2C] dark:text-white">
                  Philippine Mobile Number (+63 9XX...)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3.5 py-2 rounded-xl btn-sprout text-xs font-black whitespace-nowrap cursor-pointer"
                  >
                    Send Code
                  </button>
                </div>

                {otpSent && (
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code (123456)"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-mono text-center"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-4 py-2 rounded-xl btn-forest text-xs font-bold cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-extrabold text-[#1F4B2C] dark:text-white mb-1.5">
                1. Choose Your Role *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    { id: 'Farmer', label: '👨‍🌾 Farmer' },
                    { id: 'Buyer', label: '🛒 Buyer' },
                    { id: 'Supplier', label: '🚚 Supplier' },
                    { id: 'Cooperative', label: '🏢 Coop' },
                    { id: 'Government', label: '🏛️ Gov / DA' },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-2.5 rounded-xl border text-center font-extrabold text-xs transition-all cursor-pointer ${
                      role === r.id
                        ? 'border-[#1F4B2C] bg-[#1F4B2C] text-[#C3E956] shadow-md'
                        : 'border-neutral-300 bg-white dark:bg-black/30 text-[#1F4B2C] dark:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] dark:text-white mb-1">
                  2. Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Juan De La Cruz"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] dark:text-white mb-1">
                  Farm / Business Name
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Kayapa Highland Farm"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] dark:text-white mb-1">
                  3. Municipality in Nueva Vizcaya *
                </label>
                <select
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                >
                  {NV_MUNICIPALITIES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F4B2C] dark:text-white mb-1">
                  Barangay *
                </label>
                <input
                  type="text"
                  required
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  placeholder="e.g. Poblacion"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setGpsPinned(true);
                addNotification(`GPS Pin calibrated at ${municipality}, Nueva Vizcaya!`, 'success');
              }}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                gpsPinned
                  ? 'border-[#4D7111] bg-[#4D7111]/15 text-[#1F4B2C] dark:text-[#C3E956]'
                  : 'border-neutral-300 bg-white dark:bg-black/30 text-neutral-700 dark:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#4D7111]" />
              <span>
                {gpsPinned
                  ? '✓ Farm GPS Location Pinned'
                  : 'Pin My Farm / Business GPS Location'}
              </span>
            </button>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl btn-sprout text-xs sm:text-sm font-black shadow-lg cursor-pointer"
            >
              Create Account & Enter Dashboard (Watch Video 3)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
