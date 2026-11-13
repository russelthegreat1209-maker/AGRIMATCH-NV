import test from 'node:test';
import assert from 'node:assert/strict';
import {
  haversineDistanceKm,
  isWithinRadius,
  calculateDrivingTimeMinutes,
  calculateSupplierRecommendationScore,
  checkDualHandshakeCompletion,
  parseNvatTextToStructured,
} from './agriMath';

test('haversineDistanceKm calculates distance between Bambang and Bayombong accurately', () => {
  // Bambang: 16.3861, 121.1065; Bayombong: 16.4815, 121.1492 (approx 11-13 km)
  const dist = haversineDistanceKm(16.3861, 121.1065, 16.4815, 121.1492);
  assert.ok(dist >= 10 && dist <= 15, `Expected distance ~11-13 km, got ${dist}`);
});

test('haversineDistanceKm returns 0 for identical coordinates', () => {
  const dist = haversineDistanceKm(16.4830, 121.1500, 16.4830, 121.1500);
  assert.equal(dist, 0);
});

test('isWithinRadius filters correctly', () => {
  const bambangLat = 16.3861;
  const bambangLng = 121.1065;
  const bayombongLat = 16.4815;
  const bayombongLng = 121.1492;

  // 12 km is within 50km
  assert.equal(isWithinRadius(bambangLat, bambangLng, bayombongLat, bayombongLng, 50), true);
  // 12 km is within 15km
  assert.equal(isWithinRadius(bambangLat, bambangLng, bayombongLat, bayombongLng, 15), true);
  // 12 km is NOT within 5km
  assert.equal(isWithinRadius(bambangLat, bambangLng, bayombongLat, bayombongLng, 5), false);
  // 'ALL' always returns true
  assert.equal(isWithinRadius(bambangLat, bambangLng, bayombongLat, bayombongLng, 'ALL'), true);
});

test('calculateDrivingTimeMinutes handles mountain transit estimation', () => {
  const time = calculateDrivingTimeMinutes(21, 42); // 21 km at 42 km/h is 30 mins
  assert.equal(time, 30);
});

test('checkDualHandshakeCompletion requires both parties to confirm', () => {
  assert.equal(checkDualHandshakeCompletion(false, false), false);
  assert.equal(checkDualHandshakeCompletion(true, false), false);
  assert.equal(checkDualHandshakeCompletion(false, true), false);
  assert.equal(checkDualHandshakeCompletion(true, true), true);
});

test('calculateSupplierRecommendationScore weighs price, distance, quality, availability', () => {
  const highQualityScore = calculateSupplierRecommendationScore({
    itemPrice: 30,
    benchmarkPrice: 35,
    distanceKm: 5,
    maxDistanceThresholdKm: 80,
    isVerified: true,
    aiAuthenticityScore: 98,
    availableKg: 1000,
    targetKg: 500,
  });

  const lowQualityScore = calculateSupplierRecommendationScore({
    itemPrice: 50,
    benchmarkPrice: 35,
    distanceKm: 75,
    maxDistanceThresholdKm: 80,
    isVerified: false,
    aiAuthenticityScore: 40,
    availableKg: 100,
    targetKg: 500,
  });

  assert.ok(highQualityScore > lowQualityScore, `High quality (${highQualityScore}) should beat low quality (${lowQualityScore})`);
  assert.ok(highQualityScore >= 80, `High quality score should be >= 80, got ${highQualityScore}`);
});

test('parseNvatTextToStructured parses commodity mentions and variances', () => {
  const sampleBulletin = 'NVAT Bambang Daily Price Bulletin: Highland cabbage inflows reached 42 metric tons today with prevailing wholesale prices dropping to Php 32/kg. Red onions remained steady at Php 95/kg.';
  const parsed = parseNvatTextToStructured(sampleBulletin, '2026-11-12');
  assert.ok(parsed.length >= 2, 'Should parse at least cabbage and onion');
  const cabbage = parsed.find(item => item.commodityName.toLowerCase().includes('cabbage'));
  assert.ok(cabbage !== undefined, 'Cabbage should be parsed');
});
