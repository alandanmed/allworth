import { getApp, getApps, initializeApp } from 'firebase/app';
// getReactNativePersistence is omitted from firebase/auth's public types because
// its package exports map lists the generic "types" condition before the
// "react-native" one, so tsc always resolves the non-RN types regardless of the
// project's customConditions setting. Metro resolves the real React Native build
// correctly at runtime (confirmed: auth sessions persist across app restarts).
// @ts-expect-error — known upstream firebase/auth types gap, not a real error
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAphW3cKSuoyZvnQ59GXQ2mpaU8X0mEUuo',
  authDomain: 'allworth.firebaseapp.com',
  projectId: 'allworth',
  storageBucket: 'allworth.firebasestorage.app',
  messagingSenderId: '971284690971',
  appId: '1:971284690971:web:8ab124ed0cc2948a12e0be',
};

// getApps().length check prevents re-initializing the Firebase app itself
// on Fast Refresh (Metro re-running this file's top-level code).
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth() throws if called more than once for the same app —
// which Fast Refresh can trigger. Fall back to the already-initialized
// instance instead of crashing.
let auth;
try {
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(firebaseApp);
}
export const firebaseAuth = auth;
