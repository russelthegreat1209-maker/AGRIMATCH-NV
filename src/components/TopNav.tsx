import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGE_OPTIONS, LanguageCode } from '../i18n/translations';
import {
  Users,
  Bell,
  LogOut,
  LogIn,
  ChevronDown,
  Sparkles,
  Info,
  Globe,
  Check,
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const {
    environmentMode,
    setEnvironmentMode,
    currentUser,
    logout,
    setIsOnboardingOpen,
    setIsDemoSwitcherOpen,
    setIsPagasaModalOpen,
    switchDemoRole,
    recentNotifications,
    navigateToTabWithGuard,
    language,
    setLanguage,
    t,
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <header className="sticky top-0 z-40 w-full glass-light border-b border-[#91EAAF]/60 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          onClick={() => navigateToTabWithGuard('dashboard')}
        >
          <div className="relative w-10 h-10 rounded-full bg-white p-0.5 border-2 border-[#91EAAF] shadow-xs group-hover:scale-105 transition-transform">
            <img
              src="/assets/aistudio/file_000000000e5c8209a20727869a247797_07ecb429.jpg"
              alt="AGRIMATCH Emblem"
              className="w-full h-full object-contain rounded-full"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#C3E956] border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-[#1F4B2C]">AGRIMATCH</span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded-sm bg-[#4D7111] text-[#F4FFFC]">
                NV
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-neutral-500 font-medium tracking-tight">
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* Center: Persistent Environment Indicator Badge & Quick Switchers */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Persistent Environment Indicator Badge */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-black border shadow-xs tracking-tight">
            {environmentMode === 'demo' ? (
              <div className="flex items-center gap-1.5 text-[#1F4B2C]">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-mono text-[10px] sm:text-[11px] font-black tracking-wider uppercase">
                  {t.demoSandbox}
                </span>
                <button
                  onClick={() => setEnvironmentMode('production')}
                  className="ml-1 text-[10px] text-neutral-500 hover:text-[#1F4B2C] underline font-semibold hidden sm:inline"
                  title="Switch to Live Production"
                >
                  ({t.goLive})
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="font-mono text-[10px] sm:text-[11px] font-black tracking-wider uppercase">
                  {t.liveProduction}
                </span>
                <button
                  onClick={() => setEnvironmentMode('demo')}
                  className="ml-1 text-[10px] text-neutral-500 hover:text-emerald-900 underline font-semibold hidden sm:inline"
                  title="Switch to Demo Sandbox"
                >
                  ({t.goDemo})
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Role Switcher Dropdown */}
          {environmentMode === 'demo' && (
            <div className="hidden xl:flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[#91EAAF] shadow-xs">
              <span className="text-[10px] font-bold text-[#4D7111] uppercase tracking-wider">
                {t.demoRole}
              </span>
              <select
                value={currentUser?.role || 'Farmer'}
                onChange={(e) => switchDemoRole(e.target.value as any)}
                className="bg-transparent text-xs font-black text-[#1F4B2C] focus:outline-none cursor-pointer pr-1"
                aria-label="Switch Demo Role"
              >
                <option value="Farmer">Farmer</option>
                <option value="Supplier">Supplier / Trader</option>
                <option value="Cooperative">Cooperative</option>
                <option value="Buyer">Wholesale Buyer</option>
                <option value="MASTER_ADMIN">Master Admin</option>
              </select>
            </div>
          )}

          {/* Public Portal Switcher */}
          <button
            onClick={() => navigateToTabWithGuard('public-landing')}
            className="hidden md:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-xs font-bold text-[#1F4B2C] transition-colors"
            title="Return to Public Landing Gatekeeper"
          >
            <span>{t.publicPortal}</span>
          </button>

          {/* Interactive Conceptual Framework Switcher */}
          <button
            onClick={() => navigateToTabWithGuard('framework')}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors shadow-xs"
            title="Open Interactive Input-Process-Output (IPO) Conceptual Framework"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.ipoFramework}</span>
          </button>

          {/* Tap to Check Live PAGASA Weather Feed Button */}
          <button
            onClick={() => setIsPagasaModalOpen(true)}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 hover:bg-blue-100 transition-colors shadow-xs"
            title="Check Official Live PAGASA Weather Feed"
            aria-label="Open PAGASA Weather Telemetry"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>{t.pagasaRadar}</span>
          </button>
        </div>

        {/* Right Actions: Language Switcher + Demo Switcher + Notifications + User / Guest */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Simple Language & Dialect Switcher */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setShowLangDropdown((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-[#F4FFFC] border border-[#91EAAF] text-xs font-bold text-[#1F4B2C] shadow-xs transition-colors min-h-[34px]"
              aria-label="Switch UI Language or Dialect"
              title="Switch Language: English, Tagalog, Ilocano, Gaddang"
            >
              <Globe className="w-3.5 h-3.5 text-[#4D7111] shrink-0" />
              <span className="uppercase font-mono text-[11px] font-black">{currentLangOption.code}</span>
              <span className="hidden sm:inline text-[11px] font-bold">{currentLangOption.label}</span>
              <ChevronDown className="w-3 h-3 text-[#4D7111]" />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-56 glass-light rounded-2xl shadow-xl border border-[#91EAAF] p-2 z-50 animate-fade-in">
                <div className="px-2.5 py-1.5 border-b border-neutral-200 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                    Language / Dialect
                  </span>
                  <span className="text-[10px] font-bold text-[#4D7111]">NV Local</span>
                </div>
                <div className="space-y-1">
                  {LANGUAGE_OPTIONS.map((opt) => {
                    const isSelected = language === opt.code;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => {
                          setLanguage(opt.code as LanguageCode);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-[#1F4B2C] text-[#F4FFFC] font-bold'
                            : 'hover:bg-neutral-100 text-[#1F4B2C] font-medium'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold">{opt.label}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                                isSelected
                                  ? 'bg-[#C3E956] text-[#1F4B2C]'
                                  : 'bg-neutral-100 text-neutral-500'
                              }`}
                            >
                              {opt.regionTag}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] block ${
                              isSelected ? 'text-[#91EAAF]' : 'text-neutral-400'
                            }`}
                          >
                            {opt.nativeName}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C3E956] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Replay Agri Bee Guide Trigger */}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C3E956]/20 border border-[#91EAAF] text-xs font-bold text-[#1F4B2C] hover:bg-[#C3E956]/40 transition-colors"
            title="Open Agri Bee Guide & Authentication"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#4D7111]" />
            <span className="text-[11px]">{t.agriBee}</span>
          </button>

          {/* Quick Demo Login Switcher */}
          {environmentMode === 'demo' && (
            <button
              onClick={() => setIsDemoSwitcherOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C3E956]/20 border border-[#91EAAF] text-xs font-bold text-[#1F4B2C] hover:bg-[#C3E956]/40 transition-colors"
              title="Switch between pre-loaded stakeholder accounts"
              aria-label="Open Demo Account Switcher"
            >
              <Users className="w-3.5 h-3.5 text-[#4D7111]" />
              <span>{t.accounts25}</span>
              <ChevronDown className="w-3 h-3 text-[#4D7111]" />
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-700 relative border border-transparent hover:border-[#91EAAF]/50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#1F4B2C]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 glass-light rounded-2xl shadow-xl border border-[#91EAAF] p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F4B2C]">
                    <Sparkles className="w-3.5 h-3.5 text-[#4D7111]" />
                    {t.notificationsTitle}
                  </div>
                  <span className="text-[10px] bg-[#91EAAF]/40 text-[#1F4B2C] font-semibold px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-2 rounded-xl bg-white/70 border border-neutral-100 text-xs text-[#1F4B2C] flex items-start gap-2"
                    >
                      <Info className="w-3.5 h-3.5 text-[#4D7111] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-[11px] leading-tight">{notif.text}</p>
                        <span className="text-[9px] text-neutral-400">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account Pill or Guest Sign-In */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1">
              <div
                onClick={() => navigateToTabWithGuard(currentUser.role === 'MASTER_ADMIN' ? 'admin' : 'profile')}
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/90 border border-[#91EAAF] cursor-pointer hover:shadow-xs transition-shadow"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#91EAAF]"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-[#1F4B2C] max-w-[110px] truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                        currentUser.role === 'MASTER_ADMIN'
                          ? 'bg-red-100 text-red-800 font-extrabold'
                          : currentUser.role === 'Farmer'
                          ? 'bg-[#C3E956]/40 text-[#1F4B2C]'
                          : currentUser.role === 'Supplier'
                          ? 'bg-amber-100 text-amber-900'
                          : currentUser.role === 'Buyer'
                          ? 'bg-blue-100 text-blue-900'
                          : currentUser.role === 'Cooperative'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {currentUser.role === 'MASTER_ADMIN' ? 'Master Admin' : currentUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-1.5 rounded-full hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors"
                title={t.signOut}
                aria-label={t.signOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-3 py-1.5 rounded-full btn-sprout text-xs flex items-center gap-1 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.signInJoin}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
