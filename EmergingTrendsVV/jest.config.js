module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules\\\\(?!((jest-)?react-native|@react-native(-community)?|react-native-.*)\\\\)',
  ],
};
