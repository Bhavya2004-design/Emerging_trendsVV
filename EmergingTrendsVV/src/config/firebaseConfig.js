export const firebaseConfig = {
  apiKey: 'AIzaSyAXxwmiiuICHpBTXEGt67kQMGp5JavJO_4',
  authDomain: 'voguevault-dcd9d.firebaseapp.com',
  projectId: 'voguevault-dcd9d',
  storageBucket: 'voguevault-dcd9d.firebasestorage.app',
  messagingSenderId: '4517007795',
  appId: '1:4517007795:web:d4dd4ff56bd29d01d8fbc6',
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];

export const isFirebaseConfigured = requiredKeys.every((key) => {
  const value = firebaseConfig[key];
  return typeof value === 'string' && value.length > 0 && !value.startsWith('YOUR_');
});
