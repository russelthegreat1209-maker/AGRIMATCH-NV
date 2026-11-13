export type LanguageCode = 'en' | 'tl' | 'ilo' | 'gad';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  regionTag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', regionTag: 'Global' },
  { code: 'tl', label: 'Tagalog', nativeName: 'Tagalog / Filipino', regionTag: 'National' },
  { code: 'ilo', label: 'Ilocano', nativeName: 'Ilokano', regionTag: 'Region II / NV' },
  { code: 'gad', label: 'Gaddang', nativeName: 'Gaddang (Local)', regionTag: 'NV Heritage' },
];

export interface TranslationDictionary {
  // TopNav & Global Shell
  brandSubtitle: string;
  demoSandbox: string;
  liveProduction: string;
  goLive: string;
  goDemo: string;
  demoRole: string;
  publicPortal: string;
  ipoFramework: string;
  pagasaRadar: string;
  agriBee: string;
  accounts25: string;
  signInJoin: string;
  signOut: string;
  notificationsTitle: string;

  // BottomDock Navigation
  navDashboard: string;
  navGisMap: string;
  navMarketplace: string;
  navCommunity: string;
  navAiAgents: string;
  navIpoFramework: string;
  navTradeChat: string;
  navAdminHub: string;
  navProfile: string;

  // Dashboard Overview
  commandCenterBadge: string;
  welcomeBack: string;
  guestStakeholder: string;
  roleLabel: string;
  farmHubLabel: string;
  switchAccountBtn: string;
  kpiVolumeTraded: string;
  kpiActiveOrders: string;
  kpiMarketRevenue: string;
  kpiCompletedDeals: string;
  vsLastMonth: string;

  // Public Landing
  publicGatewayBadge: string;
  navOverview: string;
  navLiveIntel: string;
  navOffers: string;
  navVideos: string;
  navArchitects: string;
  launchDemo: string;
  enterLive: string;

  // Marketplace
  marketplaceTitle: string;
  postSupplyBtn: string;
  searchCropsPlaceholder: string;
  verifiedOnly: string;
  allCategories: string;

  // GIS Map
  gisTitle: string;
  municipalBoundaries: string;
  proximityFilter: string;

  // Community Wall
  communityWall: string;
  nvatBulletins: string;
  shareUpdateBtn: string;

  // User Profile
  changeCover: string;
  editProfile: string;
  switchProfile: string;
  myCropListings: string;
  tradeOrdersHistory: string;
  agronomicBio: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    brandSubtitle: 'Nueva Vizcaya Crop Hubs Intelligence',
    demoSandbox: 'DEMO SANDBOX',
    liveProduction: 'LIVE PRODUCTION',
    goLive: 'Go Live',
    goDemo: 'Go Demo',
    demoRole: 'Demo Role:',
    publicPortal: 'Public Portal',
    ipoFramework: 'IPO Framework',
    pagasaRadar: 'PAGASA Radar',
    agriBee: 'Agri Bee',
    accounts25: '25 Accounts',
    signInJoin: 'Sign In / Join',
    signOut: 'Sign Out',
    notificationsTitle: 'Real-Time Agricultural Telemetry',

    navDashboard: 'Dashboard',
    navGisMap: 'GIS Map',
    navMarketplace: 'Marketplace',
    navCommunity: 'Community',
    navAiAgents: 'AI Agents',
    navIpoFramework: 'IPO Framework',
    navTradeChat: 'Trade Chat',
    navAdminHub: 'Admin Hub',
    navProfile: 'Profile',

    commandCenterBadge: 'Nueva Vizcaya Stakeholder Command Center',
    welcomeBack: 'Welcome back',
    guestStakeholder: 'Guest Stakeholder',
    roleLabel: 'Role',
    farmHubLabel: 'Farm Hub',
    switchAccountBtn: 'Switch Stakeholder Account',
    kpiVolumeTraded: 'Total Volume Traded',
    kpiActiveOrders: 'Total Active Orders',
    kpiMarketRevenue: 'Market Revenue Value',
    kpiCompletedDeals: 'Verified Completed Deals',
    vsLastMonth: 'vs last month',

