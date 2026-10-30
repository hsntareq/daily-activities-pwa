import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Default fallback configuration for seamless development & offline fallback
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoKeyDailyActivitiesPWA2026',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'daily-activities-pwa.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://daily-activities-pwa-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'daily-activities-pwa',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'daily-activities-pwa.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

let appInstance: FirebaseApp | null = null;
let rtdbInstance: Database | null = null;

export function isFirebaseConfigured(): boolean {
  // Check if non-default environment variables or custom configuration are supplied
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('DemoKey')
  );
}

export function getFirebaseApp(customConfig?: Partial<FirebaseConfig>): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  const config = {
    ...DEFAULT_FIREBASE_CONFIG,
    ...customConfig,
  };

  appInstance = initializeApp(config);
  return appInstance;
}

export function getRealtimeDatabase(customConfig?: Partial<FirebaseConfig>): Database {
  if (rtdbInstance) return rtdbInstance;
  const app = getFirebaseApp(customConfig);
  rtdbInstance = getDatabase(app);
  return rtdbInstance;
}
