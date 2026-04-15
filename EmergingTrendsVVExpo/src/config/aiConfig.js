import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const AI_DEV_SERVER_PORT = 8787;

/**
 * hostUri / debuggerHost values look like "192.168.1.10:8081" or "[::1]:8081".
 */
function hostFromConnectionString(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.startsWith('[')) {
    const end = trimmed.indexOf(']');
    if (end !== -1) {
      return trimmed.slice(1, end);
    }
  }
  const colon = trimmed.lastIndexOf(':');
  if (colon > 0) {
    const hostPart = trimmed.slice(0, colon);
    if (!hostPart.includes(':')) {
      return hostPart;
    }
  }
  return trimmed;
}

function devMachineHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostFromConnectionString(hostUri);
  }
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost || Constants.manifest?.debuggerHost;
  if (debuggerHost) {
    return hostFromConnectionString(debuggerHost);
  }
  return null;
}

function defaultDevBaseUrl() {
  const lan = devMachineHost();

  if (lan && lan !== 'localhost' && lan !== '127.0.0.1') {
    return `http://${lan}:${AI_DEV_SERVER_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${AI_DEV_SERVER_PORT}`;
  }

  return `http://localhost:${AI_DEV_SERVER_PORT}`;
}

export const aiApiBaseUrl =
  process.env.EXPO_PUBLIC_AI_API_BASE_URL || defaultDevBaseUrl();

export const aiServerApiKey =
  process.env.EXPO_PUBLIC_AI_SERVER_API_KEY || 'vv-local-dev-key';

/**
 * How long to wait for the PC/server + OpenAI before using on-device estimates.
 * Keeps Detect usable instead of multi-minute failures.
 */
const DEFAULT_REMOTE_ATTEMPT_MS = 60000;
const MIN_REMOTE_ATTEMPT_MS = 30000;
const MAX_REMOTE_ATTEMPT_MS = 300000;

function parseRemoteAttemptMs() {
  const raw =
    process.env.EXPO_PUBLIC_AI_REMOTE_ATTEMPT_MS ||
    process.env.EXPO_PUBLIC_AI_REQUEST_TIMEOUT_MS;
  if (raw != null && String(raw).trim() !== '') {
    const n = Number.parseInt(String(raw), 10);
    if (Number.isFinite(n)) {
      return Math.min(
        MAX_REMOTE_ATTEMPT_MS,
        Math.max(MIN_REMOTE_ATTEMPT_MS, n),
      );
    }
  }
  return DEFAULT_REMOTE_ATTEMPT_MS;
}

export const aiRemoteAttemptTimeoutMs = parseRemoteAttemptMs();

/** Set EXPO_PUBLIC_AI_DISABLE_LOCAL_FALLBACK=1 to only use the remote API (stricter dev). */
export const aiLocalFallbackEnabled =
  process.env.EXPO_PUBLIC_AI_DISABLE_LOCAL_FALLBACK !== '1';
