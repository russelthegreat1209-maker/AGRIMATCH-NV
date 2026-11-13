import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGE_OPTIONS, LanguageCode } from '../i18n/translations';
import {
  Bell,
  LogOut,
  LogIn,
  ChevronDown,
  Sparkles,
  Info,
  Globe,
  Check,
  Menu,
  Sun,
  Moon,
  Video,
  Radio,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export const TopNav: React.FC = () => {
  const {
    currentUser,
    activeTab,
    logout,
    setIsOnboardingOpen,
    setIsPagasaModalOpen,
    switchDemoRole,
    recentNotifications,
    navigateToTabWithGuard,
    language,
    setLanguage,
    t,
    themeMode,
    toggleThemeMode,
    setIsMobileSidebarOpen,
    setActiveAgribeeVideo,
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

  // On the public landing page, PublicLandingScreen renders its own clean header
  if (activeTab === 'public-landing') {
    return null;
  }

  const currentLangOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <header className="sticky top-0 z-40 w-full glass-light border-b border-[#91EAAF]/60 shadow-xs backdrop-blur-md">
      <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Mobile Sidebar Toggle + Brand Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-white/80 dark:bg-white/10 border border-[#91EAAF] text-[#1F4B2C] dark:text-[#C3E956]"
            aria-label="Open left navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => navigateToTabWithGuard('dashboard')}
          >
            <div className="relative w-9 h-9 rounded-xl bg-white p-0.5 border-2 border-[#91EAAF] shadow-xs group-hover:scale-105 transition-transform">
              <img
                src="/assets/aistudio/file_000000000e5c8209a20727869a247797_07ecb429.jpg"
                alt="AgriMatch NV"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#1F4B2C] dark:text-white">
                  AgriMatch NV
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-neutral-500 dark:text-neutral-300 font-semibold">
                Nueva Vizcaya Direct Agricultural Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center Quick Tools: Stakeholder Role Switcher (non-admin) + PAGASA Weather + Video Guide */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentUser && currentUser.role !== 'MASTER_ADMIN' && (
            <div className="hidden md:flex items-center gap-1.5 bg-white/90 dark:bg-black/30 px-3 py-1.5 rounded-xl border border-[#91EAAF] shadow-xs">
              <span className="text-[10px] font-extrabold text-[#4D7111] dark:text-[#C3E956] uppercase">
                Role:
              </span>
              <select
                value={currentUser.role}
                onChange={(e) => switchDemoRole(e.target.value as any)}
                className="bg-transparent text-xs font-black text-[#1F4B2C] dark:text-white focus:outline-none cursor-pointer"
                aria-label="Switch Stakeholder Role"
              >
                <option value="Farmer">Farmer</option>
                <option value="Buyer">Buyer</option>
                <option value="Supplier">Supplier</option>
                <option value="Cooperative">Cooperative</option>
                <option value="Government">Government / DA</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsPagasaModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Weather</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAgribeeVideo('congrats-dashboard')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C3E956]/35 border border-[#91EAAF] text-xs font-extrabold text-[#1F4B2C] dark:text-[#C3E956] hover:bg-[#C3E956]/55 transition-colors cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Guides</span>
          </button>
        </div>

        {/* Right Actions: Light/Dark Mode + Language + Notifications + User */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className="p-2 rounded-xl bg-white/90 dark:bg-white/10 border border-[#91EAAF] text-[#1F4B2C] dark:text-[#C3E956] hover:scale-105 transition-all cursor-pointer"
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-[#C3E956]" />
            ) : (
              <Moon className="w-4 h-4 text-[#1F4B2C]" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setShowLangDropdown((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/90 dark:bg-white/10 border border-[#91EAAF] text-xs font-bold text-[#1F4B2C] dark:text-white cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#4D7111] dark:text-[#C3E956]" />
              <span className="uppercase font-mono text-[11px] font-black">
                {currentLangOption.code}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-52 glass-light rounded-2xl shadow-xl border border-[#91EAAF] p-2 z-50">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.code as LanguageCode);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#1F4B2C] text-[#C3E956] font-bold'
                          : 'hover:bg-neutral-100 text-[#1F4B2C] dark:text-white font-medium'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-xl bg-white/90 dark:bg-white/10 border border-[#91EAAF] text-[#1F4B2C] dark:text-white relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 glass-light rounded-2xl shadow-xl border border-[#91EAAF] p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F4B2C] dark:text-white">
                    <Sparkles className="w-3.5 h-3.5 text-[#4D7111]" />
                    <span>{t.notificationsTitle}</span>
                  </div>
                </div>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-2 rounded-xl bg-white/80 dark:bg-black/30 border border-neutral-100 dark:border-white/10 text-xs text-[#1F4B2C] dark:text-white flex items-start gap-2"
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

          {/* User Profile Pill */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  navigateToTabWithGuard(
                    currentUser.role === 'MASTER_ADMIN' ? 'admin' : 'profile'
                  )
                }
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-white/10 border border-[#91EAAF] cursor-pointer"
              >
                <UserAvatar
                  name={currentUser.name}
                  avatar={currentUser.avatar}
                  role={currentUser.role}
                  sizeClass="w-7 h-7"
                  textSizeClass="text-[10px]"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#1F4B2C] dark:text-white max-w-[110px] truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] font-extrabold uppercase text-[#4D7111] dark:text-[#C3E956]">
                    {currentUser.role}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl hover:bg-red-500/15 text-red-700 dark:text-red-400 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="px-3.5 py-1.5 rounded-xl btn-sprout text-xs font-black flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
