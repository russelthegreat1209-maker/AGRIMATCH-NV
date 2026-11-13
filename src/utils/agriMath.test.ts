import test from 'node:test';
import assert from 'node:assert/strict';
import {
  haversineDistanceKm,
  isWithinRadius,
  calculateDrivingTimeMinutes,
  calculateSupplierRecommendationScore,
  checkDualHandshakeCompletion,
  parseNvatTextToStructured,
  getUserInitials,
  buildMunicipalGeoPolygon,
  canAccessAgent,
  estimateDeliveryEta,
  rankCommoditiesForBuyer,
  toggleReactionMap,
  aggregateReactions,
  evaluateStrikeAction,
  computeMunicipalSupplyDistribution,
} from './agriMath';
import type { CommodityItem, UserAccount } from '../types';

const TEST_ACCOUNTS: UserAccount[] = [
  {
    id: 'farmer_01',
    name: 'Mang Ramon Dela Cruz',
    email: 'ramon@agrimatch-nv.ph',
    role: 'Farmer',
    phone: '+63 917 000 0001',
    municipality: 'Kayapa',
    barangay: 'Pingkian',
    lat: 16.3025,
    lng: 120.8614,
    avatar: '',
    bio: 'Highland vegetable farmer.',
    verified: true,
    status: 'ACTIVE',
    strikeCount: 0,
    completedTradesCount: 24,
  },
  {
    id: 'supplier_02',
    name: 'Kuya Mateo Trading',
    email: 'mateo@agrimatch-nv.ph',
    role: 'Supplier',
    phone: '+63 917 000 0002',
    municipality: 'Bambang',
    barangay: 'Almaguer North',
    lat: 16.3861,
    lng: 121.1065,
    avatar: '',
    bio: 'NVAT consolidator.',
    verified: true,
    status: 'ACTIVE',
    strikeCount: 1,
    completedTradesCount: 4,
  },
];

const TEST_COMMODITIES: CommodityItem[] = [
  {
    id: 'crop_01',
    name: 'Scorpio Highland Cabbage',
    category: 'Highland Vegetables',
    supplierId: 'farmer_01',
    supplierName: 'Mang Ramon Dela Cruz',
    supplierRole: 'Farmer',
    municipality: 'Kayapa',
    barangay: 'Pingkian',
    lat: 16.3025,
    lng: 120.8614,
    availableKg: 1200,
    pricePerKg: 32,
    minOrderKg: 50,
    imageUrl: '',
    verificationStatus: 'VERIFIED',
    aiAuthenticityScore: 98,
    harvestDate: '2026-11-11',
    daysToHarvest: 0,
    qualityGrade: 'Grade A Premium',
    postedAt: '2026-11-11T08:00:00Z',
  },
  {
    id: 'crop_02',
    name: 'Solano Highland Cabbage Lot B',
    category: 'Highland Vegetables',
    supplierId: 'supplier_02',
    supplierName: 'Kuya Mateo Trading',
    supplierRole: 'Supplier',
    municipality: 'Solano',
    barangay: 'Quezon',
    lat: 16.5176,
    lng: 121.1823,
    availableKg: 800,
    pricePerKg: 38,
    minOrderKg: 50,
    imageUrl: '',
    verificationStatus: 'PENDING',
    aiAuthenticityScore: 80,
    harvestDate: '2026-11-12',
    daysToHarvest: 1,
    qualityGrade: 'Grade B Commercial',
    postedAt: '2026-11-11T09:00:00Z',
  },
  {
    id: 'crop_03',
    name: 'Malabing Satsuma Citrus',
    category: 'Citrus & Fruits',
    supplierId: 'farmer_01',
    supplierName: 'Mang Ramon Dela Cruz',
    supplierRole: 'Farmer',
    municipality: 'Kasibu',
    barangay: 'Papaya',
    lat: 16.322,
    lng: 121.298,
    availableKg: 1500,
    pricePerKg: 75,
    minOrderKg: 100,
    imageUrl: '',
    verificationStatus: 'VERIFIED',
    aiAuthenticityScore: 96,
    harvestDate: '2026-11-11',
    daysToHarvest: 0,
    qualityGrade: 'Grade A Premium',
    postedAt: '2026-11-11T10:00:00Z',
  },
];

