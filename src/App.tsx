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
import { ConceptualFrameworkModule } from './components/ConceptualFrameworkModule';
import { PagasaWeatherModal } from './components/PagasaWeatherModal';
import { AgribeeFloatingCompanion } from './components/AgribeeFloatingCompanion';
import { GuestLockModal } from './components/GuestLockModal';
import { AgribeeOnboardingModal } from './components/AgribeeOnboardingModal';
import { DemoAccountSwitcherDrawer } from './components/DemoAccountSwitcherDrawer';
import { AgribeeInteractiveTour } from './components/AgribeeInteractiveTour';

const MainLayout: React.FC = () => {
  const { activeTab, isPagasaModalOpen, setIsPagasaModalOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#F4FFFC] text-[#1F4B2C]">
      {/* Top Bar with Environment Mode Toggle & Switcher */}
      <TopNav />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-5 pb-24">
        {activeTab === 'public-landing' && <PublicLandingScreen />}
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'gis' && <GisMapModule />}
        {activeTab === 'marketplace' && <MarketplaceModule />}
        {activeTab === 'community' && <CommunityChatModule />}
        {activeTab === 'decision-support' && <MultiAgentModule />}
        {activeTab === 'framework' && <ConceptualFrameworkModule />}
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
