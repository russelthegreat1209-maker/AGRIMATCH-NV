/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashLoadingScreen } from './components/SplashLoadingScreen';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { PublicLandingScreen } from './components/PublicLandingScreen';
import { DashboardOverview } from './components/DashboardOverview';
import { GisMapModule } from './components/GisMapModule';
import { MarketplaceModule } from './components/MarketplaceModule';
import { InventoryAndSupplyMonitoringModule } from './components/InventoryAndSupplyMonitoringModule';
import { PrivateChatModule } from './components/PrivateChatModule';
import { MasterAdminModule } from './components/MasterAdminModule';
import { MultiAgentModule } from './components/MultiAgentModule';
import { UserProfileModule } from './components/UserProfileModule';
import { CommunityChatModule } from './components/CommunityChatModule';
import { PagasaWeatherModal } from './components/PagasaWeatherModal';
import { AgribeeFloatingCompanion } from './components/AgribeeFloatingCompanion';
import { GuestLockModal } from './components/GuestLockModal';
import { AgribeeOnboardingModal } from './components/AgribeeOnboardingModal';
import { DemoAccountSwitcherDrawer } from './components/DemoAccountSwitcherDrawer';
import { AgribeeInteractiveTour } from './components/AgribeeInteractiveTour';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { AgribeeVideoPlayerModal } from './components/AgribeeVideoPlayerModal';

const MainLayout: React.FC = () => {
  const { activeTab, currentUser, isPagasaModalOpen, setIsPagasaModalOpen } = useApp();
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Strict Gate: Unauthenticated visitors stay on PublicLandingScreen
  const effectiveTab = !currentUser ? 'public-landing' : activeTab;

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#F4FFFC] dark:bg-[#07150E] text-[#1F4B2C] dark:text-[#E8F5E9] transition-colors">
      {mapsQuotaExceeded && (
        <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-3 text-xs sm:text-sm text-amber-900 flex items-center justify-between gap-2">
          <span>
            Map quota reached on the shared demo key. Please check the console for details or{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noreferrer"
              className="underline font-bold"
            >
              switch to a billed Google Cloud key
            </a>{' '}
            if you need more capacity.
          </span>
          <button
            onClick={() => setMapsQuotaExceeded(false)}
            className="text-amber-700 hover:text-amber-950 font-bold text-xs shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header (Shown inside Workspace) */}
      <TopNav />

      {/* Workspace Body: Left Gemini-Style Collapsible Sidebar + Main Content */}
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-5 pb-20 min-w-0">
          {effectiveTab === 'public-landing' && <PublicLandingScreen />}
          {effectiveTab === 'dashboard' && <DashboardOverview />}
          {effectiveTab === 'marketplace' && <MarketplaceModule />}
          {effectiveTab === 'inventory' && (
            <InventoryAndSupplyMonitoringModule initialView="inventory" />
          )}
          {effectiveTab === 'supply-monitoring' && (
            <InventoryAndSupplyMonitoringModule initialView="supply-monitoring" />
          )}
          {effectiveTab === 'gis' && <GisMapModule />}
          {effectiveTab === 'community' && <CommunityChatModule />}
          {effectiveTab === 'messages' && <PrivateChatModule initialSubTab="messages" />}
          {effectiveTab === 'orders' && <PrivateChatModule initialSubTab="orders" />}
          {effectiveTab === 'decision-support' &&
            (currentUser?.role === 'Government' || currentUser?.role === 'MASTER_ADMIN') && (
              <MultiAgentModule />
            )}
          {effectiveTab === 'admin' && currentUser?.role === 'MASTER_ADMIN' && (
            <MasterAdminModule />
          )}
          {effectiveTab === 'profile' && <UserProfileModule />}
        </main>
      </div>

      {/* Floating AGRIBEE AI Companion */}
      <AgribeeFloatingCompanion />

      {/* Global Modals & Sequential Video Player */}
      <PagasaWeatherModal
        isOpen={isPagasaModalOpen}
        onClose={() => setIsPagasaModalOpen(false)}
      />
      <GuestLockModal />
      <AgribeeOnboardingModal />
      <AgribeeVideoPlayerModal />
      <DemoAccountSwitcherDrawer />
      <AgribeeInteractiveTour />
      <AdminPasswordModal />
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') !== '1';
  });

  return (
    <AppProvider>
      {showSplash ? (
        <SplashLoadingScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <MainLayout />
      )}
    </AppProvider>
  );
}