test('haversineDistanceKm computes Bambang to Bayombong highway proximity accurately', () => {
  const km = haversineDistanceKm(16.3861, 121.1065, 16.4856, 121.1492);
  assert.ok(km > 10 && km < 15, `Expected 10-15 km, got ${km}`);
});

test('isWithinRadius handles numeric thresholds and ALL filter', () => {
  assert.equal(isWithinRadius(16.3861, 121.1065, 16.4856, 121.1492, 25), true);
  assert.equal(isWithinRadius(16.3861, 121.1065, 16.4856, 121.1492, 5), false);
  assert.equal(isWithinRadius(16.3861, 121.1065, 15.8667, 121.3, 'ALL'), true);
});

test('calculateDrivingTimeMinutes scales monotonically with distance', () => {
  assert.equal(calculateDrivingTimeMinutes(0), 0);
  const shortDrive = calculateDrivingTimeMinutes(10);
  const longDrive = calculateDrivingTimeMinutes(42);
  assert.equal(longDrive, 60);
  assert.ok(shortDrive < longDrive);
});

test('calculateSupplierRecommendationScore prioritizes lower price, closer verified hub, and sufficient stock', () => {
  const strongMatch = calculateSupplierRecommendationScore({
    itemPrice: 30,
    benchmarkPrice: 35,
    distanceKm: 8,
    isVerified: true,
    aiAuthenticityScore: 98,
    availableKg: 1000,
    targetKg: 500,
  });
  const weakMatch = calculateSupplierRecommendationScore({
    itemPrice: 55,
    benchmarkPrice: 35,
    distanceKm: 70,
    isVerified: false,
    aiAuthenticityScore: 60,
    availableKg: 100,
    targetKg: 500,
  });
  assert.ok(strongMatch > weakMatch);
  assert.ok(strongMatch <= 100 && strongMatch >= 1);
});

test('checkDualHandshakeCompletion completes only when both supplier and buyer confirm', () => {
  assert.equal(checkDualHandshakeCompletion(false, false), false);
  assert.equal(checkDualHandshakeCompletion(true, false), false);
  assert.equal(checkDualHandshakeCompletion(false, true), false);
  assert.equal(checkDualHandshakeCompletion(true, true), true);
});

test('parseNvatTextToStructured parses Highland Cabbage and fallback items cleanly', () => {
  const items = parseNvatTextToStructured('Highland Cabbage plentiful today at NVAT Bambang', '2026-11-12');
  assert.ok(items.length >= 1);
  assert.equal(items[0].commodityName, 'Highland Cabbage');
  assert.equal(items[0].date, '2026-11-12');
});

test('getUserInitials formats names cleanly with parenthetical annotations stripped', () => {
  assert.equal(getUserInitials('Mang Mateo Reyes'), 'MR');
  assert.equal(getUserInitials('Engr. Russel (System Architect)'), 'ER');
  assert.equal(getUserInitials('Solano'), 'SO');
  assert.equal(getUserInitials(''), 'NV');
});

test('buildMunicipalGeoPolygon generates bounded 7-point lat/lng polygons around centroid', () => {
  const centroid = { lat: 16.3861, lng: 121.1065 };
  const poly = buildMunicipalGeoPolygon(centroid, 345, 2);
  assert.equal(poly.length, 7);
  for (const pt of poly) {
    assert.ok(Math.abs(pt.lat - centroid.lat) < 0.25);
    assert.ok(Math.abs(pt.lng - centroid.lng) < 0.25);
  }
});

