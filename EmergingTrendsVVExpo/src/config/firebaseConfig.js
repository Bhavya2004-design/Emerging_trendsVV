import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: 'AIzaSyAXxwmiiuICHpBTXEGt67kQMGp5JavJO_4',
  authDomain: 'voguevault-dcd9d.firebaseapp.com',
  databaseURL: 'https://voguevault-dcd9d-default-rtdb.firebaseio.com',
  projectId: 'voguevault-dcd9d',
  storageBucket: 'voguevault-dcd9d.firebasestorage.app',
  messagingSenderId: '4517007795',
  appId: '1:4517007795:web:d4dd4ff56bd29d01d8fbc6',
};

export const isFirebaseConfigured = true;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;