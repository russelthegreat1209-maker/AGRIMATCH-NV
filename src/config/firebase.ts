import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Handle optional firestoreDatabaseId cleanly
const databaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);

// Google Auth Provider with Google Sheets & Drive API scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory-only OAuth access token (never written to localStorage/sessionStorage)
let cachedGoogleAccessToken: string | null = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedGoogleAccessToken = null;
  }
});

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: FirestoreErrorInfo['operationType'],
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
  };
  console.warn('Firestore operation notice:', errInfo);
  return errInfo;
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system_health', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / check configuration');
    }
    return false;
  }
}

// Google Sign In popup (captures short-lived OAuth access token in memory)
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedGoogleAccessToken = credential.accessToken;
    }
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function getGoogleSheetsAccessToken(forceReauth = false): Promise<string> {
  if (cachedGoogleAccessToken && !forceReauth) {
    return cachedGoogleAccessToken;
  }
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.setCustomParameters({ prompt: 'consent' });
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error('Google Sheets OAuth access token was not returned by Google Sign-In.');
  }
  cachedGoogleAccessToken = credential.accessToken;
  return cachedGoogleAccessToken;
}

export async function exportBulletinToGoogleSheets(params: {
  accessToken: string;
  title: string;
  date: string;
  rows: Array<{
    commodityName: string;
    category: string;
    minPricePhp: number;
    maxPricePhp: number;
    prevailingPricePhp: number;
    previousPricePhp: number;
    estimatedVolumeTradedTons: number;
    marketTrendStatus: string;
  }>;
  summary: string[];
}): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `${params.title} (${params.date})`,
      },
      sheets: [
        { properties: { title: 'NVAT_Prices' } },
        { properties: { title: 'AI_Summary' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    if (createRes.status === 401) {
      cachedGoogleAccessToken = null;
    }
    throw new Error(`Google Sheets creation failed (${createRes.status}): ${errText}`);
  }

  const created = await createRes.json();
  const spreadsheetId: string = created.spreadsheetId;
  const spreadsheetUrl: string =
    created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const values = [
    [
      'Date',
      'Commodity Name',
      'Category',
      'Min Price (PHP/kg)',
      'Max Price (PHP/kg)',
      'Prevailing (PHP/kg)',
      'Previous (PHP/kg)',
      'Volume Traded (MT)',
      'Trend Status',
    ],
    ...params.rows.map((r) => [
      params.date,
      r.commodityName,
      r.category,
      r.minPricePhp,
      r.maxPricePhp,
      r.prevailingPricePhp,
      r.previousPricePhp,
      r.estimatedVolumeTradedTons,
      r.marketTrendStatus,
    ]),
  ];

  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/NVAT_Prices!A1:I${values.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!writeRes.ok) {
    const errText = await writeRes.text();
    throw new Error(`Google Sheets write failed (${writeRes.status}): ${errText}`);
  }

  const summaryRows = [
    ['AgriMatch NV Executive Bulletin Summary', params.date],
    ...params.summary.map((line, i) => [`Point ${i + 1}`, line]),
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/AI_Summary!A1:B${summaryRows.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: summaryRows }),
    }
  );

  return { spreadsheetId, spreadsheetUrl };
}

export async function logOutFirebase() {
  cachedGoogleAccessToken = null;
  await fbSignOut(auth);
}
