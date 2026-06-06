import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - you'll need to replace these with your own Firebase project config
// Get these from Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:demo',
};

// Debug: log config (remove in production)
const isProd = import.meta.env.PROD;
if (!isProd) {
  console.log('Firebase config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: firebaseConfig.apiKey.startsWith('AIza'),
  });
}

// Initialize Firebase - with fallback for missing config
let app: FirebaseApp | undefined;
try {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    app = initializeApp(firebaseConfig);
  }
} catch (error: any) {
  console.error('Firebase initialization error:', error.message || error);
}

// Initialize services - handle undefined app gracefully by casting for now
export const auth = getAuth(app as any);
export const db = getFirestore(app as any);
export const googleProvider = new GoogleAuthProvider();

export default app;
