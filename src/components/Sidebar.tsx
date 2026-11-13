import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  ShoppingBag,
  Package,
  BarChart3,
  MapPin,
  Users,
  MessageSquare,
  ClipboardCheck,
  Bot,
  ShieldCheck,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Sparkles,
  Video,
  LogOut,
  X,
} from 'lucide-react';

interface NavItemConfig {
  id: string;
  label: string;
  simpleLabel: string;
  icon: React.ReactNode;
  badge?: number | string;
  highlightForBuyer?: boolean;
}

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    navigateToTabWithGuard,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    themeMode,
    toggleThemeMode,
    isSimpleMode,
    setIsSimpleMode,
    setActiveAgribeeVideo,
    orders,
    chatThreads,
    logout,
  } = useApp();

  // Do not show workspace sidebar on unauthenticated public landing page
  if (!currentUser || activeTab === 'public-landing') {
    return null;
  }

  const role = currentUser.role;
  const isProducer =
    role === 'Farmer' || role === 'Supplier' || role === 'Cooperative' || role === 'MASTER_ADMIN';
  const canViewSupplyMonitoring = isProducer || role === 'Government';
  const canViewAiAgentButton = role === 'Government' || role === 'MASTER_ADMIN';
  const isMasterAdmin = role === 'MASTER_ADMIN';
  const isBuyer = role === 'Buyer';

  const myActiveOrdersCount = orders.filter(
    (o) =>
      (o.buyerId === currentUser.id || o.supplierId === currentUser.id) &&
      o.status !== 'COMPLETED'
  ).length;

  const unreadChatsCount = chatThreads.reduce((sum, th) => sum + (th.unreadCount || 0), 0);

  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      simpleLabel: 'Home',
      icon: <Home className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'marketplace',
      label: 'Marketplace & Crops',
      simpleLabel: 'Market (Buy & Sell)',
      icon: <ShoppingBag className="w-5 h-5 shrink-0" />,
    },
    ...(isProducer
      ? [
          {
            id: 'inventory',
            label: 'My Crop Inventory',
            simpleLabel: 'My Inventory',
            icon: <Package className="w-5 h-5 shrink-0" />,
          },
        ]
      : []),
    ...(canViewSupplyMonitoring
      ? [
          {
            id: 'supply-monitoring',
            label: 'Supply Monitoring & Trends',
            simpleLabel: 'Supply Monitoring',
            icon: <BarChart3 className="w-5 h-5 shrink-0" />,
          },
        ]
      : []),
    {
      id: 'gis',
      label: 'GIS Farm & Road Map',
      simpleLabel: 'Farm Map',
      icon: <MapPin className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'community',
      label: 'Community & DA News',
      simpleLabel: 'Community & News',
      icon: <Users className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'messages',
      label: 'Direct Messages',
      simpleLabel: 'Messages',
      icon: <MessageSquare className="w-5 h-5 shrink-0" />,
      badge: unreadChatsCount > 0 ? unreadChatsCount : undefined,
    },
    {
      id: 'orders',
      label: 'Orders & Transactions',
      simpleLabel: 'Orders & Trades',
      icon: <ClipboardCheck className="w-5 h-5 shrink-0" />,
      badge: myActiveOrdersCount > 0 ? myActiveOrdersCount : undefined,
      highlightForBuyer: isBuyer,
    },
    ...(canViewAiAgentButton
      ? [
          {
            id: 'decision-support',
            label: 'Municipal AI Agent & Analytics',
            simpleLabel: 'AI Agent (Gov/Admin)',
            icon: <Bot className="w-5 h-5 shrink-0" />,
          },
        ]
      : []),
    ...(isMasterAdmin
      ? [
          {
            id: 'admin',
            label: 'Master Admin Panel',
            simpleLabel: 'Admin Panel',
            icon: <ShieldCheck className="w-5 h-5 shrink-0" />,
          },
        ]
      : []),
    {
      id: 'profile',
      label: 'My Account Profile',
      simpleLabel: 'My Profile',
      icon: <User className="w-5 h-5 shrink-0" />,
    },
  ];

  const handleSelectTab = (tabId: string) => {
    navigateToTabWithGuard(tabId);
    setIsMobileSidebarOpen(false);
  };

  const renderSidebarContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full justify-between py-3 px-2.5 select-none">
      {/* Top Collapse Toggle & User Role Pill */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1.5">
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#1F4B2C] text-[#C3E956] flex items-center justify-center font-extrabold text-xs shrink-0 shadow">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-extrabold text-[#1F4B2C] dark:text-[#E8F5E9] truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#4D7111] dark:text-[#C3E956]">
                  {currentUser.role} • {currentUser.municipality}
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl hover:bg-[#91EAAF]/30 dark:hover:bg-white/10 text-[#1F4B2C] dark:text-[#E8F5E9] transition-all cursor-pointer"
            title={collapsed ? 'Expand Menu' : 'Collapse Menu'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-[#91EAAF]/30 text-[#1F4B2C] dark:text-[#E8F5E9]"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1" aria-label="Main Workspace Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const displayLabel = isSimpleMode ? item.simpleLabel : item.label;
            const isBuyerOrdersHighlight = item.highlightForBuyer && !isActive;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                title={collapsed ? displayLabel : undefined}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'
                } rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                    : isBuyerOrdersHighlight
                    ? 'bg-[#C3E956]/35 dark:bg-[#C3E956]/20 text-[#1F4B2C] dark:text-[#C3E956] ring-2 ring-[#4D7111] dark:ring-[#C3E956] font-extrabold'
                    : 'text-[#1F4B2C] dark:text-[#E8F5E9] hover:bg-[#91EAAF]/35 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.icon}
                  {!collapsed && <span className="truncate">{displayLabel}</span>}
                </div>
                {!collapsed && (item.badge !== undefined || item.highlightForBuyer) && (
                  <div className="flex items-center gap-1 shrink-0">
                    {item.highlightForBuyer && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#1F4B2C] text-[#C3E956] text-[9px] font-extrabold uppercase">
                        Buyer
                      </span>
                    )}
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isActive
                            ? 'bg-[#C3E956] text-[#1F4B2C]'
                            : 'bg-[#4D7111] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Video Guide, Simple Mode, Dark/Light Mode, Logout */}
      <div className="space-y-1.5 pt-3 border-t border-[#4D7111]/20 dark:border-white/10">
        {/* AgriBee Video Demo Button */}
        <button
          type="button"
          onClick={() => {
            setActiveAgribeeVideo('congrats-dashboard');
            setIsMobileSidebarOpen(false);
          }}
          title="Watch AgriBee Video Guides"
          className={`w-full flex items-center ${
            collapsed ? 'justify-center p-2.5' : ' gap-2.5 px-3 py-2'
          } rounded-xl bg-[#C3E956]/30 hover:bg-[#C3E956]/50 text-[#1F4B2C] dark:text-[#C3E956] font-extrabold text-xs transition-all cursor-pointer`}
        >
          <Video className="w-4 h-4 shrink-0" />
          {!collapsed && <span>AgriBee Video Guides</span>}
        </button>

        {/* Simple Mode Toggle */}
        <button
          type="button"
          onClick={() => setIsSimpleMode(!isSimpleMode)}
          title="Toggle Simple Farmer Words"
          className={`w-full flex items-center ${
            collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
          } rounded-xl hover:bg-[#91EAAF]/30 dark:hover:bg-white/10 text-[#1F4B2C] dark:text-[#E8F5E9] font-bold text-xs transition-all cursor-pointer`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#4D7111] dark:text-[#C3E956] shrink-0" />
            {!collapsed && <span>Simple Words</span>}
          </div>
          {!collapsed && (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                isSimpleMode
                  ? 'bg-[#1F4B2C] text-[#C3E956]'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isSimpleMode ? 'ON' : 'OFF'}
            </span>
          )}
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleThemeMode}
          title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`w-full flex items-center ${
            collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
          } rounded-xl hover:bg-[#91EAAF]/30 dark:hover:bg-white/10 text-[#1F4B2C] dark:text-[#E8F5E9] font-bold text-xs transition-all cursor-pointer`}
        >
          <div className="flex items-center gap-2.5">
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-[#C3E956] shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-[#1F4B2C] shrink-0" />
            )}
            {!collapsed && (
              <span>{themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            )}
          </div>
          {!collapsed && (
            <span className="text-[10px] font-bold uppercase opacity-75">
              {themeMode}
            </span>
          )}
        </button>

        {/* Log Out */}
        <button
          type="button"
          onClick={logout}
          title="Log Out to Landing Page"
          className={`w-full flex items-center ${
            collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
          } rounded-xl hover:bg-red-500/15 text-red-700 dark:text-red-400 font-bold text-xs transition-all cursor-pointer`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar (Google Gemini Style) */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] glass-light border-r border-[#4D7111]/20 dark:border-white/10 transition-all duration-200 z-30 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent(isSidebarCollapsed)}
      </aside>

      {/* Mobile / Tablet Slide-Over Left Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full glass-card bg-[#F4FFFC] dark:bg-[#0B1E13] border-r border-[#91EAAF]/40 z-10 shadow-2xl">
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}
    </>
  );
};
