/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashLoadingScreen } from './components/SplashLoadingScreen';
import { TopNav } from './components/TopNav';
import { BottomDock } from './components/BottomDock';
import { PublicLandingScreen } from './components/PublicLandingScreen';
import { DashboardOverview } from './components/DashboardOverview';
import { GisMapModule } from './components/GisMapModule';
import { MarketplaceModule } from './components/MarketplaceModule';
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

const MainLayout: React.FC = () => {
  const { activeTab, isPagasaModalOpen, setIsPagasaModalOpen } = useApp();
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#F4FFFC] text-[#1F4B2C]">
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

      {/* Top Bar */}
      <TopNav />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-5 pb-24">
        {activeTab === 'public-landing' && <PublicLandingScreen />}
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'gis' && <GisMapModule />}
        {activeTab === 'marketplace' && <MarketplaceModule />}
        {activeTab === 'community' && <CommunityChatModule />}
        {activeTab === 'decision-support' && <MultiAgentModule />}
        {activeTab === 'messages' && <PrivateChatModule />}
        {activeTab === 'admin' && <MasterAdminModule />}
        {activeTab === 'profile' && <UserProfileModule />}
      </main>

      {/* Floating Bottom Dock */}
      <BottomDock />

      {/* Floating AGRIBEE AI Companion */}
      <AgribeeFloatingCompanion />

      {/* Global Modals & Drawers */}
      <PagasaWeatherModal
        isOpen={isPagasaModalOpen}
        onClose={() => setIsPagasaModalOpen(false)}
      />
      <GuestLockModal />
      <AgribeeOnboardingModal />
      <DemoAccountSwitcherDrawer />
      <AgribeeInteractiveTour />
      <AdminPasswordModal />
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // If ?autostart=1 in URL, skip splash immediately
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
