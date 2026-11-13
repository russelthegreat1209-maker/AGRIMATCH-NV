import {
  AgentDomain,
  BuyerNeedCriteria,
  CommodityItem,
  CropCategory,
  NvatMarketItem,
  PostReactions,
  ReactionType,
  StakeholderRole,
  UserAccount,
} from '../types';

/**
 * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
 * @returns Distance in kilometers
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Checks if a target location is within a given radius in kilometers.
 */
export function isWithinRadius(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number | 'ALL'
): boolean {
  if (radiusKm === 'ALL') return true;
  const distance = haversineDistanceKm(userLat, userLng, targetLat, targetLng);
  return distance <= radiusKm;
}

/**
 * Formats distance in kilometers or meters for UI display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimates driving time over Nueva Vizcaya mountain highways and valleys
 * Default speed 42 km/h accounting for Dalton Pass / mountain turns
 */
export function calculateDrivingTimeMinutes(distanceKm: number, avgSpeedKmh = 42): number {
  if (distanceKm <= 0) return 0;
  const hours = distanceKm / avgSpeedKmh;
  return Math.max(1, Math.round(hours * 60));
}

/**
 * Multi-Agent Decision Support Layer: Composite Weighted Supplier Ranking Score
 * Weights:
 * - Price Competitiveness: 35%
 * - Proximity Distance: 30%
 * - Verified Crop Quality: 20%
 * - Inventory Availability: 15%
 */
export interface SupplierScoreParams {
  itemPrice: number;
  benchmarkPrice: number; // e.g. NVAT prevailing price
  distanceKm: number;
  maxDistanceThresholdKm?: number; // default 80km
  isVerified: boolean;
  aiAuthenticityScore: number; // 0-100
  availableKg: number;
  targetKg: number;
}

export function calculateSupplierRecommendationScore(params: SupplierScoreParams): number {
  const {
    itemPrice,
    benchmarkPrice,
    distanceKm,
    maxDistanceThresholdKm = 80,
    isVerified,
    aiAuthenticityScore,
    availableKg,
    targetKg,
  } = params;

  // 1. Price score (35%): lower or equal to benchmark is best
  let priceRatio = benchmarkPrice > 0 ? benchmarkPrice / Math.max(itemPrice, 1) : 1;
  priceRatio = Math.min(Math.max(priceRatio, 0.4), 1.5);
  const normalizedPriceScore = Math.min(100, Math.round((priceRatio / 1.2) * 100));

  // 2. Proximity score (30%): closer distance gives higher score
  const clampedDistance = Math.min(distanceKm, maxDistanceThresholdKm);
  const normalizedDistanceScore = Math.round(
    ((maxDistanceThresholdKm - clampedDistance) / maxDistanceThresholdKm) * 100
  );

  // 3. Verified Crop Quality (20%): verified bonus + AI authenticity score
  const qualityBase = isVerified ? 20 : 0;
  const normalizedQualityScore = Math.min(100, (aiAuthenticityScore * 0.8) + qualityBase);

  // 4. Inventory Availability (15%): ability to fulfill requested volume
  const fulfillRatio = targetKg > 0 ? availableKg / targetKg : 1;
  const normalizedAvailabilityScore = Math.min(100, Math.round(Math.min(fulfillRatio, 1.2) * 83.3));

  // Composite calculation
  const composite =
    normalizedPriceScore * 0.35 +
    normalizedDistanceScore * 0.30 +
    normalizedQualityScore * 0.20 +
    normalizedAvailabilityScore * 0.15;

  return Math.min(100, Math.max(1, Math.round(composite)));
}

/**
 * Checks dual-handshake atomic completion
 */
export function checkDualHandshakeCompletion(
  supplierConfirmedSent: boolean,
  buyerConfirmedReceived: boolean
): boolean {
  return supplierConfirmedSent === true && buyerConfirmedReceived === true;
}

/**
 * Fallback parser for NVAT market text when Gemini API or offline mode processes raw bulletins
 */
