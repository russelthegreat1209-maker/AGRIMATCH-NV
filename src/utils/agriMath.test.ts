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
} from './agriMath';

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
