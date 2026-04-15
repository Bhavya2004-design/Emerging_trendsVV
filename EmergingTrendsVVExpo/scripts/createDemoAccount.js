/**
 * Run this ONCE now to create your demo Firebase account.
 * After running it, you can log in with these credentials during your demo:
 *
 *   Email:    demo@voguevault.app
 *   Password: VogueDemo2026!
 *
 * Run from the EmergingTrendsVVExpo folder:
 *   node scripts/createDemoAccount.js
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../src/config/firebaseConfig.js';

const DEMO_EMAIL = 'demo@voguevault.app';
const DEMO_PASSWORD = 'VogueDemo2026!';
const DEMO_DISPLAY_NAME = 'Maria';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = initializeAuth(app);

async function createDemoAccount() {
  console.log('Checking demo account...');

  try {
    // Try login first — if it works, account already exists
    await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
    console.log('');
    console.log('✅ Demo account already exists. Ready to use.');
    console.log('');
    console.log('  Email:    ' + DEMO_EMAIL);
    console.log('  Password: ' + DEMO_PASSWORD);
    console.log('');
    process.exit(0);
  } catch {
    // Account does not exist, create it
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
    await updateProfile(credential.user, { displayName: DEMO_DISPLAY_NAME });

    console.log('');
    console.log('✅ Demo account created successfully!');
    console.log('');
    console.log('  Email:    ' + DEMO_EMAIL);
    console.log('  Password: ' + DEMO_PASSWORD);
    console.log('  Name:     ' + DEMO_DISPLAY_NAME);
    console.log('');
    console.log('Use these credentials to log in during your demo.');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Could not create demo account: ' + error.message);
    console.error('');
    console.error('Possible reasons:');
    console.error('  - Firebase project not configured (check src/config/firebaseConfig.js)');
    console.error('  - Email already registered under a different password');
    console.error('');
    process.exit(1);
  }
}

createDemoAccount();
