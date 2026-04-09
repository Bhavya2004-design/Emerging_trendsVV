jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('./src/services/firebaseAuth', () => ({
  registerWithEmail: jest.fn(),
  loginWithEmail: jest.fn(),
  sendResetForEmail: jest.fn(),
  formatAuthError: jest.fn(() => 'Mock auth error'),
  subscribeAuthState: jest.fn((listener) => {
    if (typeof listener === 'function') {
      listener(null);
    }
    return () => {};
  }),
}));
