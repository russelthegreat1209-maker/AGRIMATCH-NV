export type StakeholderRole = 
  | 'Farmer'
  | 'Supplier'
  | 'Buyer'
  | 'Cooperative'
  | 'Government'
  | 'MASTER_ADMIN';

export type EnvironmentMode = 'demo' | 'production';

export interface UserAccount {
  id: string;
  name: string;
  organization?: string;
  email: string;
  role: StakeholderRole;
  phone: string;
  municipality: string;
  barangay: string;
  lat: number;
  lng: number;
  avatar: string;
  bio: string;
  verified: boolean;
  status: 'ACTIVE' | 'BANNED';
  farmOrWarehouseName?: string;
  deliveryCapacityKg?: number;
  rating?: number;
  strikeCount?: number; // 0 to 3 strikes for unverified/fake media violations
  completedTradesCount?: number;
  warningMessages?: string[];
  coverPhoto?: string; // Customizable cover photo banner
}

export type ReactionType = 'heart' | 'wow' | 'sad' | 'care' | 'angry';

export type PostReactions = Partial<Record<ReactionType, string[]>>;

export type AgentDomain = 'Farmer' | 'Buyer' | 'Supplier' | 'Market' | 'Admin';

export interface BuyerNeedCriteria {
  neededSupply: string;
  neededDate: string;
  destinationMunicipality: string;
  preferredGrade: 'ANY' | 'Grade A Premium' | 'Grade B Commercial' | 'Standard Fresh';
  targetKg: number;
}

export interface ModerationReport {
  id: string;
  targetType: 'POST' | 'COMMENT' | 'COMMODITY' | 'ACCOUNT';
  targetId: string;
  targetUserId: string;
  targetUserName: string;
  targetPreview: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED_STRIKE' | 'RESOLVED_BAN' | 'DISMISSED';
  resolutionAction?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AiHistoryEntry {
  id: string;
  userId: string;
  userRole: StakeholderRole;
  agentType: string;
  prompt: string;
  responseSummary: string;
  metadata?: Record<string, unknown>;
  poweredByGemini: boolean;
  createdAt: string;
}

export interface CommunityPostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: StakeholderRole;
  authorAvatar: string;
  text: string;
  timestamp: string;
  likes: string[];
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: StakeholderRole;
  authorAvatar: string;
  authorMunicipality: string;
  category: 'Update' | 'Concern' | 'Harvest News' | 'Price Advisory' | 'Question';
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: string[]; // List of user IDs who liked
  reactions?: PostReactions;
  comments: CommunityPostComment[];
}

export type CropCategory = 
  | 'Highland Vegetables'
  | 'Lowland Vegetables'
  | 'Citrus & Fruits'
  | 'Root Crops & Tubers'
  | 'Grains & Cereals'
  | 'Spices & Herbs';

export interface CommodityItem {
  id: string;
  name: string;
  category: CropCategory;
  supplierId: string;
  supplierName: string;
  supplierRole: 'Farmer' | 'Supplier' | 'Cooperative';
  municipality: string;
  barangay: string;
  lat: number;
  lng: number;
  availableKg: number;
  pricePerKg: number;
  farmgatePricePhp?: number; // Negotiable or estimated farmgate benchmark
  minOrderKg: number;
  contactPhone?: string;
  imageUrl: string;
  additionalPhotos?: string[];
  videoUrl?: string;
  mediaType?: 'photo' | 'video' | 'mixed';
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  rejectionReason?: string;
  aiAuthenticityScore: number; // 0-100
  aiVisionNotes?: string;
  harvestDate: string; // YYYY-MM-DD
  daysToHarvest?: number;
  qualityGrade: 'Grade A Premium' | 'Grade B Commercial' | 'Standard Fresh';
  aiSuggestedGrade?: 'Grade A Premium' | 'Grade B Commercial' | 'Standard Fresh';
  manualGradeOverride?: boolean;
  organicCertified?: boolean;
  notes?: string;
  postedAt: string;
  verifiedBoostRank?: number; // Verified posts boosted to top
}

export interface VerificationAuditLog {
  id: string;
  commodityId: string;
  commodityName: string;
  supplierId: string;
  supplierName: string;
  decision: 'APPROVED' | 'REJECTED';
  reasonCode: string;
  notes?: string;
  reviewerId: string;
  reviewerEmail: string;
  timestamp: string;
}

export type OrderStatus = 
  | 'INQUIRY_SUBMITTED'
  | 'NEGOTIATION_IN_PROGRESS'
  | 'ORDER_DISPATCHED'
  | 'COMPLETED'
  | 'CANCELLED';

export type DeliveryMode = 
  | 'Buyer Farm Pickup'
  | 'Supplier Direct Delivery'
  | 'NVAT Bambang Drop-off Bay'
  | 'Cooperative Shared Hauling';