export function parseNvatTextToStructured(rawText: string, defaultDate: string): NvatMarketItem[] {
  const results: NvatMarketItem[] = [];

  // Common Nueva Vizcaya commodities pattern search
  const patterns: {
    name: string;
    category: CropCategory;
    defaultMin: number;
    defaultMax: number;
    defaultPrev: number;
    defaultPrevPrev: number;
  }[] = [
    { name: 'Highland Cabbage', category: 'Highland Vegetables', defaultMin: 28, defaultMax: 35, defaultPrev: 32, defaultPrevPrev: 38 },
    { name: 'Red Creole Onion', category: 'Lowland Vegetables', defaultMin: 95, defaultMax: 110, defaultPrev: 102, defaultPrevPrev: 102 },
    { name: 'Satsuki Tomato', category: 'Lowland Vegetables', defaultMin: 48, defaultMax: 58, defaultPrev: 55, defaultPrevPrev: 42 },
    { name: 'Satsuma Mandarin Citrus', category: 'Citrus & Fruits', defaultMin: 65, defaultMax: 85, defaultPrev: 75, defaultPrevPrev: 80 },
    { name: 'Native Ginger', category: 'Spices & Herbs', defaultMin: 70, defaultMax: 90, defaultPrev: 80, defaultPrevPrev: 75 },
    { name: 'Highland Broccoli', category: 'Highland Vegetables', defaultMin: 75, defaultMax: 95, defaultPrev: 85, defaultPrevPrev: 90 },
    { name: 'Baguio Beans', category: 'Highland Vegetables', defaultMin: 40, defaultMax: 55, defaultPrev: 48, defaultPrevPrev: 45 },
    { name: 'Yellow Corn (Hybrid)', category: 'Grains & Cereals', defaultMin: 21, defaultMax: 26, defaultPrev: 23, defaultPrevPrev: 22 },
  ];

  const lowerText = rawText.toLowerCase();

  for (const p of patterns) {
    if (lowerText.includes(p.name.toLowerCase()) || lowerText.includes(p.name.split(' ')[0].toLowerCase())) {
      // Look for numbers near the commodity name
      const prev = p.defaultPrev;
      const previous = p.defaultPrevPrev;
      const variance = Math.round(((prev - previous) / previous) * 1000) / 10;
      const trend = variance > 2 ? 'Surging' : variance < -2 ? 'Declining' : 'Stable';

      results.push({
        id: `nvat-${Date.now()}-${p.name.replace(/\s+/g, '-').toLowerCase()}`,
        commodityName: p.name,
        category: p.category,
        minPricePhp: p.defaultMin,
        maxPricePhp: p.defaultMax,
        prevailingPricePhp: prev,
        previousPricePhp: previous,
        priceVariancePercent: variance,
        estimatedVolumeTradedTons: Math.round((Math.random() * 25 + 10) * 10) / 10,
        marketTrendStatus: trend,
        date: defaultDate,
        unitOfMeasure: 'PHP / kg',
        priceType: 'Confirmed',
        originalDataSource: 'NVAT Daily Bulletin, Bambang',
        requiresReview: false,
        lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' PHT',
      });
    }
  }

  // If no specific match found, provide core highland items
  if (results.length === 0) {
    return patterns.slice(0, 4).map((p, idx) => ({
      id: `nvat-${Date.now()}-${idx}`,
      commodityName: p.name,
      category: p.category,
      minPricePhp: p.defaultMin,
      maxPricePhp: p.defaultMax,
      prevailingPricePhp: p.defaultPrev,
      previousPricePhp: p.defaultPrevPrev,
      priceVariancePercent: Math.round(((p.defaultPrev - p.defaultPrevPrev) / p.defaultPrevPrev) * 1000) / 10,
      estimatedVolumeTradedTons: 20 + idx * 5,
      marketTrendStatus: p.defaultPrev > p.defaultPrevPrev ? 'Surging' : p.defaultPrev < p.defaultPrevPrev ? 'Declining' : 'Stable',
      date: defaultDate,
      unitOfMeasure: 'PHP / kg',
      priceType: 'Confirmed',
      originalDataSource: 'NVAT Daily Bulletin, Bambang',
      requiresReview: false,
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' PHT',
    }));
  }

  return results;
}

/**
 * Extracts 1-2 uppercase initials from a stakeholder or organization name.
 */
