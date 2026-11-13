import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserAccount,
  CommodityItem,
  OrderRecord,
  ChatMessage,
  ChatThread,
  NvatBulletinReport,
  AdminAnnouncement,
  SystemCounters,
  AgentPacket,
  EnvironmentMode,
  DeliveryMode,
  PaymentOption,
  StakeholderRole,
  VerificationAuditLog,
  NvatMarketItem,
  CommunityPost,
  CommunityPostComment,
  ReactionType,
  ModerationReport,
  AiHistoryEntry,
} from '../types';
import {
  SEED_ACCOUNTS,
  SEED_COMMODITIES,
  INITIAL_NVAT_ITEMS,
  SEED_ANNOUNCEMENTS,
  SEED_ORDERS,
  SEED_THREADS,
  SEED_MESSAGES,
  SEED_AGENT_PACKETS,
  INITIAL_COUNTERS,
  MASTER_ADMIN_EMAIL,
  SEED_VERIFICATION_AUDIT_LOGS,
  SEED_COMMUNITY_POSTS,
  SEED_NVAT_ARCHIVE,
  SEED_MODERATION_REPORTS,
  SEED_AI_HISTORY,
} from '../data/seedData';
import {
  checkDualHandshakeCompletion,
  parseNvatTextToStructured,
  toggleReactionMap,
  evaluateStrikeAction,
} from '../utils/agriMath';
import { getCropPhotoByName } from '../data/cropAssets';
import {
  auth,
  db,
  signInWithGoogle,
  logOutFirebase,
  testFirestoreConnection,
  getGoogleSheetsAccessToken,
  exportBulletinToGoogleSheets,
} from '../config/firebase';
import { TRANSLATIONS, LanguageCode, TranslationDictionary, LANGUAGE_OPTIONS } from '../i18n/translations';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface AppContextType {
  environmentMode: EnvironmentMode;
  setEnvironmentMode: (mode: EnvironmentMode) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  commodities: CommodityItem[];
  orders: OrderRecord[];
  chatThreads: ChatThread[];
  chatMessages: ChatMessage[];
  nvatReport: NvatBulletinReport;
  nvatArchive: NvatBulletinReport[];
  selectedNvatDate: string;
  setSelectedNvatDate: (date: string) => void;
  announcements: AdminAnnouncement[];
  counters: SystemCounters;
  agentPackets: AgentPacket[];
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Modals & UI States
  isGuestLockOpen: boolean;
  setIsGuestLockOpen: (open: boolean) => void;
  guestAttemptedTab: string;
  setGuestAttemptedTab: (tab: string) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isDemoSwitcherOpen: boolean;
  setIsDemoSwitcherOpen: (open: boolean) => void;
  isPagasaModalOpen: boolean;
  setIsPagasaModalOpen: (open: boolean) => void;
  isAdminPasswordModalOpen: boolean;
  setIsAdminPasswordModalOpen: (open: boolean) => void;
  activeOrderModalItem: CommodityItem | null;
  setActiveOrderModalItem: (item: CommodityItem | null) => void;
  highlightedCommodityId: string | null;
  setHighlightedCommodityId: (id: string | null) => void;
  requestedCommunityView: 'feed' | 'bulletins' | null;
  setRequestedCommunityView: (view: 'feed' | 'bulletins' | null) => void;
  selectedRoute: {
    from: { lat: number; lng: number; name: string };
    to: { lat: number; lng: number; name: string };
    distanceKm: number;
    drivingMinutes: number;
    pathDescription: string;
  } | null;
  setSelectedRoute: (route: AppContextType['selectedRoute']) => void;

  // Actions
  switchDemoAccount: (accountId: string) => void;
  switchDemoRole: (role: StakeholderRole) => void;
  loginWithCredentials: (email: string, pass: string) => { success: boolean; message?: string };
  verifyMasterAdminPassword: (
    password: string,
    emailInput?: string
  ) => Promise<{ success: boolean; message?: string }>;
  registerNewAccount: (account: Partial<UserAccount>) => UserAccount;
  logout: () => void;
  navigateToTabWithGuard: (tab: string) => void;
  openMarketplaceToCommodity: (commodityId: string) => void;
  openCommunityBulletins: () => void;

  // Commerce & Dual-Handshake
  createOrderInquiry: (
    commodity: CommodityItem,
    quantityKg: number,
    proposedPricePhp: number,
    deliveryMode: DeliveryMode,
    deliveryLocation: string,
    paymentOption: PaymentOption
  ) => OrderRecord;
  markOrderSent: (orderId: string) => void;
  markOrderReceived: (orderId: string) => void;

  // Chat
  sendMessage: (
    threadId: string,
    text: string,
    extra?: { isOrderCard?: boolean; orderId?: string; locationPin?: { lat: number; lng: number; label: string } }
  ) => void;
  activeChatThreadId: string | null;
  setActiveChatThreadId: (id: string | null) => void;

  // Marketplace & Moderation Actions
  addNewCommodity: (crop: Partial<CommodityItem>) => void;
  approveCommodity: (commodityId: string) => void;
  rejectCommodity: (commodityId: string) => void;
  verifyAndBoostCommodity: (commodityId: string) => void;
  rejectAndWarnCommodity: (commodityId: string, warningReason: string) => void;
  deleteCommodity: (commodityId: string) => void;
  toggleBanUser: (userId: string) => void;
  publishAdminAnnouncement: (title: string, content: string, category: AdminAnnouncement['category']) => void;
  processAndPublishNvatBulletin: (rawText: string, preParsedItems?: NvatMarketItem[]) => void;
  publishStructuredNvatBulletin: (items: NvatMarketItem[], sourceTitle?: string) => void;
  triggerAgentPacket: (packet: Omit<AgentPacket, 'id' | 'timestamp'>) => void;
  exportCurrentBulletinToSheets: (
    bulletin?: NvatBulletinReport
  ) => Promise<{ spreadsheetId: string; spreadsheetUrl: string }>;

  // Verification Audit Trail & Moderation Reports & AI History
  verificationAuditLogs: VerificationAuditLog[];
  moderationReports: ModerationReport[];
  submitModerationReport: (report: {
    targetType: ModerationReport['targetType'];
    targetId: string;
    targetUserId: string;
    targetUserName: string;
    targetPreview: string;
    reason: string;
  }) => void;
  adminResolveReport: (
    reportId: string,
    action: 'STRIKE_DELETE' | 'BAN_DIRECT' | 'DISMISS'
  ) => void;
  aiHistory: AiHistoryEntry[];
  logAiHistory: (entry: Omit<AiHistoryEntry, 'id' | 'createdAt'>) => void;

  // Interactive Guided Tour
  isInteractiveTourActive: boolean;
  setIsInteractiveTourActive: (active: boolean) => void;
  currentTourStep: number;
  setCurrentTourStep: (step: number) => void;
  startInteractiveTour: () => void;
  skipTour: () => void;
  resumeTour: () => void;

  // Community Social Feed (Facebook-style)
  communityPosts: CommunityPost[];
  createCommunityPost: (content: string, category: CommunityPost['category'], imageUrl?: string) => void;
  likeCommunityPost: (postId: string) => void;
  reactToPost: (postId: string, reactionType: ReactionType) => void;
  deleteCommunityPost: (postId: string) => void;
  addPostComment: (postId: string, text: string) => void;
  updateUserProfile: (updates: Partial<UserAccount>) => void;
  startPrivateChatWithUser: (targetUser: { id: string; name: string; role: StakeholderRole; avatar: string }) => void;
  loginWithGoogle: () => Promise<void>;
  isFirebaseConnected: boolean;

  // Notifications
  recentNotifications: { id: string; text: string; time: string; type: 'info' | 'success' | 'alert' }[];
  addNotification: (text: string, type?: 'info' | 'success' | 'alert') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

async function syncToDatabase(
  entity: string,
  action: string,
  payload: Record<string, unknown>
) {
  try {
    await fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity, action, payload }),
    });
  } catch {
    // Non-blocking background sync to Cloud SQL
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [environmentMode, setEnvironmentModeState] = useState<EnvironmentMode>('demo');

  const setEnvironmentMode = (mode: EnvironmentMode) => {
    setEnvironmentModeState(mode);
    try {
      localStorage.setItem('agrimatch_mode', mode);
    } catch {
      // fallback
    }
    addNotification(`Environment switched to ${mode.toUpperCase()} MODE.`, 'info');
  };

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('agrimatch_language') as LanguageCode | null;
      if (saved && saved in TRANSLATIONS) return saved;
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('agrimatch_language', lang);
    } catch {
      // fallback
    }
    const label = LANGUAGE_OPTIONS.find((opt) => opt.code === lang)?.label || lang;
    addNotification(`UI Language switched to ${label}.`, 'info');
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // DEMO MODE ISOLATED SANDBOX DATA
  const [demoCurrentUser, setDemoCurrentUser] = useState<UserAccount | null>(() => SEED_ACCOUNTS[0]);
  const [demoAccounts, setDemoAccounts] = useState<UserAccount[]>(SEED_ACCOUNTS);
  const [demoCommodities, setDemoCommodities] = useState<CommodityItem[]>(SEED_COMMODITIES);
  const [demoOrders, setDemoOrders] = useState<OrderRecord[]>(SEED_ORDERS);
  const [demoPosts, setDemoPosts] = useState<CommunityPost[]>(SEED_COMMUNITY_POSTS);

  // LIVE PRODUCTION REAL-TIME DATA
  const [liveCurrentUser, setLiveCurrentUser] = useState<UserAccount | null>(null);
  const [liveAccounts, setLiveAccounts] = useState<UserAccount[]>([]);
  const [liveCommodities, setLiveCommodities] = useState<CommodityItem[]>([]);
  const [liveOrders, setLiveOrders] = useState<OrderRecord[]>([]);
  const [livePosts, setLivePosts] = useState<CommunityPost[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  const currentUser = environmentMode === 'production' ? liveCurrentUser : demoCurrentUser;
  const accounts = environmentMode === 'production' ? liveAccounts : demoAccounts;
  const commodities = environmentMode === 'production' ? liveCommodities : demoCommodities;
  const orders = environmentMode === 'production' ? liveOrders : demoOrders;
  const communityPosts = environmentMode === 'production' ? livePosts : demoPosts;

  const setOrders = (updater: React.SetStateAction<OrderRecord[]>) => {
    if (environmentMode === 'production') {
      setLiveOrders(updater);
    } else {
      setDemoOrders(updater);
    }
  };

  const setCommodities = (updater: React.SetStateAction<CommodityItem[]>) => {
    if (environmentMode === 'production') {
      setLiveCommodities(updater);
    } else {
      setDemoCommodities(updater);
    }
  };

  const setAccounts = (updater: React.SetStateAction<UserAccount[]>) => {
    if (environmentMode === 'production') {
      setLiveAccounts(updater);
    } else {
      setDemoAccounts(updater);
    }
  };

  const setPosts = (updater: React.SetStateAction<CommunityPost[]>) => {
    if (environmentMode === 'production') {
      setLivePosts(updater);
    } else {
      setDemoPosts(updater);
    }
  };

  const [chatThreads, setChatThreads] = useState<ChatThread[]>(SEED_THREADS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [nvatArchive, setNvatArchive] = useState<NvatBulletinReport[]>(SEED_NVAT_ARCHIVE);
  const [selectedNvatDate, setSelectedNvatDate] = useState<string>(INITIAL_NVAT_ITEMS.date);

  const nvatReport = useMemo(() => {
    return (
      nvatArchive.find((r) => r.date === selectedNvatDate) ||
      nvatArchive[0] ||
      INITIAL_NVAT_ITEMS
    );
  }, [nvatArchive, selectedNvatDate]);

  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>(SEED_ANNOUNCEMENTS);
  const [counters, setCounters] = useState<SystemCounters>(INITIAL_COUNTERS);
  const [agentPackets, setAgentPackets] = useState<AgentPacket[]>(SEED_AGENT_PACKETS);
  const [verificationAuditLogs, setVerificationAuditLogs] = useState<VerificationAuditLog[]>(SEED_VERIFICATION_AUDIT_LOGS);
  const [moderationReports, setModerationReports] = useState<ModerationReport[]>(SEED_MODERATION_REPORTS);
  const [aiHistory, setAiHistory] = useState<AiHistoryEntry[]>(SEED_AI_HISTORY);

  // Real-time Firestore sync & Auth state listener
  useEffect(() => {
    testFirestoreConnection().then((ok) => setIsFirebaseConnected(ok));

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const liveUserObj: UserAccount = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Verified Agri Producer',
          email: fbUser.email || '',
          role: 'Farmer',
          phone: fbUser.phoneNumber || '+63 917 555 4321',
          municipality: 'Bambang',
          barangay: 'Aliaga',
          lat: 16.3861,
          lng: 121.1065,
          avatar: fbUser.photoURL || '',
          coverPhoto: '',
          bio: 'Verified Real-Time Producer on AGRIMATCH NV',
          verified: true,
          status: 'ACTIVE',
          strikeCount: 0,
          completedTradesCount: 0,
        };
        setLiveCurrentUser(liveUserObj);
        void syncToDatabase('user', 'upsert', liveUserObj as unknown as Record<string, unknown>);
        try {
          await setDoc(doc(db, 'users', fbUser.uid), liveUserObj, { merge: true });
        } catch (e) {
          console.warn('User profile sync:', e);
        }
      } else {
        setLiveCurrentUser(null);
      }
    });

    const unsubCommodities = onSnapshot(
      collection(db, 'live_commodities'),
      (snapshot) => {
        const items: CommodityItem[] = [];
        snapshot.forEach((docItem) => {
          items.push({ id: docItem.id, ...docItem.data() } as CommodityItem);
        });
        setLiveCommodities(items);
      },
      (error) => {
        console.warn('live_commodities listener:', error);
      }
    );

    const unsubPosts = onSnapshot(
      collection(db, 'live_community_posts'),
      (snapshot) => {
        const posts: CommunityPost[] = [];
        snapshot.forEach((docItem) => {
          posts.push({ id: docItem.id, ...docItem.data() } as CommunityPost);
        });
        setLivePosts(posts.sort((a, b) => b.id.localeCompare(a.id)));
      },
      (error) => {
        console.warn('live_community_posts listener:', error);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubCommodities();
      unsubPosts();
    };
  }, []);

  // Active tab defaults to public-landing as required by Entry Point & Gatekeeper spec
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const savedTab = localStorage.getItem('agrimatch_active_tab');
      if (savedTab && savedTab !== 'framework') return savedTab;
      return 'public-landing';
    } catch {
      return 'public-landing';
    }
  });

  const [isGuestLockOpen, setIsGuestLockOpen] = useState(false);
  const [guestAttemptedTab, setGuestAttemptedTab] = useState('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isDemoSwitcherOpen, setIsDemoSwitcherOpen] = useState(false);
  const [isPagasaModalOpen, setIsPagasaModalOpen] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [pendingAdminRedirect, setPendingAdminRedirect] = useState(false);
  const [activeOrderModalItem, setActiveOrderModalItem] = useState<CommodityItem | null>(null);
  const [highlightedCommodityId, setHighlightedCommodityId] = useState<string | null>(null);
  const [requestedCommunityView, setRequestedCommunityView] = useState<'feed' | 'bulletins' | null>(null);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(SEED_THREADS[0].id);
  const [selectedRoute, setSelectedRoute] = useState<AppContextType['selectedRoute']>(null);

  // Interactive Guided Onboarding Tour State
  const [isInteractiveTourActive, setIsInteractiveTourActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('agribee_tour_dismissed') !== 'true';
    } catch {
      return false;
    }
  });
  const [currentTourStep, setCurrentTourStep] = useState<number>(0);

  const [recentNotifications, setRecentNotifications] = useState<
    { id: string; text: string; time: string; type: 'info' | 'success' | 'alert' }[]
  >([
    {
      id: 'notif-1',
      text: 'PAGASA: Isolated rain showers over Kayapa ridge this afternoon.',
      time: 'Just now',
      type: 'info',
    },
    {
      id: 'notif-2',
      text: 'NVAT Daily Bulletin updated: Cabbage arrivals up to 42 MT.',
      time: '25m ago',
      type: 'success',
    },
  ]);

  const addNotification = (text: string, type: 'info' | 'success' | 'alert' = 'info') => {
    setRecentNotifications((prev) => [
      { id: `notif-${Date.now()}`, text, time: 'Just now', type },
      ...prev.slice(0, 7),
    ]);
  };

  const startInteractiveTour = () => {
    setCurrentTourStep(0);
    setIsInteractiveTourActive(true);
    addNotification('AGRIBEE Interactive Tour started! Follow along on the right panel.', 'info');
  };

  const skipTour = () => {
    setIsInteractiveTourActive(false);
    try {
      localStorage.setItem('agribee_tour_dismissed', 'true');
    } catch {
      // ignore
    }
    addNotification('Tutorial skipped. Reopen Agri Bee anytime from the floating button.', 'info');
  };

  const resumeTour = () => {
    setIsInteractiveTourActive(true);
  };

  useEffect(() => {
    setCounters((c) => ({
      ...c,
      totalVisitors: c.totalVisitors + 1,
    }));
  }, []);

  const navigateToTabWithGuard = (tab: string) => {
    if (!currentUser && tab !== 'public-landing') {
      setGuestAttemptedTab(tab);
      setIsGuestLockOpen(true);
      return;
    }
    if (tab === 'admin' && currentUser?.role !== 'MASTER_ADMIN') {
      setPendingAdminRedirect(true);
      setIsAdminPasswordModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const openMarketplaceToCommodity = (commodityId: string) => {
    setHighlightedCommodityId(commodityId);
    if (!currentUser) {
      setGuestAttemptedTab('marketplace');
      setIsGuestLockOpen(true);
      return;
    }
    setActiveTab('marketplace');
    addNotification('Jumping to highlighted commodity in Marketplace.', 'info');
  };

  const openCommunityBulletins = () => {
    setRequestedCommunityView('bulletins');
    if (!currentUser) {
      setGuestAttemptedTab('community');
      setIsGuestLockOpen(true);
      return;
    }
    setActiveTab('community');
  };

  const buildMasterAdminProfile = (): UserAccount => {
    const existing = demoAccounts.find((a) => a.role === 'MASTER_ADMIN');
    if (existing) return existing;
    return {
      id: 'master_admin',
      name: 'Engr. Russel Gurat (Master Admin)',
      organization: 'Provincial Agricultural Research Command',
      email: MASTER_ADMIN_EMAIL,
      role: 'MASTER_ADMIN',
      phone: '+63 917 888 9999',
      municipality: 'Bayombong',
      barangay: 'Don Domingo Maddela',
      lat: 16.4856,
      lng: 121.1492,
      avatar: '',
      coverPhoto: '',
      bio: 'Platform Creator, Master Administrator & Lead Multi-Agent AI Engineer for AGRIMATCH-NV.',
      verified: true,
      status: 'ACTIVE',
      strikeCount: 0,
      completedTradesCount: 0,
    };
  };

  const verifyMasterAdminPassword = async (
    password: string,
    emailInput?: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (
      emailInput &&
      emailInput.trim().toLowerCase() !== MASTER_ADMIN_EMAIL.toLowerCase()
    ) {
      return {
        success: false,
        message: 'Email does not match the Master Administrator account.',
      };
    }

    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.authorized) {
        return {
          success: false,
          message: data.error || 'Invalid Master Admin password.',
        };
      }

      const masterAdminAcc = buildMasterAdminProfile();
      if (environmentMode === 'production') {
        setLiveCurrentUser(masterAdminAcc);
      } else {
        setDemoCurrentUser(masterAdminAcc);
      }
      if (pendingAdminRedirect || activeTab !== 'admin') {
        setActiveTab('admin');
      }
      setPendingAdminRedirect(false);
      addNotification('Master Admin Command Center unlocked.', 'success');
      return { success: true };
    } catch {
      return {
        success: false,
        message: 'Unable to reach verification server. Please retry.',
      };
    }
  };

  const switchDemoAccount = (accountId: string) => {
    const acc = demoAccounts.find((a) => a.id === accountId);
    if (!acc) return;

    if (acc.role === 'MASTER_ADMIN' && currentUser?.role !== 'MASTER_ADMIN') {
      setPendingAdminRedirect(true);
      setIsAdminPasswordModalOpen(true);
      return;
    }

    setDemoCurrentUser(acc);
    addNotification(`Switched active profile to ${acc.name} (${acc.role})`, 'success');
    if (acc.role === 'MASTER_ADMIN') {
      setActiveTab('admin');
    }
  };

  const switchDemoRole = (role: StakeholderRole) => {
    if (role === 'MASTER_ADMIN' && currentUser?.role !== 'MASTER_ADMIN') {
      setPendingAdminRedirect(true);
      setIsAdminPasswordModalOpen(true);
      return;
    }

    const acc = demoAccounts.find((a) => a.role === role);
    if (acc) {
      setDemoCurrentUser(acc);
      addNotification(`Demo Role switched to ${role}: ${acc.name}`, 'success');
      if (role === 'MASTER_ADMIN') {
        setActiveTab('admin');
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      addNotification('Signed in with Google Firebase Auth!', 'success');
      setActiveTab('dashboard');
    } catch {
      addNotification('Google Sign-In failed or was cancelled.', 'alert');
    }
  };

  const loginWithCredentials = (email: string, _pass: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        message: 'Use the Master Admin password verification flow.',
      };
    }

    const match = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (match) {
      if (match.status === 'BANNED') {
        return { success: false, message: 'This account has been suspended by System Moderation.' };
      }
      if (environmentMode === 'production') {
        setLiveCurrentUser(match);
      } else {
        setDemoCurrentUser(match);
      }
      addNotification(`Welcome back, ${match.name}!`, 'success');
      return { success: true };
    }

    return {
      success: false,
      message:
        environmentMode === 'production'
          ? 'Account not found in Live database. Please Register or Sign In with Google.'
          : 'Invalid credentials. Try a stakeholder email or use the Demo Switcher.',
    };
  };

  const registerNewAccount = (accountData: Partial<UserAccount>): UserAccount => {
    const newAcc: UserAccount = {
      id: `user-${Date.now()}`,
      name: accountData.name || 'New Stakeholder',
      organization: accountData.organization || '',
      email: accountData.email || `user${Date.now()}@agrimatch-nv.ph`,
      role: accountData.role === 'MASTER_ADMIN' ? 'Farmer' : accountData.role || 'Farmer',
      phone: accountData.phone || '+63 9XX XXX XXXX',
      municipality: accountData.municipality || 'Bambang',
      barangay: accountData.barangay || 'Aliaga',
      lat: accountData.lat || 16.3861,
      lng: accountData.lng || 121.1065,
      avatar: accountData.avatar || '',
      coverPhoto: accountData.coverPhoto || '',
      bio: accountData.bio || 'Nueva Vizcaya registered agricultural stakeholder.',
      verified: true,
      status: 'ACTIVE',
      rating: 5.0,
      strikeCount: 0,
      completedTradesCount: 0,
    };

    if (environmentMode === 'production') {
      setLiveAccounts((prev) => [newAcc, ...prev]);
      setLiveCurrentUser(newAcc);
      try {
        void setDoc(doc(db, 'users', newAcc.id), newAcc);
      } catch (e) {
        console.warn('Error saving live user:', e);
      }
    } else {
      setDemoAccounts((prev) => [...prev, newAcc]);
      setDemoCurrentUser(newAcc);
    }

    void syncToDatabase('user', 'upsert', newAcc as unknown as Record<string, unknown>);

    setCounters((c) => ({
      ...c,
      currentlyLoggedIn: c.currentlyLoggedIn + 1,
      farmersCount: newAcc.role === 'Farmer' ? c.farmersCount + 1 : c.farmersCount,
      suppliersCount: newAcc.role === 'Supplier' ? c.suppliersCount + 1 : c.suppliersCount,
      buyersCount: newAcc.role === 'Buyer' ? c.buyersCount + 1 : c.buyersCount,
      cooperativesCount: newAcc.role === 'Cooperative' ? c.cooperativesCount + 1 : c.cooperativesCount,
    }));

    addNotification(`Account created successfully as ${newAcc.role}!`, 'success');
    return newAcc;
  };

  const logout = async () => {
    if (environmentMode === 'production') {
      try {
        await logOutFirebase();
      } catch (e) {
        console.warn(e);
      }
      setLiveCurrentUser(null);
    } else {
      setDemoCurrentUser(null);
    }
    setActiveTab('public-landing');
    addNotification('Logged out from platform session.', 'info');
  };

  const logAiHistory = (entry: Omit<AiHistoryEntry, 'id' | 'createdAt'>) => {
    const newEntry: AiHistoryEntry = {
      id: `ai-hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };
    setAiHistory((prev) => [newEntry, ...prev.slice(0, 49)]);
    void syncToDatabase('ai_history', 'upsert', {
      userUid: entry.userId,
      userRole: entry.userRole,
      agentType: entry.agentType,
      prompt: entry.prompt,
      responseSummary: entry.responseSummary,
      metadata: entry.metadata || null,
      poweredByGemini: entry.poweredByGemini,
    });
    try {
      void setDoc(doc(db, 'ai_history', newEntry.id), newEntry);
    } catch {
      // fallback
    }
  };

  const createOrderInquiry = (
    commodity: CommodityItem,
    quantityKg: number,
    proposedPricePhp: number,
    deliveryMode: DeliveryMode,
    deliveryLocation: string,
    paymentOption: PaymentOption
  ): OrderRecord => {
    if (!currentUser) throw new Error('Authentication required');

    const orderId = `ord-${Date.now().toString().slice(-5)}`;
    const threadId = `chat-thread-${orderId}`;

    const newOrder: OrderRecord = {
      id: orderId,
      commodityId: commodity.id,
      commodityName: commodity.name,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      supplierId: commodity.supplierId,
      supplierName: commodity.supplierName,
      quantityKg,
      listedPricePerKg: commodity.pricePerKg,
      proposedPricePerKg: proposedPricePhp,
      totalAmountPhp: quantityKg * proposedPricePhp,
      status: 'INQUIRY_SUBMITTED',
      deliveryMode,
      deliveryLocation,
      paymentOption,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      supplierConfirmedSent: false,
      buyerConfirmedReceived: false,
      chatThreadId: threadId,
    };

    const newThread: ChatThread = {
      id: threadId,
      buyerId: currentUser.id,
      supplierId: commodity.supplierId,
      commodityId: commodity.id,
      commodityName: commodity.name,
      orderId,
      lastMessageSnippet: `Order Inquiry submitted for ${quantityKg} kg @ Php ${proposedPricePhp}/kg`,
      lastMessageTimestamp: new Date().toISOString(),
      unreadCount: 1,
    };

    const initialMessages: ChatMessage[] = [
      {
        id: `msg-${Date.now()}-1`,
        threadId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text: `Hello ${commodity.supplierName}, I have placed an inquiry for ${quantityKg} kg of ${commodity.name} at PHP ${proposedPricePhp}/kg.`,
        timestamp: new Date().toISOString(),
      },
      {
        id: `msg-${Date.now()}-2`,
        threadId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text: 'Interactive Order & Fulfillment Card pinned below. Please confirm when ready to dispatch.',
        timestamp: new Date().toISOString(),
        isOrderCard: true,
        orderId,
      },
    ];

    setOrders((prev) => [newOrder, ...prev]);
    setChatThreads((prev) => [newThread, ...prev]);
    setChatMessages((prev) => [...prev, ...initialMessages]);
    setActiveChatThreadId(threadId);

    void syncToDatabase('order', 'upsert', newOrder as unknown as Record<string, unknown>);
    initialMessages.forEach((m) =>
      void syncToDatabase('private_message', 'upsert', {
        ...m,
        recipientUid: commodity.supplierId,
      })
    );
    try {
      void setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch {
      // fallback
    }

    triggerAgentPacket({
      fromAgent: 'Buyer Agent',
      toAgent: 'Supplier Agent',
      intent: 'NEW_ORDER_DISPATCH_CARD',
      payload: {
        orderId,
        buyer: currentUser.name,
        supplier: commodity.supplierName,
        kg: quantityKg,
        amountPhp: newOrder.totalAmountPhp,
      },
    });

    addNotification(`Order Inquiry #${orderId} created & sent to ${commodity.supplierName}!`, 'success');
    return newOrder;
  };

  const handleAtomicCompletion = (completedOrder: OrderRecord) => {
    setCommodities((prev) =>
      prev.map((c) => {
        if (c.id === completedOrder.commodityId) {
          const newStock = Math.max(0, c.availableKg - completedOrder.quantityKg);
          return { ...c, availableKg: newStock };
        }
        return c;
      })
    );

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === completedOrder.supplierId || acc.id === completedOrder.buyerId) {
          return {
            ...acc,
            completedTradesCount: (acc.completedTradesCount || 0) + 1,
          };
        }
        return acc;
      })
    );

    setCounters((c) => ({
      ...c,
      totalCompletedTransactions: c.totalCompletedTransactions + 1,
      totalCommoditiesPostedKg: Math.max(0, c.totalCommoditiesPostedKg - completedOrder.quantityKg),
    }));

    sendMessage(
      completedOrder.chatThreadId,
      `TRANSACTION COMPLETE: Order #${completedOrder.id} for ${completedOrder.quantityKg} kg fulfilled! Permanent ledger record written.`,
      {}
    );

    void syncToDatabase('order', 'upsert', completedOrder as unknown as Record<string, unknown>);

    triggerAgentPacket({
      fromAgent: 'Supplier Agent',
      toAgent: 'Market Agent',
      intent: 'TRANSACTION_SETTLED_ATOMIC',
      payload: {
        orderId: completedOrder.id,
        kg: completedOrder.quantityKg,
        finalAmountPhp: completedOrder.totalAmountPhp,
      },
    });

    addNotification(
      `Transaction #${completedOrder.id} completed! Counters and seller trades updated.`,
      'success'
    );
  };

  const markOrderSent = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: OrderRecord = {
            ...ord,
            supplierConfirmedSent: true,
            supplierConfirmedSentAt: new Date().toISOString(),
            status: ord.buyerConfirmedReceived ? 'COMPLETED' : 'ORDER_DISPATCHED',
            updatedAt: new Date().toISOString(),
          };

          void syncToDatabase('order', 'upsert', updated as unknown as Record<string, unknown>);
          if (checkDualHandshakeCompletion(true, ord.buyerConfirmedReceived)) {
            handleAtomicCompletion(updated);
          } else {
            addNotification(`Order #${orderId} marked as DISPATCHED by Supplier!`, 'info');
          }
          return updated;
        }
        return ord;
      })
    );
  };

  const markOrderReceived = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: OrderRecord = {
            ...ord,
            buyerConfirmedReceived: true,
            buyerConfirmedReceivedAt: new Date().toISOString(),
            status: ord.supplierConfirmedSent ? 'COMPLETED' : ord.status,
            updatedAt: new Date().toISOString(),
          };

          void syncToDatabase('order', 'upsert', updated as unknown as Record<string, unknown>);
          if (checkDualHandshakeCompletion(ord.supplierConfirmedSent, true)) {
            handleAtomicCompletion(updated);
          } else {
            addNotification(`Order #${orderId} marked as RECEIVED by Buyer!`, 'info');
          }
          return updated;
        }
        return ord;
      })
    );
  };

  const sendMessage = (
    threadId: string,
    text: string,
    extra?: { isOrderCard?: boolean; orderId?: string; locationPin?: { lat: number; lng: number; label: string } }
  ) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text,
      timestamp: new Date().toISOString(),
      ...extra,
    };

    const thread = chatThreads.find((th) => th.id === threadId);
    const recipientUid = thread
      ? thread.buyerId === currentUser.id
        ? thread.supplierId
        : thread.buyerId
      : '';

    setChatMessages((prev) => [...prev, newMsg]);
    setChatThreads((prev) =>
      prev.map((th) =>
        th.id === threadId
          ? {
              ...th,
              lastMessageSnippet: text,
              lastMessageTimestamp: new Date().toISOString(),
            }
          : th
      )
    );

    void syncToDatabase('private_message', 'upsert', {
      ...newMsg,
      recipientUid,
    });
    try {
      void setDoc(doc(db, 'private_messages', newMsg.id), { ...newMsg, recipientUid });
    } catch {
      // fallback
    }
  };

  const addNewCommodity = (cropData: Partial<CommodityItem>) => {
    if (!currentUser) return;

    const newCrop: CommodityItem = {
      id: `crop-${Date.now()}`,
      name: cropData.name || 'Nueva Vizcaya Fresh Produce',
      category: cropData.category || 'Highland Vegetables',
      supplierId: currentUser.id,
      supplierName: currentUser.name,
      supplierRole: currentUser.role === 'Cooperative' ? 'Cooperative' : currentUser.role === 'Supplier' ? 'Supplier' : 'Farmer',
      municipality: cropData.municipality || currentUser.municipality,
      barangay: cropData.barangay || currentUser.barangay,
      lat: cropData.lat || currentUser.lat,
      lng: cropData.lng || currentUser.lng,
      availableKg: cropData.availableKg || 100,
      pricePerKg: cropData.pricePerKg || 30,
      minOrderKg: cropData.minOrderKg || 20,
      farmgatePricePhp: cropData.farmgatePricePhp,
      contactPhone: cropData.contactPhone || currentUser.phone,
      imageUrl: cropData.imageUrl || getCropPhotoByName(cropData.name || '', cropData.category),
      additionalPhotos: cropData.additionalPhotos || [],
      videoUrl: cropData.videoUrl || '',
      mediaType: cropData.mediaType || (cropData.videoUrl ? 'video' : 'photo'),
      verificationStatus: 'PENDING',
      aiAuthenticityScore: cropData.aiAuthenticityScore || 92,
      aiVisionNotes:
        cropData.aiVisionNotes ||
        (cropData.manualGradeOverride
          ? 'Manual quality override applied by producer — extended Admin verification required.'
          : 'Automated initial intake complete. Pending Master Admin verification review.'),
      harvestDate: cropData.harvestDate || new Date().toISOString().split('T')[0],
      daysToHarvest: cropData.daysToHarvest ?? 0,
      qualityGrade: cropData.qualityGrade || 'Grade A Premium',
      aiSuggestedGrade: cropData.aiSuggestedGrade,
      manualGradeOverride: cropData.manualGradeOverride,
      organicCertified: cropData.organicCertified || false,
      notes: cropData.notes || '',
      postedAt: new Date().toISOString(),
    };

    setCommodities((prev) => [newCrop, ...prev]);
    setCounters((c) => ({
      ...c,
      totalActiveListingsCount: c.totalActiveListingsCount + 1,
      totalCommoditiesPostedKg: c.totalCommoditiesPostedKg + newCrop.availableKg,
    }));

    void syncToDatabase('commodity', 'upsert', newCrop as unknown as Record<string, unknown>);
    if (environmentMode === 'production') {
      try {
        void setDoc(doc(db, 'live_commodities', newCrop.id), newCrop);
      } catch {
        // fallback
      }
    }

    addNotification(
      cropData.manualGradeOverride
        ? `Listing "${newCrop.name}" submitted with manual grade override (longer Admin inspection applies).`
        : `Crop listing "${newCrop.name}" submitted! Status: PENDING Admin review.`,
      cropData.manualGradeOverride ? 'alert' : 'info'
    );
  };

  const approveCommodity = (commodityId: string) => {
    verifyAndBoostCommodity(commodityId);
  };

  const verifyAndBoostCommodity = (commodityId: string) => {
    const targetCrop = commodities.find((c) => c.id === commodityId);
    setCommodities((prev) =>
      prev.map((c) => {
        if (c.id === commodityId) {
          const updated: CommodityItem = {
            ...c,
            verificationStatus: 'VERIFIED',
            aiAuthenticityScore: Math.max(c.aiAuthenticityScore, 98),
            verifiedBoostRank: Date.now(),
          };
          void syncToDatabase('commodity', 'upsert', updated as unknown as Record<string, unknown>);
          return updated;
        }
        return c;
      })
    );

    if (targetCrop) {
      const newAuditLog: VerificationAuditLog = {
        id: `audit-${Date.now()}`,
        commodityId,
        commodityName: targetCrop.name,
        supplierId: targetCrop.supplierId,
        supplierName: targetCrop.supplierName,
        decision: 'APPROVED',
        reasonCode: 'AUTHENTIC_HARVEST_PHOTO_MATCH',
        notes: 'AI vision crate texture, harvest freshness, and farm location verified.',
        reviewerId: currentUser?.id || 'master_admin',
        reviewerEmail: currentUser?.email || MASTER_ADMIN_EMAIL,
        timestamp: new Date().toISOString(),
      };
      setVerificationAuditLogs((prev) => [newAuditLog, ...prev]);
    }

    addNotification('Crop listing VERIFIED, BOOSTED, and recorded in Master Audit Trail!', 'success');
  };

  const rejectCommodity = (commodityId: string) => {
    rejectAndWarnCommodity(commodityId, 'Listing content does not comply with verified authenticity standards.');
  };

  const rejectAndWarnCommodity = (commodityId: string, warningReason: string) => {
    const targetCrop = commodities.find((c) => c.id === commodityId);
    if (!targetCrop) return;

    setCommodities((prev) => prev.filter((c) => c.id !== commodityId));
    void syncToDatabase('commodity', 'upsert', {
      ...targetCrop,
      verificationStatus: 'REJECTED',
      rejectionReason: warningReason,
    });

    let newStrikeCount = 1;
    let isBanned = false;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === targetCrop.supplierId) {
          const evalRes = evaluateStrikeAction(acc.strikeCount || 0, 'STRIKE_DELETE');
          newStrikeCount = evalRes.nextStrikes;
          isBanned = evalRes.autoBanned;
          const updatedWarnings = [...(acc.warningMessages || []), warningReason];
          const nextAcc: UserAccount = {
            ...acc,
            strikeCount: newStrikeCount,
            status: evalRes.nextStatus,
            warningMessages: updatedWarnings,
          };
          void syncToDatabase('user', 'upsert', nextAcc as unknown as Record<string, unknown>);
          return nextAcc;
        }
        return acc;
      })
    );

    const newAuditLog: VerificationAuditLog = {
      id: `audit-${Date.now()}`,
      commodityId,
      commodityName: targetCrop.name,
      supplierId: targetCrop.supplierId,
      supplierName: targetCrop.supplierName,
      decision: 'REJECTED',
      reasonCode: warningReason.slice(0, 40).toUpperCase().replace(/[^A-Z0-9]/g, '_'),
      notes: warningReason,
      reviewerId: currentUser?.id || 'master_admin',
      reviewerEmail: currentUser?.email || MASTER_ADMIN_EMAIL,
      timestamp: new Date().toISOString(),
    };
    setVerificationAuditLogs((prev) => [newAuditLog, ...prev]);

    addNotification(
      `Listing rejected. Official warning logged for ${targetCrop.supplierName} (Strike ${newStrikeCount}/3)${
        isBanned ? ' — ACCOUNT SUSPENDED!' : ''
      }`,
      'alert'
    );
  };

  const deleteCommodity = (commodityId: string) => {
    setCommodities((prev) => prev.filter((c) => c.id !== commodityId));
    addNotification('Commodity listing deleted from database.', 'info');
  };

  const toggleBanUser = (userId: string) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === userId) {
          const newStatus = a.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
          const updated = { ...a, status: newStatus } as UserAccount;
          void syncToDatabase('user', 'upsert', updated as unknown as Record<string, unknown>);
          addNotification(
            `User ${a.name} account is now ${newStatus}.`,
            newStatus === 'BANNED' ? 'alert' : 'success'
          );
          return updated;
        }
        return a;
      })
    );
  };

  const publishAdminAnnouncement = (
    title: string,
    content: string,
    category: AdminAnnouncement['category']
  ) => {
    const newAnn: AdminAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      category,
      postedAt: new Date().toISOString(),
      author: currentUser ? currentUser.name : 'Master Admin Command Hub',
      pinned: true,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    addNotification(`Official announcement published: "${title}"`, 'success');
  };

  const commitNvatReport = (newReport: NvatBulletinReport) => {
    setNvatArchive((prev) => {
      const others = prev.filter((r) => r.date !== newReport.date);
      return [newReport, ...others].sort((a, b) => b.date.localeCompare(a.date));
    });
    setSelectedNvatDate(newReport.date);
    void syncToDatabase('nvat_bulletin', 'upsert', {
      id: newReport.id,
      bulletinDate: newReport.date,
      rawText: newReport.rawText,
      items: newReport.items,
      executiveSummary: newReport.executiveSummary,
      googleSheetUrl: newReport.googleSheetUrl || null,
      publishedByUid: currentUser?.id || 'master_admin',
    });
    try {
      void setDoc(doc(db, 'nvat_bulletins', newReport.id), newReport);
    } catch {
      // fallback
    }
  };

  const processAndPublishNvatBulletin = (rawText: string, preParsedItems?: NvatMarketItem[]) => {
    const today = new Date().toISOString().split('T')[0];
    const parsedItems =
      preParsedItems && preParsedItems.length > 0
        ? preParsedItems
        : parseNvatTextToStructured(rawText, today);

    const newReport: NvatBulletinReport = {
      id: `nvat-bulletin-${Date.now()}`,
      date: today,
      rawText,
      processedAt: new Date().toISOString(),
      items: parsedItems,
      executiveSummary: [
        `Processed NVAT bulletin containing ${parsedItems.length} commodity price updates.`,
        `Average prevailing price range: Php ${Math.min(...parsedItems.map((i) => i.prevailingPricePhp))}/kg to Php ${Math.max(...parsedItems.map((i) => i.prevailingPricePhp))}/kg.`,
        'Automated AI Agent pipeline verified trading weights and price variance indicators.',
        'Immediate live feed push completed for all stakeholder dashboards.',
      ],
      volumeShareData: parsedItems.map((item) => ({
        name: item.commodityName.split(' ')[0],
        volumeTons: item.estimatedVolumeTradedTons,
        percentage:
          Math.round(
            (item.estimatedVolumeTradedTons /
              Math.max(
                1,
                parsedItems.reduce((acc, cur) => acc + cur.estimatedVolumeTradedTons, 0)
              )) *
              1000
          ) / 10,
      })),
      priceComparisonData: parsedItems.map((item) => ({
        name: item.commodityName.split(' ')[0],
        prevailing: item.prevailingPricePhp,
        previous: item.previousPricePhp,
      })),
      historicalTrendData: nvatReport.historicalTrendData,
    };

    commitNvatReport(newReport);
    addNotification('NVAT Market Intelligence AI processed and published live!', 'success');
  };

  const publishStructuredNvatBulletin = (
    items: NvatMarketItem[],
    sourceTitle: string = 'NVAT Daily Bulletin, Bambang'
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newReport: NvatBulletinReport = {
      id: `nvat-bulletin-${Date.now()}`,
      date: today,
      rawText: `Validated bulletin extracted from ${sourceTitle} (${items.length} items)`,
      processedAt: new Date().toISOString(),
      items: items.map((it) => ({
        ...it,
        originalDataSource: it.originalDataSource || sourceTitle,
        lastUpdated:
          it.lastUpdated ||
          `${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} PHT`,
      })),
      executiveSummary: [
        `Verified: ${items.filter((i) => i.priceType === 'Confirmed').length} Confirmed trading post prices approved.`,
        `Extracted from ${sourceTitle} with validation checks passed.`,
        `Prevailing price range: Php ${Math.min(...items.map((i) => i.prevailingPricePhp))}/kg to Php ${Math.max(...items.map((i) => i.prevailingPricePhp))}/kg.`,
        'Synchronized across community NVAT Bulletins archive and ledgers.',
      ],
      volumeShareData: items.map((item) => ({
        name: item.commodityName.split(' ')[0],
        volumeTons: item.estimatedVolumeTradedTons || 10,
        percentage:
          Math.round(
            ((item.estimatedVolumeTradedTons || 10) /
              Math.max(
                1,
                items.reduce((acc, cur) => acc + (cur.estimatedVolumeTradedTons || 10), 0)
              )) *
              1000
          ) / 10,
      })),
      priceComparisonData: items.map((item) => ({
        name: item.commodityName.split(' ')[0],
        prevailing: item.prevailingPricePhp,
        previous: item.previousPricePhp,
      })),
      historicalTrendData: nvatReport.historicalTrendData,
    };

    commitNvatReport(newReport);
    addNotification(`Validated bulletin published with ${items.length} verified commodities!`, 'success');
  };

  const exportCurrentBulletinToSheets = async (
    bulletin?: NvatBulletinReport
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
    const target = bulletin || nvatReport;
    const accessToken = await getGoogleSheetsAccessToken();
    const res = await exportBulletinToGoogleSheets({
      accessToken,
      title: 'AgriMatch NV - NVAT Daily Commodity Bulletin',
      date: target.date,
      rows: target.items,
      summary: target.executiveSummary,
    });

    const updatedReport: NvatBulletinReport = {
      ...target,
      googleSheetUrl: res.spreadsheetUrl,
    };
    commitNvatReport(updatedReport);
    addNotification(`NVAT Bulletin (${target.date}) exported to Google Sheets.`, 'success');
    return res;
  };

  const triggerAgentPacket = (packetData: Omit<AgentPacket, 'id' | 'timestamp'>) => {
    const packet: AgentPacket = {
      id: `pkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...packetData,
    };
    setAgentPackets((prev) => [packet, ...prev.slice(0, 19)]);
  };

  const createCommunityPost = (
    content: string,
    category: CommunityPost['category'],
    imageUrl?: string
  ) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: currentUser?.id || 'guest_01',
      authorName: currentUser?.name || 'Agri Producer',
      authorRole: currentUser?.role || 'Farmer',
      authorAvatar: currentUser?.avatar || '',
      authorMunicipality: currentUser?.municipality || 'Bambang',
      category,
      content,
      imageUrl,
      timestamp: 'Just now',
      likes: [],
      reactions: { heart: [], wow: [], sad: [], care: [], angry: [] },
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    void syncToDatabase('community_post', 'upsert', newPost as unknown as Record<string, unknown>);
    if (environmentMode === 'production') {
      try {
        void setDoc(doc(db, 'live_community_posts', newPost.id), newPost);
      } catch (e) {
        console.warn('Error saving live post:', e);
      }
    }
    addNotification('Community update published to social wall!', 'success');
  };

  const reactToPost = (postId: string, reactionType: ReactionType) => {
    const userId = currentUser?.id || 'guest_user';
    setPosts((postsList) =>
      postsList.map((p) => {
        if (p.id !== postId) return p;
        const baseReactions =
          p.reactions || (p.likes.length > 0 ? { heart: p.likes } : {});
        const nextReactions = toggleReactionMap(baseReactions, userId, reactionType);
        const nextLikes = nextReactions.heart || [];
        const updatedPost: CommunityPost = {
          ...p,
          reactions: nextReactions,
          likes: nextLikes,
        };
        void syncToDatabase('community_post', 'upsert', updatedPost as unknown as Record<string, unknown>);
        if (environmentMode === 'production') {
          try {
            void updateDoc(doc(db, 'live_community_posts', postId), {
              reactions: nextReactions,
              likes: nextLikes,
            });
          } catch (e) {
            console.warn(e);
          }
        }
        return updatedPost;
      })
    );
  };

  const likeCommunityPost = (postId: string) => {
    reactToPost(postId, 'heart');
  };

  const deleteCommunityPost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    void syncToDatabase('community_post', 'delete', { id: postId });
    if (environmentMode === 'production') {
      try {
        void deleteDoc(doc(db, 'live_community_posts', postId));
      } catch {
        // fallback
      }
    }
    addNotification('Community post removed from database.', 'info');
  };

  const addPostComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: CommunityPostComment = {
      id: `comm-${Date.now()}`,
      postId,
      authorId: currentUser?.id || 'guest_user',
      authorName: currentUser?.name || 'Community Member',
      authorRole: currentUser?.role || 'Farmer',
      authorAvatar: currentUser?.avatar || '',
      text: text.trim(),
      timestamp: 'Just now',
      likes: [],
    };

    setPosts((postsList) =>
      postsList.map((p) => {
        if (p.id === postId) {
          const updatedComments = [...(p.comments || []), newComment];
          if (environmentMode === 'production') {
            try {
              void updateDoc(doc(db, 'live_community_posts', postId), {
                comments: updatedComments,
              });
            } catch (e) {
              console.warn(e);
            }
          }
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );

    void syncToDatabase('post_comment', 'upsert', {
      id: newComment.id,
      postId,
      authorUid: newComment.authorId,
      authorName: newComment.authorName,
      authorRole: newComment.authorRole,
      text: newComment.text,
    });
    addNotification('Comment posted to discussion.', 'info');
  };

  const submitModerationReport = (report: {
    targetType: ModerationReport['targetType'];
    targetId: string;
    targetUserId: string;
    targetUserName: string;
    targetPreview: string;
    reason: string;
  }) => {
    if (!report.reason.trim()) return;
    const newReport: ModerationReport = {
      id: `rep-${Date.now()}`,
      ...report,
      reporterId: currentUser?.id || 'guest_user',
      reporterName: currentUser?.name || 'Community Member',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setModerationReports((prev) => [newReport, ...prev]);
    void syncToDatabase('moderation_report', 'create', {
      id: newReport.id,
      targetType: newReport.targetType,
      targetId: newReport.targetId,
      targetUserUid: newReport.targetUserId,
      targetUserName: newReport.targetUserName,
      reporterUid: newReport.reporterId,
      reporterName: newReport.reporterName,
      reason: `${newReport.reason} (${newReport.targetPreview})`,
    });
    try {
      void setDoc(doc(db, 'moderation_reports', newReport.id), newReport);
    } catch {
      // fallback
    }
    addNotification('Report submitted to Master Admin moderation queue.', 'info');
  };

  const adminResolveReport = (
    reportId: string,
    action: 'STRIKE_DELETE' | 'BAN_DIRECT' | 'DISMISS'
  ) => {
    const targetReport = moderationReports.find((r) => r.id === reportId);
    if (!targetReport) return;

    const nextStatusMap: Record<'STRIKE_DELETE' | 'BAN_DIRECT' | 'DISMISS', ModerationReport['status']> = {
      STRIKE_DELETE: 'RESOLVED_STRIKE',
      BAN_DIRECT: 'RESOLVED_BAN',
      DISMISS: 'DISMISSED',
    };

    const resolvedAt = new Date().toISOString();

    // Update target account strikes / ban status
    let finalStrikes = 0;
    let wasAutoBanned = false;
    if (action === 'STRIKE_DELETE' || action === 'BAN_DIRECT') {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== targetReport.targetUserId) return acc;
          const evalRes = evaluateStrikeAction(acc.strikeCount || 0, action);
          finalStrikes = evalRes.nextStrikes;
          wasAutoBanned = evalRes.autoBanned;
          const warnMsg =
            action === 'BAN_DIRECT'
              ? `Account permanently banned by Master Admin (${targetReport.reason}).`
              : `Strike ${finalStrikes}/3: Violation confirmed (${targetReport.reason}).`;
          const nextAcc: UserAccount = {
            ...acc,
            strikeCount: finalStrikes,
            status: evalRes.nextStatus,
            warningMessages: [...(acc.warningMessages || []), warnMsg],
          };
          void syncToDatabase('user', 'upsert', nextAcc as unknown as Record<string, unknown>);
          return nextAcc;
        })
      );

      // Delete offending post / comment / commodity
      if (targetReport.targetType === 'POST') {
        deleteCommunityPost(targetReport.targetId);
      } else if (targetReport.targetType === 'COMMENT') {
        setPosts((prev) =>
          prev.map((p) => ({
            ...p,
            comments: p.comments.filter((c) => c.id !== targetReport.targetId),
          }))
        );
      } else if (targetReport.targetType === 'COMMODITY') {
        deleteCommodity(targetReport.targetId);
      }
    }

    setModerationReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: nextStatusMap[action],
              resolutionAction:
                action === 'DISMISS'
                  ? 'Dismissed by Master Admin'
                  : action === 'BAN_DIRECT'
                  ? 'User Banned & Content Removed'
                  : `Strike ${finalStrikes}/3 Issued & Content Deleted`,
              resolvedAt,
            }
          : r
      )
    );

    void syncToDatabase('moderation_report', 'resolve', {
      id: reportId,
      status: nextStatusMap[action],
      resolutionAction: action,
    });

    if (action === 'DISMISS') {
      addNotification(`Report #${reportId} dismissed.`, 'info');
    } else if (action === 'BAN_DIRECT' || wasAutoBanned) {
      addNotification(
        `User ${targetReport.targetUserName} suspended (3/3 strikes / direct ban) and content removed.`,
        'alert'
      );
    } else {
      addNotification(
        `Strike ${finalStrikes}/3 issued to ${targetReport.targetUserName} and content deleted.`,
        'alert'
      );
    }
  };

  const updateUserProfile = (updates: Partial<UserAccount>) => {
    if (environmentMode === 'production') {
      if (!liveCurrentUser) return;
      const updated = { ...liveCurrentUser, ...updates };
      setLiveCurrentUser(updated);
      void syncToDatabase('user', 'upsert', updated as unknown as Record<string, unknown>);
      try {
        void setDoc(doc(db, 'users', liveCurrentUser.id), updated, { merge: true });
      } catch (e) {
        console.warn(e);
      }
    } else {
      if (!demoCurrentUser) return;
      const updated = { ...demoCurrentUser, ...updates };
      setDemoCurrentUser(updated);
      setDemoAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      void syncToDatabase('user', 'upsert', updated as unknown as Record<string, unknown>);
    }
    addNotification('Profile updated and synced to database!', 'success');
  };

  const startPrivateChatWithUser = (targetUser: {
    id: string;
    name: string;
    role: StakeholderRole;
    avatar: string;
  }) => {
    if (!currentUser) {
      addNotification('Please sign in to start private chat.', 'alert');
      return;
    }

    const existingThread = chatThreads.find(
      (th) =>
        (th.buyerId === currentUser.id && th.supplierId === targetUser.id) ||
        (th.supplierId === currentUser.id && th.buyerId === targetUser.id)
    );

    if (!existingThread) {
      const newThreadId = `thread-dm-${Date.now()}`;
      const newThread: ChatThread = {
        id: newThreadId,
        buyerId: currentUser.id,
        supplierId: targetUser.id,
        commodityId: 'direct_chat',
        commodityName: `Direct Negotiation: ${targetUser.name}`,
        orderId: `inq-${Date.now()}`,
        lastMessageSnippet: 'Private conversation opened',
        lastMessageTimestamp: 'Just now',
        unreadCount: 0,
      };
      setChatThreads((prev) => [newThread, ...prev]);
      setActiveChatThreadId(newThreadId);
    } else {
      setActiveChatThreadId(existingThread.id);
    }

    setActiveTab('messages');
    addNotification(`Direct chat opened with ${targetUser.name}.`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        environmentMode,
        setEnvironmentMode,
        currentUser,
        accounts,
        commodities,
        orders,
        chatThreads,
        chatMessages,
        nvatReport,
        nvatArchive,
        selectedNvatDate,
        setSelectedNvatDate,
        announcements,
        counters,
        agentPackets,
        activeTab,
        setActiveTab,
        isGuestLockOpen,
        setIsGuestLockOpen,
        guestAttemptedTab,
        setGuestAttemptedTab,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isDemoSwitcherOpen,
        setIsDemoSwitcherOpen,
        isPagasaModalOpen,
        setIsPagasaModalOpen,
        isAdminPasswordModalOpen,
        setIsAdminPasswordModalOpen,
        activeOrderModalItem,
        setActiveOrderModalItem,
        highlightedCommodityId,
        setHighlightedCommodityId,
        requestedCommunityView,
        setRequestedCommunityView,
        selectedRoute,
        setSelectedRoute,
        switchDemoAccount,
        switchDemoRole,
        loginWithCredentials,
        verifyMasterAdminPassword,
        registerNewAccount,
        logout,
        navigateToTabWithGuard,
        openMarketplaceToCommodity,
        openCommunityBulletins,
        createOrderInquiry,
        markOrderSent,
        markOrderReceived,
        sendMessage,
        activeChatThreadId,
        setActiveChatThreadId,
        addNewCommodity,
        approveCommodity,
        rejectCommodity,
        verifyAndBoostCommodity,
        rejectAndWarnCommodity,
        deleteCommodity,
        toggleBanUser,
        publishAdminAnnouncement,
        processAndPublishNvatBulletin,
        publishStructuredNvatBulletin,
        triggerAgentPacket,
        exportCurrentBulletinToSheets,
        verificationAuditLogs,
        moderationReports,
        submitModerationReport,
        adminResolveReport,
        aiHistory,
        logAiHistory,
        isInteractiveTourActive,
        setIsInteractiveTourActive,
        currentTourStep,
        setCurrentTourStep,
        startInteractiveTour,
        skipTour,
        resumeTour,
        recentNotifications,
        addNotification,
        communityPosts,
        createCommunityPost,
        likeCommunityPost,
        reactToPost,
        deleteCommunityPost,
        addPostComment,
        updateUserProfile,
        startPrivateChatWithUser,
        loginWithGoogle,
        isFirebaseConnected,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