    publicGatewayBadge: 'PUBLIC GATEWAY',
    navOverview: 'Overview',
    navLiveIntel: 'Live Intelligence',
    navOffers: 'Stakeholder Value',
    navVideos: 'Video Showcase',
    navArchitects: 'Lead Architects',
    launchDemo: 'Launch Demo Mode',
    enterLive: 'Enter Live Platform',

    marketplaceTitle: 'Verified Nueva Vizcaya Agri-Marketplace',
    postSupplyBtn: 'Post Harvest Supply',
    searchCropsPlaceholder: 'Search crops, barangays, or municipalities...',
    verifiedOnly: 'Verified Only',
    allCategories: 'All Categories',

    gisTitle: 'Municipal GIS & Logistics Topology',
    municipalBoundaries: 'Municipal Boundaries',
    proximityFilter: 'Proximity Filter',

    communityWall: 'Community Wall',
    nvatBulletins: 'NVAT Bulletins',
    shareUpdateBtn: 'Share Post / Update',

    changeCover: 'Change Cover',
    editProfile: 'Edit Profile',
    switchProfile: 'Switch Account',
    myCropListings: 'My Crop Listings',
    tradeOrdersHistory: 'Trade Orders & Inquiries',
    agronomicBio: 'Agronomic Specialization & Overview',
  },
  tl: {
    brandSubtitle: 'Katalinuhan sa Ani ng Nueva Vizcaya',
    demoSandbox: 'DEMO SANDBOX',
    liveProduction: 'AKTIBONG SISTEMA',
    goLive: 'Pumunta sa Live',
    goDemo: 'Pumunta sa Demo',
    demoRole: 'Tungkulin:',
    publicPortal: 'Pampublikong Portal',
    ipoFramework: 'Balangkas IPO',
    pagasaRadar: 'Rada ng PAGASA',
    agriBee: 'Agri Bee',
    accounts25: '25 Akawnt',
    signInJoin: 'Mag-Sign In / Sumali',
    signOut: 'Mag-Sign Out',
    notificationsTitle: 'Real-Time na Telemetriya sa Agrikultura',

    navDashboard: 'Tanggapan',
    navGisMap: 'Mapa ng GIS',
    navMarketplace: 'Pamilihan',
    navCommunity: 'Komunidad',
    navAiAgents: 'Mga AI Agent',
    navIpoFramework: 'Balangkas IPO',
    navTradeChat: 'Usapang Kalakalan',
    navAdminHub: 'Admin Hub',
    navProfile: 'Aking Profile',

    commandCenterBadge: 'Sentro ng Pamamahala sa Nueva Vizcaya',
    welcomeBack: 'Maligayang pagbabalik',
    guestStakeholder: 'Bisitang Kalahok',
    roleLabel: 'Tungkulin',
    farmHubLabel: 'Sentro ng Sakahan',
    switchAccountBtn: 'Magpalit ng Akawnt',
    kpiVolumeTraded: 'Kabuuang Dami ng Kalakal',
    kpiActiveOrders: 'Mga Aktibong Order',
    kpiMarketRevenue: 'Kabuuang Halaga sa Merkado',
    kpiCompletedDeals: 'Mga Nakumpletong Transaksyon',
    vsLastMonth: 'kumpara nakaraang buwan',

    publicGatewayBadge: 'PAMPUBLIKONG DAAN',
    navOverview: 'Pangkalahatan',
    navLiveIntel: 'Aktibong Datos',
    navOffers: 'Mga Serbisyo',
    navVideos: 'Mga Video',
    navArchitects: 'Mga Tagapagtatag',
    launchDemo: 'Buksan ang Demo Mode',
    enterLive: 'Pumasok sa Live Platform',

    marketplaceTitle: 'Beripikadong Pamilihang Pang-Agrikultura ng NV',
    postSupplyBtn: 'Mag-post ng Ani',
    searchCropsPlaceholder: 'Maghanap ng pananim, barangay, o bayan...',
    verifiedOnly: 'Beripikado Lamang',
    allCategories: 'Lahat ng Kategorya',

    gisTitle: 'Mapang GIS at Rutang Pang-Logistika',
    municipalBoundaries: 'Hangganan ng mga Bayan',
    proximityFilter: 'Layo at Distansya',

    communityWall: 'Pader ng Komunidad',
    nvatBulletins: 'Presyo sa NVAT',
    shareUpdateBtn: 'Magbahagi ng Balita',

    changeCover: 'Palitan ang Cover',
    editProfile: 'I-edit ang Profile',
    switchProfile: 'Magpalit ng Akawnt',
    myCropListings: 'Aking mga Pananim',
    tradeOrdersHistory: 'Mga Order at Transaksyon',
    agronomicBio: 'Espesyalisasyon sa Sakahan at Bio',
  },
  ilo: {
    brandSubtitle: 'Kinasirib ti Agrikultura iti Nueva Vizcaya',
    demoSandbox: 'DEMO SANDBOX',
    liveProduction: 'AGDAMA NGA LIVE',
    goLive: 'Inka iti Live',
    goDemo: 'Inka iti Demo',
    demoRole: 'Akem (Demo):',
    publicPortal: 'Portal ti Publiko',
    ipoFramework: 'Balabala nga IPO',
    pagasaRadar: 'Radar ti PAGASA',
    agriBee: 'Agri Bee',
    accounts25: '25 a Cuenta',
    signInJoin: 'Sumrek / Makipagpaset',
    signOut: 'Rummuar',
    notificationsTitle: 'Real-Time a Damag iti Agrikultura',

    navDashboard: 'Tanggapan',
    navGisMap: 'Mapa ti GIS',
    navMarketplace: 'Paglakuan',
    navCommunity: 'Komunidad',
    navAiAgents: 'Dagiti AI Agent',
    navIpoFramework: 'Balabala IPO',
    navTradeChat: 'Pagsasaritaan',
    navAdminHub: 'Admin Hub',
    navProfile: 'Profilko',

    commandCenterBadge: 'Sentro ti Mannalon ken Negosiante iti NV',
    welcomeBack: 'Naragsak a panagsublim',
    guestStakeholder: 'Bisita a Mannalon',
    roleLabel: 'Akem',
    farmHubLabel: 'Lugar ti Talon',
    switchAccountBtn: 'Sukatan ti Cuenta',
    kpiVolumeTraded: 'Dagup ti Nailako (kg)',
    kpiActiveOrders: 'Dagiti Aktibo nga Order',
    kpiMarketRevenue: 'Dagup ti Balor iti Merkado',
    kpiCompletedDeals: 'Nalpas a Transaksion',
    vsLastMonth: 'no idilig idi napalabas',

    publicGatewayBadge: 'RUANGAN TI PUBLIKO',
    navOverview: 'Pakabuklan',
    navLiveIntel: 'Aktibo a Datos',
    navOffers: 'Dagiti Serbisio',
    navVideos: 'Dagiti Video',
    navArchitects: 'Dagiti Nangaramid',
    launchDemo: 'Luktan ti Demo Mode',
    enterLive: 'Sumrek iti Live Platform',

    marketplaceTitle: 'Beripikado a Paglakuan ti Apit iti Nueva Vizcaya',
    postSupplyBtn: 'I-post ti Apit',
    searchCropsPlaceholder: 'Agbiruk ti mula, barangay, wenno ili...',
    verifiedOnly: 'Beripikado Laeng',
    allCategories: 'Amin a Kategoria',

    gisTitle: 'Mapa ti GIS ken Dalan ti Karga',
    municipalBoundaries: 'Beddeng dagiti Ili',
    proximityFilter: 'Kaadayo (Distansia)',

    communityWall: 'Komunidad (Pader)',
    nvatBulletins: 'Presio iti NVAT',
    shareUpdateBtn: 'Ibingay ti Damag',

    changeCover: 'Sukatan ti Cover',
    editProfile: 'Urnosen ti Profil',
    switchProfile: 'Sukatan ti Cuenta',
    myCropListings: 'Dagiti Nailistak nga Apit',
    tradeOrdersHistory: 'Dagiti Order ken Transaksion',
    agronomicBio: 'Maipapan iti Talon ken Apit',
  },
  gad: {
    brandSubtitle: 'Katalinuan na Talunan ino Nueva Vizcaya',
    demoSandbox: 'DEMO SANDBOX',
    liveProduction: 'LIVE NGA SISTEMA',
    goLive: 'Angngay si Live',
    goDemo: 'Angngay si Demo',
    demoRole: 'Tungkulin:',
    publicPortal: 'Portal na Publiko',
    ipoFramework: 'Balangkas IPO',
    pagasaRadar: 'Radar na PAGASA',
    agriBee: 'Agri Bee',
    accounts25: '25 Cuenta',
    signInJoin: 'Sumallung / Sumali',
    signOut: 'Lumaon',
    notificationsTitle: 'Damag ino Agrikultura',

    navDashboard: 'Tanggapan',
    navGisMap: 'Mapa na GIS',
    navMarketplace: 'Paglakuan',
    navCommunity: 'Komunidad',
    navAiAgents: 'Mga AI Agent',
    navIpoFramework: 'Balangkas IPO',
    navTradeChat: 'Pakkikilala',
    navAdminHub: 'Admin Hub',
    navProfile: 'Profil Ko',

    commandCenterBadge: 'Sentro na Mannalon si Nueva Vizcaya',
    welcomeBack: 'Naimbag a panagsubli',
    guestStakeholder: 'Bisita',
    roleLabel: 'Tungkulin',
    farmHubLabel: 'Lugar na Talon',
    switchAccountBtn: 'Sukatan ino Cuenta',
    kpiVolumeTraded: 'Kabuuan na Nailako',
    kpiActiveOrders: 'Aktibo nga Order',
    kpiMarketRevenue: 'Balor si Merkado',
    kpiCompletedDeals: 'Nalpas nga Transaksion',
    vsLastMonth: 'kumpara nakaraan',

    publicGatewayBadge: 'Dalan na Publiko',
    navOverview: 'Pakabuklan',
    navLiveIntel: 'Aktibo a Datos',
    navOffers: 'Serbisyo',
    navVideos: 'Mga Video',
    navArchitects: 'Tagapagtatag',
    launchDemo: 'Buksan ino Demo Mode',
    enterLive: 'Sumallung si Live Platform',

    marketplaceTitle: 'Paglakuan na Apit ino Nueva Vizcaya',
    postSupplyBtn: 'I-post ino Apit',
    searchCropsPlaceholder: 'Maghanap na mula, barangay, o ili...',
    verifiedOnly: 'Beripikado Lamang',
    allCategories: 'Amin a Kategoria',

    gisTitle: 'Mapa na GIS ken Logistika',
    municipalBoundaries: 'Beddeng na Ili',
    proximityFilter: 'Distansya',

    communityWall: 'Komunidad',
    nvatBulletins: 'Presyo si NVAT',
    shareUpdateBtn: 'Ibingay ino Damag',

    changeCover: 'Sukatan ino Cover',
    editProfile: 'Urnosen ino Profil',
    switchProfile: 'Sukatan ino Cuenta',
    myCropListings: 'Mga Nailistang Apit',
    tradeOrdersHistory: 'Mga Order ken Transaksion',
    agronomicBio: 'Impormasyon na Talunan',
  },
};