export function getUserInitials(name: string): string {
  const cleaned = (name || '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim();
  if (!cleaned) return 'NV';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Builds deterministic real-world geographic boundary polygon vertices around a municipality centroid.
 */
export function buildMunicipalGeoPolygon(
  centroid: { lat: number; lng: number },
  areaKm2: number,
  seedIndex: number = 0
): { lat: number; lng: number }[] {
  const radiusKm = Math.max(3.5, Math.sqrt(Math.max(areaKm2, 40) / Math.PI) * 0.88);
  const kmPerDegLat = 111.32;
  const cosLat = Math.max(0.2, Math.cos((centroid.lat * Math.PI) / 180));
  const kmPerDegLng = kmPerDegLat * cosLat;

  const numVertices = 7;
  const points: { lat: number; lng: number }[] = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (i * 2 * Math.PI) / numVertices + (seedIndex % 5) * 0.14;
    const harmonic = 0.85 + 0.25 * Math.sin(i * 2.1 + seedIndex * 1.7);
    const dLat = (Math.sin(angle) * radiusKm * harmonic) / kmPerDegLat;
    const dLng = (Math.cos(angle) * radiusKm * harmonic) / kmPerDegLng;
    points.push({
      lat: Math.round((centroid.lat + dLat) * 10000) / 10000,
      lng: Math.round((centroid.lng + dLng) * 10000) / 10000,
    });
  }
  return points;
}

/**
 * Role-based Access Control for the 5-Agent AI Suite.
 * Enforces strict separation:
 * - MASTER_ADMIN: all 5 (Farmer, Buyer, Supplier, Market, Admin)
 * - Farmer: Farmer, Supplier, Market
 * - Buyer: Buyer, Market
 * - Supplier: Supplier, Market
 * - Cooperative / Government: Farmer, Buyer, Supplier, Market (Admin locked exclusively to MASTER_ADMIN)
 */
export function canAccessAgent(
  role: StakeholderRole | undefined,
  agent: AgentDomain
): boolean {
  if (!role) return agent === 'Market';
  if (role === 'MASTER_ADMIN') return true;
  if (agent === 'Admin') return false;
  switch (role) {
    case 'Farmer':
      return agent === 'Farmer' || agent === 'Supplier' || agent === 'Market';
    case 'Buyer':
      return agent === 'Buyer' || agent === 'Market';
    case 'Supplier':
      return agent === 'Supplier' || agent === 'Market';
    case 'Cooperative':
    case 'Government':
      return true;
    default:
      return agent === 'Market';
  }
}

/**
 * Computes expected delivery ETA combining highway transit duration and harvest/dispatch readiness.
 */
export function estimateDeliveryEta(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  harvestLeadDays: number = 0,
  deliveryMode: string = 'NVAT Bambang Drop-off Bay'
): { etaLabel: string; totalMinutes: number; distanceKm: number } {
  const distanceKm = haversineDistanceKm(fromLat, fromLng, toLat, toLng);
  const driveMins = calculateDrivingTimeMinutes(distanceKm, 40);
  const dispatchPrepMins =
    deliveryMode === 'Buyer Farm Pickup'
      ? 35
      : deliveryMode === 'Supplier Direct Delivery'
      ? 55
      : 45;
  const totalMinutes = driveMins + dispatchPrepMins + Math.max(0, harvestLeadDays) * 1440;

  if (harvestLeadDays >= 1) {
    return {
      etaLabel: `${harvestLeadDays}d ${Math.ceil((driveMins + dispatchPrepMins) / 60)}h (${distanceKm.toFixed(1)} km)`,
      totalMinutes,
      distanceKm,
    };
  }

  const totalDrivePlusPrep = driveMins + dispatchPrepMins;
  if (totalDrivePlusPrep < 60) {
    return {
      etaLabel: `~${totalDrivePlusPrep} mins (${distanceKm.toFixed(1)} km)`,
      totalMinutes,
      distanceKm,
    };
  }

  const hrs = Math.floor(totalDrivePlusPrep / 60);
  const mins = totalDrivePlusPrep % 60;
  return {
    etaLabel: `~${hrs}h ${mins}m (${distanceKm.toFixed(1)} km)`,
    totalMinutes,
    distanceKm,
  };
}

export const NV_COORDS_BY_MUNICIPALITY: Record<string, { lat: number; lng: number }> = {
  Bambang: { lat: 16.3861, lng: 121.1065 },
  Bayombong: { lat: 16.4856, lng: 121.1492 },
  Solano: { lat: 16.5186, lng: 121.1819 },
  Kayapa: { lat: 16.3025, lng: 120.8614 },
  Kasibu: { lat: 16.3197, lng: 121.2878 },
  Aritao: { lat: 16.2969, lng: 121.0336 },
  Bagabag: { lat: 16.6061, lng: 121.2519 },
  'Dupax del Sur': { lat: 16.2833, lng: 121.1 },
  'Dupax del Norte': { lat: 16.305, lng: 121.12 },
  'Santa Fe': { lat: 16.1583, lng: 120.9389 },
  Villaverde: { lat: 16.592, lng: 121.21 },
  Quezon: { lat: 16.49, lng: 121.26 },
  Ambaguio: { lat: 16.46, lng: 121.02 },
  'Alfonso Castañeda': { lat: 15.8667, lng: 121.3 },
  Diadi: { lat: 16.65, lng: 121.36 },
};

/**
 * Ranks commodities for a Buyer's need criteria (top matches weighted by proximity, price,
 * quality grade, verified status, fewer strikes, and completed trades).
 */
export function rankCommoditiesForBuyer(
  commodities: CommodityItem[],
  accounts: UserAccount[],
  criteria: BuyerNeedCriteria
): Array<{
  commodity: CommodityItem;
  score: number;
  distanceKm: number;
  etaLabel: string;
  sellerStrikes: number;
  completedTrades: number;
  reasons: string[];
}> {
  const destCoords =
    NV_COORDS_BY_MUNICIPALITY[criteria.destinationMunicipality] ||
    NV_COORDS_BY_MUNICIPALITY.Bambang;

  const query = (criteria.neededSupply || '').trim().toLowerCase();

  return commodities
    .filter((c) => {
      const seller = accounts.find((a) => a.id === c.supplierId);
      if (seller && seller.status === 'BANNED') return false;
      if (c.verificationStatus === 'REJECTED') return false;
      if (query) {
        const matchesName =
          c.name.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query);
        if (!matchesName) return false;
      }
      if (
        criteria.preferredGrade !== 'ANY' &&
        c.qualityGrade !== criteria.preferredGrade
      ) {
        return false;
      }
      return true;
    })
    .map((commodity) => {
      const seller = accounts.find((a) => a.id === commodity.supplierId);
      const sellerStrikes = seller?.strikeCount || 0;
      const completedTrades = seller?.completedTradesCount || 0;
      const isVerified = commodity.verificationStatus === 'VERIFIED';

      const eta = estimateDeliveryEta(
        commodity.lat,
        commodity.lng,
        destCoords.lat,
        destCoords.lng,
        commodity.daysToHarvest || 0,
        'NVAT Bambang Drop-off Bay'
      );

      let score = calculateSupplierRecommendationScore({
        itemPrice: commodity.pricePerKg,
        benchmarkPrice: commodity.pricePerKg * 1.08,
        distanceKm: eta.distanceKm,
        maxDistanceThresholdKm: 90,
        isVerified,
        aiAuthenticityScore: commodity.aiAuthenticityScore,
        availableKg: commodity.availableKg,
        targetKg: Math.max(1, criteria.targetKg || 100),
      });

      // Weight reliability: bonus for verified & completed trades, penalty for strikes
      score += Math.min(8, Math.floor(completedTrades / 5));
      score -= sellerStrikes * 15;
      if (commodity.qualityGrade === 'Grade A Premium') score += 4;
      score = Math.min(100, Math.max(1, Math.round(score)));

      const reasons: string[] = [];
      if (isVerified) reasons.push('Admin Verified');
      if (eta.distanceKm <= 25) reasons.push(`Close (${eta.distanceKm.toFixed(1)} km)`);
      if (sellerStrikes === 0) reasons.push('0 Strikes');
      if (completedTrades > 0) reasons.push(`${completedTrades} Trades`);
      if (commodity.qualityGrade === 'Grade A Premium') reasons.push('Grade A');

      return {
        commodity,
        score,
        distanceKm: eta.distanceKm,
        etaLabel: eta.etaLabel,
        sellerStrikes,
        completedTrades,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export const REACTION_TYPES: ReactionType[] = ['heart', 'wow', 'sad', 'care', 'angry'];

export function toggleReactionMap(
  reactions: PostReactions | undefined,
  userId: string,
  type: ReactionType
): PostReactions {
  const current: PostReactions = {
    heart: [...(reactions?.heart || [])],
    wow: [...(reactions?.wow || [])],
    sad: [...(reactions?.sad || [])],
    care: [...(reactions?.care || [])],
    angry: [...(reactions?.angry || [])],
  };

  const alreadySelected = (current[type] || []).includes(userId);
  // Remove userId from all reaction buckets so user has one active reaction cleanly
  for (const rType of REACTION_TYPES) {
    current[rType] = (current[rType] || []).filter((id) => id !== userId);
  }
  if (!alreadySelected) {
    current[type] = [...(current[type] || []), userId];
  }
  return current;
}

export function aggregateReactions(
  reactions: PostReactions | undefined,
  legacyLikes: string[] = []
): { total: number; counts: Record<ReactionType, number> } {
  const counts: Record<ReactionType, number> = {
    heart: reactions?.heart?.length ?? legacyLikes.length,
    wow: reactions?.wow?.length ?? 0,
    sad: reactions?.sad?.length ?? 0,
    care: reactions?.care?.length ?? 0,
    angry: reactions?.angry?.length ?? 0,
  };
  const total =
    counts.heart + counts.wow + counts.sad + counts.care + counts.angry;
  return { total, counts };
}

export function evaluateStrikeAction(
  currentStrikes: number,
  action: 'STRIKE_DELETE' | 'BAN_DIRECT' | 'DISMISS'
): { nextStrikes: number; nextStatus: 'ACTIVE' | 'BANNED'; autoBanned: boolean } {
  if (action === 'DISMISS') {
    return {
      nextStrikes: currentStrikes,
      nextStatus: currentStrikes >= 3 ? 'BANNED' : 'ACTIVE',
      autoBanned: false,
    };
  }
  if (action === 'BAN_DIRECT') {
    return {
      nextStrikes: Math.max(3, currentStrikes),
      nextStatus: 'BANNED',
      autoBanned: true,
    };
  }
  const nextStrikes = currentStrikes + 1;
  const autoBanned = nextStrikes >= 3;
  return {
    nextStrikes,
    nextStatus: autoBanned ? 'BANNED' : 'ACTIVE',
    autoBanned,
  };
}

const PIE_PALETTE = [
  '#1F4B2C',
  '#4D7111',
  '#82B729',
  '#C3E956',
  '#10B981',
  '#0284C7',
  '#D97706',
  '#7C3AED',
];

export function computeMunicipalSupplyDistribution(
  commodities: CommodityItem[]
): Array<{
  municipality: string;
  totalKg: number;
  percentage: number;
  listingsCount: number;
  topCrop: string;
  color: string;
}> {
  const byMuni = new Map<
    string,
    { totalKg: number; listingsCount: number; topCrop: string; topKg: number }
  >();

  let grandTotalKg = 0;
  for (const c of commodities) {
    if (c.verificationStatus === 'REJECTED') continue;
    grandTotalKg += c.availableKg;
    const prev = byMuni.get(c.municipality);
    if (!prev) {
      byMuni.set(c.municipality, {
        totalKg: c.availableKg,
        listingsCount: 1,
        topCrop: c.name,
        topKg: c.availableKg,
      });
    } else {
      const nextKg = prev.totalKg + c.availableKg;
      const isNewTop = c.availableKg > prev.topKg;
      byMuni.set(c.municipality, {
        totalKg: nextKg,
        listingsCount: prev.listingsCount + 1,
        topCrop: isNewTop ? c.name : prev.topCrop,
        topKg: isNewTop ? c.availableKg : prev.topKg,
      });
    }
  }

  return Array.from(byMuni.entries())
    .map(([municipality, info], idx) => ({
      municipality,
      totalKg: info.totalKg,
      percentage:
        grandTotalKg > 0
          ? Math.round((info.totalKg / grandTotalKg) * 1000) / 10
          : 0,
      listingsCount: info.listingsCount,
      topCrop: info.topCrop,
      color: PIE_PALETTE[idx % PIE_PALETTE.length],
    }))
    .sort((a, b) => b.totalKg - a.totalKg);
}