export type PaymentOption = 
  | 'Cash on Delivery (COD)'
  | 'GCash / Maya Instant Transfer'
  | 'LandBank / Bank Transfer'
  | 'Cooperative Escrow Account';

export interface OrderRecord {
  id: string;
  commodityId: string;
  commodityName: string;
  buyerId: string;
  buyerName: string;
  supplierId: string;
  supplierName: string;
  quantityKg: number;
  listedPricePerKg: number;
  proposedPricePerKg: number;
  totalAmountPhp: number;
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  deliveryLocation: string;
  paymentOption: PaymentOption;
  createdAt: string;
  updatedAt: string;
  supplierConfirmedSent: boolean;
  supplierConfirmedSentAt?: string;
  buyerConfirmedReceived: boolean;
  buyerConfirmedReceivedAt?: string;
  chatThreadId: string;
}

export interface CommunityChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: StakeholderRole;
  senderMunicipality?: string;
  text: string;
  timestamp: string;
  isNvtBulletin?: boolean;
  isOfficialAnnouncement?: boolean;
  mediaUrl?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: StakeholderRole;
  text: string;
  timestamp: string;
  isOrderCard?: boolean;
  orderId?: string;
  locationPin?: { lat: number; lng: number; label: string };
  imageUrl?: string;
}

export interface ChatThread {
  id: string;
  buyerId: string;
  supplierId: string;
  commodityId: string;
  commodityName: string;
  orderId: string;
  lastMessageSnippet: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}

export interface NvatMarketItem {
  id: string;
  commodityName: string;
  category: CropCategory;
  minPricePhp: number;
  maxPricePhp: number;
  prevailingPricePhp: number;
  previousPricePhp: number;
  priceVariancePercent: number;
  estimatedVolumeTradedTons: number;
  marketTrendStatus: 'Surging' | 'Stable' | 'Declining';
  date: string;
  unitOfMeasure: string; // e.g. 'PHP / kg'
  priceType: 'Confirmed' | 'Estimated'; // Official trading post figures vs projected
  originalDataSource: string; // e.g. 'NVAT Daily Bulletin, Bambang'
  requiresReview?: boolean; // Anti-hallucination guardrail flag for ambiguous inputs
  lastUpdated?: string; // Timestamp
}

export interface NvatBulletinReport {
  id: string;
  date: string;
  rawText: string;
  processedAt: string;
  items: NvatMarketItem[];
  executiveSummary: string[];
  volumeShareData: { name: string; volumeTons: number; percentage: number }[];
  priceComparisonData: { name: string; prevailing: number; previous: number }[];
  historicalTrendData: { date: string; cabbage: number; tomato: number; onion: number; citrus: number }[];
  googleSheetUrl?: string;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'Price Advisory' | 'Weather Warning' | 'Subsidy Announcement' | 'NVAT Logistics Update';
  postedAt: string;
  author: string;
  pinned: boolean;
}

export interface MunicipalWeather {
  municipality: string;
  temperatureC: number;
  feelsLikeC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  uvIndex: number;
  rainfallMm: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Light Rain' | 'Heavy Rain';
  hourlyTemps: { time: string; tempC: number }[];
  uvSparkline: number[];
  humiditySparkline: number[];
  pagasaStationName?: string;
  pressureHpa?: number;
  synopticNotes?: string;
}

export interface AdvancedClimatePredictionWeek {
  weekNumber: number; // 1 to 8 (covers 1 to 2 months / 60 days)
  monthName: string;
  dateRange: string;
  municipality: string;
  barangay: string;
  rainfallProbabilityPercent: number;
  rainfallVolumeEstMm: number;
  tempRangeC: string;
  avgTempC: number;
  soilMoisturePercent: number;
  typhoonRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  microclimateTag: string;
  cropAdvisory: string;
  recommendedActions: string[];
}

export interface PredictiveWeatherWeek {
  weekNumber: number;
  dateRange: string;
  rainfallProbabilityPercent: number;
  tempRangeC: string;
  typhoonRisk: 'Low' | 'Moderate' | 'High';
  cropAdvisory: string;
  recommendedActions: string[];
}

export interface AgentPacket {
  id: string;
  fromAgent: 'Farmer Agent' | 'Buyer Agent' | 'Supplier Agent' | 'Market Agent' | 'Admin Agent';
  toAgent: 'Farmer Agent' | 'Buyer Agent' | 'Supplier Agent' | 'Market Agent' | 'Admin Agent';
  intent: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface SystemCounters {
  totalVisitors: number;
  currentlyLoggedIn: number;
  totalCompletedTransactions: number;
  totalCommoditiesPostedKg: number;
  totalActiveListingsCount: number;
  farmersCount: number;
  suppliersCount: number;
  buyersCount: number;
  cooperativesCount: number;
  govAdminCount: number;
}
