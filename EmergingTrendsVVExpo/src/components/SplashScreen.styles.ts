import { StyleSheet } from 'react-native';

export const SPLASH_BACKGROUND = '#e8e4da';

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    resizeMode: 'contain',
  },
  placeholderLogo: {
    borderRadius: 999,
    backgroundColor: '#f4f0e8',
    borderWidth: 1,
    borderColor: '#d9d3c8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#6f665e',
    fontFamily: 'serif',
    fontWeight: '700',
    letterSpacing: 2,
  },
});
