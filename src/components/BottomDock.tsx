import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  MapPin,
  ShoppingBag,
  Cpu,
  MessageSquare,
  User,
  ShieldCheck,
} from 'lucide-react';

export const BottomDock: React.FC = () => {
  const { activeTab, navigateToTabWithGuard, currentUser, orders, t } = useApp();

  const unreadInquiries = orders.filter(
    (o) =>
      o.status === 'INQUIRY_SUBMITTED' ||
      (o.status === 'ORDER_DISPATCHED' && !o.buyerConfirmedReceived)
  ).length;

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'gis', label: t.navGisMap, icon: MapPin },
    { id: 'marketplace', label: t.navMarketplace, icon: ShoppingBag },
    { id: 'community', label: t.navCommunity, icon: MessageSquare },
    { id: 'decision-support', label: t.navAiAgents, icon: Cpu },
    { id: 'messages', label: t.navTradeChat, icon: MessageSquare, badge: unreadInquiries },
    {
      id: currentUser?.role === 'MASTER_ADMIN' ? 'admin' : 'profile',
      label: currentUser?.role === 'MASTER_ADMIN' ? t.navAdminHub : t.navProfile,
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-5xl">
      <nav
        className="glass-dark w-full px-3 sm:px-6 py-2.5 rounded-full shadow-2xl flex items-center justify-between sm:justify-around gap-1 sm:gap-2 border border-[#C3E956]/40 backdrop-blur-2xl overflow-x-auto no-scrollbar"
        aria-label="Platform navigation dock"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigateToTabWithGuard(item.id)}
              className={`relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-full transition-all duration-200 text-xs font-semibold whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#C3E956] to-[#91EAAF] text-[#1F4B2C] shadow-md font-bold scale-[1.03]'
                  : 'text-[#F4FFFC]/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1F4B2C]' : 'text-[#91EAAF]'}`} />
              <span className="text-[10px] sm:text-xs tracking-tight">{item.label}</span>

              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 right-1 sm:-right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
