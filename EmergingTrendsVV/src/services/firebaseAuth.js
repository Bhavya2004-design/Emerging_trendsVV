import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebaseConfig';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

function ensureConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Update src/config/firebaseConfig.js first.');
  }
}

export async function registerWithEmail(email, password, displayName = '') {
  ensureConfigured();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

  if (displayName.trim() && credential.user) {
    await updateProfile(credential.user, { displayName: displayName.trim() });
  }

  return credential;
}

export async function loginWithEmail(email, password) {
  ensureConfigured();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function sendResetForEmail(email) {
  ensureConfigured();
  return sendPasswordResetEmail(auth, email.trim());
}

export function subscribeAuthState(listener) {
  return onAuthStateChanged(auth, listener);
}

export async function logoutUser() {
  ensureConfigured();
  return signOut(auth);
}

export async function updateAuthDisplayName(displayName) {
  ensureConfigured();
  const nextName = String(displayName || '').trim();
  if (!auth.currentUser || !nextName) {
    return;
  }

  await updateProfile(auth.currentUser, { displayName: nextName });
}

export function formatAuthError(error) {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code.includes('invalid-email')) return 'Please enter a valid email address.';
  if (code.includes('invalid-api-key')) return 'Firebase API key is invalid. Re-copy apiKey from Firebase project settings.';
  if (code.includes('app-not-authorized')) return 'This app is not authorized for Firebase Auth. Check API key restrictions in Google Cloud.';
  if (code.includes('operation-not-allowed')) return 'Email/Password sign-in is disabled in Firebase. Enable it in Authentication > Sign-in method.';
  if (code.includes('network-request-failed')) return 'Network error. Check emulator internet connection and try again.';
  if (code.includes('missing-password')) return 'Please enter your password.';
  if (code.includes('weak-password')) {
    return 'Password is too weak for Firebase. Use at least 12 characters with upper and lowercase letters, a number, and a special character.';
  }
  if (code.includes('email-already-in-use')) return 'This email is already registered.';
  if (code.includes('invalid-credential')) return 'Incorrect email or password.';
  if (code.includes('user-not-found')) return 'No account found with this email.';
  if (code.includes('wrong-password')) return 'Incorrect email or password.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Please try again later.';

  if (message.includes('Firebase is not configured')) {
    return 'Firebase is not configured yet. Add your Firebase keys in src/config/firebaseConfig.js.';
  }

  if (code) {
    return `Firebase error (${code}). Please share this code.`;
  }

  return 'Something went wrong. Please try again.';
}
