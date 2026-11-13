/**
 * AGRIMATCH-NV - Backend & Cloud Integration Configuration
 * 
 * This file coordinates connections for:
 * 1. Firebase Authentication & Cloud Firestore (Client SDK & Rules)
 * 2. Cloud SQL (PostgreSQL relational data store for trade auditing)
 * 3. Google Gemini API SDK (Multi-Agent reasoning & Vision quality checks)
 * 4. DOST-PAGASA Real-Time Radar & Weather API Telemetry
 */

// ============================================================================
// TODO: Insert Firebase/SQL/Gemini API Config
// Replace with production project credentials when switching from Demo to Live
// ============================================================================

export const FIREBASE_APP_CONFIG = {
  // TODO: Insert your Firebase Web App configuration below
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_AGRIMATCH_NV_DEMO_KEY_MOCK",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agrimatch-nv-platform.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agrimatch-nv-platform",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agrimatch-nv-platform.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "81815511103",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:81815511103:web:agrimatchnvprod"
};

export const CLOUD_SQL_POSTGRES_CONFIG = {
  // TODO: Insert your Cloud SQL PostgreSQL connection settings for production deployment
  host: import.meta.env.VITE_DB_HOST || "10.0.0.3",
  port: Number(import.meta.env.VITE_DB_PORT) || 5432,
  database: import.meta.env.VITE_DB_NAME || "agrimatch_nv_ledger",
  user: import.meta.env.VITE_DB_USER || "agrimatch_admin",
  sslMode: "require",
  instanceConnectionName: import.meta.env.VITE_SQL_CONNECTION_NAME || "agrimatch-nv-platform:asia-southeast1:agrimatch-pg-primary"
};

export const GEMINI_API_CONFIG = {
  // TODO: Insert Gemini API Key via AI Studio Secrets Panel (GEMINI_API_KEY)
  modelText: "gemini-2.5-flash",
  modelVision: "gemini-2.5-flash",
  systemPromptRole: "Agricultural Logistics & Microclimate Decision Agent for Nueva Vizcaya"
};

export const PAGASA_STATION_ENDPOINTS = {
  // DOST-PAGASA Regional Synoptic & Agrometeorological Feeds
  synopticRadarBayombong: "https://bagong.pagasa.dost.gov.ph/radar/apari-radar",
  heavyRainfallWarningsRegion2: "https://bagong.pagasa.dost.gov.ph/weather/regional-forecast",
  bambangAgrometTelemetry: "https://bagong.pagasa.dost.gov.ph/agrometeorology/station-data?station=bambang_nv",
  tropicalCycloneBulletins: "https://bagong.pagasa.dost.gov.ph/weather/tropical-cyclone"
};

export const LIVE_MODE_ENABLED = false; // Toggled by dual-mode controller
