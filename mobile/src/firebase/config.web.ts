import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Same project config as config.ts; on web, getAuth() already persists the
// session in the browser (IndexedDB/localStorage), so no RN persistence needed.
const firebaseConfig = {
  apiKey: 'AIzaSyAphW3cKSuoyZvnQ59GXQ2mpaU8X0mEUuo',
  authDomain: 'allworth.firebaseapp.com',
  projectId: 'allworth',
  storageBucket: 'allworth.firebasestorage.app',
  messagingSenderId: '971284690971',
  appId: '1:971284690971:web:8ab124ed0cc2948a12e0be',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
