import { Platform } from 'react-native';

const defaultLocalBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:8787' : 'http://localhost:8787';

export const aiApiBaseUrl =
  process.env.EXPO_PUBLIC_AI_API_BASE_URL || defaultLocalBaseUrl;

export const aiServerApiKey =
  process.env.EXPO_PUBLIC_AI_SERVER_API_KEY || 'vv-local-dev-key';