test('canAccessAgent enforces strict RBAC boundaries per stakeholder role', () => {
  // Farmer: Farmer, Supplier, Market ONLY
  assert.equal(canAccessAgent('Farmer', 'Farmer'), true);
  assert.equal(canAccessAgent('Farmer', 'Supplier'), true);
  assert.equal(canAccessAgent('Farmer', 'Market'), true);
  assert.equal(canAccessAgent('Farmer', 'Buyer'), false);
  assert.equal(canAccessAgent('Farmer', 'Admin'), false);

  // Buyer: Buyer, Market ONLY
  assert.equal(canAccessAgent('Buyer', 'Buyer'), true);
  assert.equal(canAccessAgent('Buyer', 'Market'), true);
  assert.equal(canAccessAgent('Buyer', 'Farmer'), false);
  assert.equal(canAccessAgent('Buyer', 'Supplier'), false);
  assert.equal(canAccessAgent('Buyer', 'Admin'), false);

  // Supplier: Supplier, Market ONLY
  assert.equal(canAccessAgent('Supplier', 'Supplier'), true);
  assert.equal(canAccessAgent('Supplier', 'Market'), true);
  assert.equal(canAccessAgent('Supplier', 'Farmer'), false);
  assert.equal(canAccessAgent('Supplier', 'Admin'), false);

  // Cooperative: Farmer, Buyer, Supplier, Market (NO Admin)
  assert.equal(canAccessAgent('Cooperative', 'Farmer'), true);
  assert.equal(canAccessAgent('Cooperative', 'Buyer'), true);
  assert.equal(canAccessAgent('Cooperative', 'Supplier'), true);
  assert.equal(canAccessAgent('Cooperative', 'Market'), true);
  assert.equal(canAccessAgent('Cooperative', 'Admin'), false);

  // MASTER_ADMIN: ALL 5
  assert.equal(canAccessAgent('MASTER_ADMIN', 'Admin'), true);
  assert.equal(canAccessAgent('MASTER_ADMIN', 'Farmer'), true);
  assert.equal(canAccessAgent('MASTER_ADMIN', 'Buyer'), true);
  assert.equal(canAccessAgent('MASTER_ADMIN', 'Supplier'), true);
  assert.equal(canAccessAgent('MASTER_ADMIN', 'Market'), true);
});

test('estimateDeliveryEta calculates realistic transit duration with harvest lead offset', () => {
  const sameDay = estimateDeliveryEta(16.3025, 120.8614, 16.3861, 121.1065, 0);
  const nextDay = estimateDeliveryEta(16.3025, 120.8614, 16.3861, 121.1065, 2);
  assert.ok(sameDay.totalMinutes >= 45 && sameDay.totalMinutes < 200);
  assert.ok(nextDay.totalMinutes > sameDay.totalMinutes + 2000);
  assert.ok(sameDay.etaLabel.includes('km'));
});

test('rankCommoditiesForBuyer sorts verified, low-strike, high-reliability lots cleanly', () => {
  const ranked = rankCommoditiesForBuyer(TEST_COMMODITIES, TEST_ACCOUNTS, {
    neededSupply: 'Cabbage',
    neededDate: '2026-11-12',
    destinationMunicipality: 'Bambang',
    preferredGrade: 'ANY',
    targetKg: 500,
  });
  assert.ok(ranked.length >= 2);
  assert.ok(ranked[0].score >= ranked[1].score);
  assert.ok(ranked[0].reasons.includes('Admin Verified'));
});

test('toggleReactionMap & aggregateReactions support single active reaction per user across all 5 types', () => {
  let map = toggleReactionMap({}, 'user_1', 'heart');
  assert.equal(aggregateReactions(map).counts.heart, 1);

  map = toggleReactionMap(map, 'user_1', 'wow');
  assert.equal(aggregateReactions(map).counts.heart, 0);
  assert.equal(aggregateReactions(map).counts.wow, 1);

  map = toggleReactionMap(map, 'user_1', 'wow');
  assert.equal(aggregateReactions(map).total, 0);
});

test('evaluateStrikeAction auto-bans account on 3rd strike and supports direct ban', () => {
  const s1 = evaluateStrikeAction(0, 'STRIKE_DELETE');
  assert.equal(s1.nextStrikes, 1);
  assert.equal(s1.nextStatus, 'ACTIVE');

  const s3 = evaluateStrikeAction(2, 'STRIKE_DELETE');
  assert.equal(s3.nextStrikes, 3);
  assert.equal(s3.nextStatus, 'BANNED');
  assert.equal(s3.autoBanned, true);

  const direct = evaluateStrikeAction(0, 'BAN_DIRECT');
  assert.equal(direct.nextStatus, 'BANNED');
  assert.equal(direct.nextStrikes, 3);
});

test('computeMunicipalSupplyDistribution aggregates municipal stock percentages summing near 100%', () => {
  const dist = computeMunicipalSupplyDistribution(TEST_COMMODITIES);
  assert.ok(dist.length >= 3);
  const sumPct = dist.reduce((acc, d) => acc + d.percentage, 0);
  assert.ok(sumPct > 99 && sumPct <= 101, `Expected ~100%, got ${sumPct}`);
});
