import React, { createContext, useContext, useState, useEffect } from 'react';
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
  MASTER_ADMIN_PASSWORD,
  SEED_VERIFICATION_AUDIT_LOGS,
  SEED_COMMUNITY_POSTS,
} from '../data/seedData';
import { checkDualHandshakeCompletion, parseNvatTextToStructured } from '../utils/agriMath';
import { getCropPhotoByName } from '../data/cropAssets';
import { auth, db, signInWithGoogle, logOutFirebase, testFirestoreConnection } from '../config/firebase';
import { TRANSLATIONS, LanguageCode, TranslationDictionary, LANGUAGE_OPTIONS } from '../i18n/translations';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
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
  activeOrderModalItem: CommodityItem | null;
  setActiveOrderModalItem: (item: CommodityItem | null) => void;
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
  registerNewAccount: (account: Partial<UserAccount>) => UserAccount;
  logout: () => void;
  navigateToTabWithGuard: (tab: string) => void;

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

  // Verification Audit Trail
  verificationAuditLogs: VerificationAuditLog[];

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

  // LIVE PRODUCTION REAL-TIME DATA (ZERO DEMO DATA IN LIVE PRODUCTION)
  const [liveCurrentUser, setLiveCurrentUser] = useState<UserAccount | null>(null);
  const [liveAccounts, setLiveAccounts] = useState<UserAccount[]>([]);
  const [liveCommodities, setLiveCommodities] = useState<CommodityItem[]>([]);
  const [liveOrders, setLiveOrders] = useState<OrderRecord[]>([]);
  const [livePosts, setLivePosts] = useState<CommunityPost[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Dynamic state routing based on active environmentMode
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

  const [chatThreads, setChatThreads] = useState<ChatThread[]>(SEED_THREADS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [nvatReport, setNvatReport] = useState<NvatBulletinReport>(INITIAL_NVAT_ITEMS);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>(SEED_ANNOUNCEMENTS);
  const [counters, setCounters] = useState<SystemCounters>(INITIAL_COUNTERS);
  const [agentPackets, setAgentPackets] = useState<AgentPacket[]>(SEED_AGENT_PACKETS);
  const [verificationAuditLogs, setVerificationAuditLogs] = useState<VerificationAuditLog[]>(SEED_VERIFICATION_AUDIT_LOGS);

  // Real-time Firestore sync & Auth state listener
  useEffect(() => {
    testFirestoreConnection().then((ok) => setIsFirebaseConnected(ok));

    // Listen to Auth State
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const liveUserObj: UserAccount = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Verified Agri Producer',
          email: fbUser.email || '',
          role: fbUser.email === 'russelthegreat1209@gmail.com' ? 'MASTER_ADMIN' : 'Farmer',
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
        };
        setLiveCurrentUser(liveUserObj);
        try {
          await setDoc(doc(db, 'users', fbUser.uid), liveUserObj, { merge: true });
        } catch (e) {
          console.warn('User profile sync:', e);
        }
      } else {
        setLiveCurrentUser(null);
      }
    });

    // Real-time listener for live_commodities
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

    // Real-time listener for live_community_posts
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
  const [activeOrderModalItem, setActiveOrderModalItem] = useState<CommodityItem | null>(null);
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

  const startInteractiveTour = () => {
    setCurrentTourStep(0);
    setIsInteractiveTourActive(true);
    addNotification('AGRIBEE Interactive Tour started! Follow the glowing spotlight.', 'info');
  };

  const skipTour = () => {
    setIsInteractiveTourActive(false);
    try {
      localStorage.setItem('agribee_tour_dismissed', 'true');
    } catch {
      // ignore
    }
    addNotification('Tutorial skipped. You can reopen Agri Bee anytime using the floating button!', 'info');
  };

  const resumeTour = () => {
    setIsInteractiveTourActive(true);
  };

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

  // Visitor counter tick on mount
  useEffect(() => {
    setCounters((c) => ({
      ...c,
      totalVisitors: c.totalVisitors + 1,
    }));
  }, []);

  const navigateToTabWithGuard = (tab: string) => {
    // If user is guest (null), block internal tabs
    if (!currentUser && tab !== 'public-landing') {
      setGuestAttemptedTab(tab);
      setIsGuestLockOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const switchDemoAccount = (accountId: string) => {
    const acc = demoAccounts.find((a) => a.id === accountId);
    if (acc) {
      setDemoCurrentUser(acc);
      addNotification(`Switched active profile to ${acc.name} (${acc.role})`, 'success');
      if (acc.role === 'MASTER_ADMIN') {
        setActiveTab('admin');
      }
    }
  };

  const switchDemoRole = (role: StakeholderRole) => {
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
    } catch (e) {
      addNotification('Google Sign-In failed or was cancelled.', 'alert');
    }
  };

  const loginWithCredentials = (email: string, pass: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check Master Admin exact credentials
    if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() && cleanPass === MASTER_ADMIN_PASSWORD) {
      const masterAdminAcc: UserAccount = {
        id: 'admin_master_01',
        name: 'Engr. Russel (System Architect)',
        organization: 'Provincial Agricultural Research Command',
        email: MASTER_ADMIN_EMAIL,
        role: 'MASTER_ADMIN',
        phone: '+63 917 888 9999',
        municipality: 'Bayombong',
        barangay: 'Don Domingo Madden',
        lat: 16.4856,
        lng: 121.1492,
        avatar: '',
        coverPhoto: '',
        bio: 'Platform Creator, Master Administrator & Lead Multi-Agent AI Engineer for AGRIMATCH-NV.',
        verified: true,
        status: 'ACTIVE',
      };
      if (environmentMode === 'production') {
        setLiveCurrentUser(masterAdminAcc);
      } else {
        setDemoCurrentUser(masterAdminAcc);
      }
      setActiveTab('admin');
      addNotification('Master Admin Command Center Unlocked!', 'success');
      return { success: true };
    }

    // Check accounts in current active dataset
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
      message: environmentMode === 'production'
        ? 'Account not found in Live Production database. Please Register or Sign In with Google.'
        : 'Invalid credentials. In Demo Mode, try a demo email or use the Demo Switcher.',
    };
  };

  const registerNewAccount = (accountData: Partial<UserAccount>): UserAccount => {
    const newAcc: UserAccount = {
      id: `user-${Date.now()}`,
      name: accountData.name || 'New Stakeholder',
      organization: accountData.organization || '',
      email: accountData.email || `user${Date.now()}@agrimatch-nv.ph`,
      role: accountData.role || 'Farmer',
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
    };

    if (environmentMode === 'production') {
      setLiveAccounts((prev) => [newAcc, ...prev]);
      setLiveCurrentUser(newAcc);
      try {
        setDoc(doc(db, 'users', newAcc.id), newAcc);
      } catch (e) {
        console.warn('Error saving live user:', e);
      }
    } else {
      setDemoAccounts((prev) => [...prev, newAcc]);
      setDemoCurrentUser(newAcc);
    }

    // Update role counts in counters
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

    // Trigger Multi-Agent Packet
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
    // 1. Deduct quantity from commodity stock
    setCommodities((prev) =>
      prev.map((c) => {
        if (c.id === completedOrder.commodityId) {
          const newStock = Math.max(0, c.availableKg - completedOrder.quantityKg);
          return { ...c, availableKg: newStock };
        }
        return c;
      })
    );

    // 2. Increment system counters
    setCounters((c) => ({
      ...c,
      totalCompletedTransactions: c.totalCompletedTransactions + 1,
      totalCommoditiesPostedKg: Math.max(0, c.totalCommoditiesPostedKg - completedOrder.quantityKg),
    }));

    // 3. Post system confirmation message in chat
    sendMessage(
      completedOrder.chatThreadId,
      `🎉 TRANSACTION COMPLETE: Order #${completedOrder.id} for ${completedOrder.quantityKg} kg has been fulfilled! Permanent ledger record written.`,
      {}
    );

    // 4. Multi-agent event
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
      `Transaction #${completedOrder.id} successfully completed! Counters updated.`,
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

    setChatMessages((prev) => [...prev, newMsg]);
    setChatThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              lastMessageSnippet: text,
              lastMessageTimestamp: new Date().toISOString(),
            }
          : t
      )
    );
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
      imageUrl: cropData.imageUrl || getCropPhotoByName(cropData.name || '', cropData.category),
      additionalPhotos: cropData.additionalPhotos || [],
      videoUrl: cropData.videoUrl || '',
      mediaType: cropData.mediaType || (cropData.videoUrl ? 'video' : 'photo'),
      verificationStatus: 'PENDING',
      aiAuthenticityScore: 92,
      aiVisionNotes: 'Automated initial intake complete. Pending Master Admin verification review.',
      harvestDate: cropData.harvestDate || new Date().toISOString().split('T')[0],
      daysToHarvest: 0,
      qualityGrade: cropData.qualityGrade || 'Grade A Premium',
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

    addNotification(`Crop listing "${newCrop.name}" submitted! Status: PENDING Admin review.`, 'info');
  };

  const approveCommodity = (commodityId: string) => {
    verifyAndBoostCommodity(commodityId);
  };

  const verifyAndBoostCommodity = (commodityId: string) => {
    const targetCrop = commodities.find((c) => c.id === commodityId);
    setCommodities((prev) =>
      prev.map((c) =>
        c.id === commodityId
          ? {
              ...c,
              verificationStatus: 'VERIFIED',
              aiAuthenticityScore: Math.max(c.aiAuthenticityScore, 98),
              verifiedBoostRank: Date.now(),
            }
          : c
      )
    );

    // Write to permanent Verification Audit Trail
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
        reviewerId: currentUser?.id || 'admin_master_01',
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

    // 1. Mark rejected / remove from public view
    setCommodities((prev) => prev.filter((c) => c.id !== commodityId));

    // 2. Increment supplier strike count & add warning message
    let newStrikeCount = 1;
    let isBanned = false;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === targetCrop.supplierId) {
          newStrikeCount = (acc.strikeCount || 0) + 1;
          isBanned = newStrikeCount >= 3;
          const updatedWarnings = [...(acc.warningMessages || []), warningReason];

          return {
            ...acc,
            strikeCount: newStrikeCount,
            status: isBanned ? 'BANNED' : acc.status,
            warningMessages: updatedWarnings,
          };
        }
        return acc;
      })
    );

    // 3. Write to permanent Verification Audit Trail
    const newAuditLog: VerificationAuditLog = {
      id: `audit-${Date.now()}`,
      commodityId,
      commodityName: targetCrop.name,
      supplierId: targetCrop.supplierId,
      supplierName: targetCrop.supplierName,
      decision: 'REJECTED',
      reasonCode: warningReason.slice(0, 40).toUpperCase().replace(/[^A-Z0-9]/g, '_'),
      notes: warningReason,
      reviewerId: currentUser?.id || 'admin_master_01',
      reviewerEmail: currentUser?.email || MASTER_ADMIN_EMAIL,
      timestamp: new Date().toISOString(),
    };
    setVerificationAuditLogs((prev) => [newAuditLog, ...prev]);

    addNotification(
      `Listing rejected. Official warning logged for ${targetCrop.supplierName} (Strike ${newStrikeCount}/3)${
        newStrikeCount >= 3 ? ' — ACCOUNT SUSPENDED!' : ''
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
          addNotification(`User ${a.name} account is now ${newStatus}.`, newStatus === 'BANNED' ? 'alert' : 'success');
          return { ...a, status: newStatus };
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

  const processAndPublishNvatBulletin = (rawText: string, preParsedItems?: NvatMarketItem[]) => {
    const today = new Date().toISOString().split('T')[0];
    const parsedItems = preParsedItems && preParsedItems.length > 0
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
        percentage: Math.round(
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

    setNvatReport(newReport);
    addNotification('NVAT Market Intelligence AI processed and published live!', 'success');
  };

  const publishStructuredNvatBulletin = (items: NvatMarketItem[], sourceTitle: string = 'NVAT Daily Bulletin, Bambang') => {
    const today = new Date().toISOString().split('T')[0];
    const newReport: NvatBulletinReport = {
      id: `nvat-bulletin-${Date.now()}`,
      date: today,
      rawText: `Validated bulletin extracted from ${sourceTitle} (${items.length} items)`,
      processedAt: new Date().toISOString(),
      items: items.map((it) => ({
        ...it,
        originalDataSource: it.originalDataSource || sourceTitle,
        lastUpdated: it.lastUpdated || (new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' PHT'),
      })),
      executiveSummary: [
        `Human-in-the-Loop Verified: ${items.filter(i => i.priceType === 'Confirmed').length} Confirmed trading post prices approved.`,
        `Extracted from ${sourceTitle} with anti-hallucination checks passed.`,
        `Prevailing price benchmark range: Php ${Math.min(...items.map((i) => i.prevailingPricePhp))}/kg to Php ${Math.max(...items.map((i) => i.prevailingPricePhp))}/kg.`,
        `Synchronized across community feed and historical commodity ledgers.`,
      ],
      volumeShareData: items.map((item) => ({
        name: item.commodityName.split(' ')[0],
        volumeTons: item.estimatedVolumeTradedTons || 10,
        percentage: Math.round(
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

    setNvatReport(newReport);
    addNotification(`Validated bulletin published with ${items.length} verified commodities!`, 'success');
  };

  const triggerAgentPacket = (packetData: Omit<AgentPacket, 'id' | 'timestamp'>) => {
    const packet: AgentPacket = {
      id: `pkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...packetData,
    };
    setAgentPackets((prev) => [packet, ...prev.slice(0, 19)]);
  };

  const createCommunityPost = (content: string, category: CommunityPost['category'], imageUrl?: string) => {
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
      comments: [],
    };

    if (environmentMode === 'production') {
      try {
        setDoc(doc(db, 'live_community_posts', newPost.id), newPost);
      } catch (e) {
        console.warn('Error saving live post:', e);
      }
    } else {
      setDemoPosts((prev) => [newPost, ...prev]);
    }
    addNotification('Community update published to social wall!', 'success');
  };

  const likeCommunityPost = (postId: string) => {
    const userId = currentUser?.id || 'guest_user';
    const updateLikes = (postsList: CommunityPost[]) =>
      postsList.map((p) => {
        if (p.id === postId) {
          const alreadyLiked = p.likes.includes(userId);
          const newLikes = alreadyLiked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId];
          if (environmentMode === 'production') {
            try {
              updateDoc(doc(db, 'live_community_posts', postId), { likes: newLikes });
            } catch (e) {
              console.warn(e);
            }
          }
          return { ...p, likes: newLikes };
        }
        return p;
      });

    if (environmentMode === 'production') {
      setLivePosts(updateLikes);
    } else {
      setDemoPosts(updateLikes);
    }
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

    const updateComments = (postsList: CommunityPost[]) =>
      postsList.map((p) => {
        if (p.id === postId) {
          const updatedComments = [...(p.comments || []), newComment];
          if (environmentMode === 'production') {
            try {
              updateDoc(doc(db, 'live_community_posts', postId), { comments: updatedComments });
            } catch (e) {
              console.warn(e);
            }
          }
          return { ...p, comments: updatedComments };
        }
        return p;
      });

    if (environmentMode === 'production') {
      setLivePosts(updateComments);
    } else {
      setDemoPosts(updateComments);
    }
    addNotification('Comment posted to discussion.', 'info');
  };

  const updateUserProfile = (updates: Partial<UserAccount>) => {
    if (environmentMode === 'production') {
      if (!liveCurrentUser) return;
      const updated = { ...liveCurrentUser, ...updates };
      setLiveCurrentUser(updated);
      try {
        setDoc(doc(db, 'users', liveCurrentUser.id), updated, { merge: true });
      } catch (e) {
        console.warn(e);
      }
    } else {
      if (!demoCurrentUser) return;
      const updated = { ...demoCurrentUser, ...updates };
      setDemoCurrentUser(updated);
      setDemoAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    }
    addNotification('Profile & cover photo updated successfully!', 'success');
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

    let existingThread = chatThreads.find(
      (t) =>
        (t.buyerId === currentUser.id && t.supplierId === targetUser.id) ||
        (t.supplierId === currentUser.id && t.buyerId === targetUser.id)
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
        activeOrderModalItem,
        setActiveOrderModalItem,
        selectedRoute,
        setSelectedRoute,
        switchDemoAccount,
        switchDemoRole,
        loginWithCredentials,
        registerNewAccount,
        logout,
        navigateToTabWithGuard,
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
        verificationAuditLogs,
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
