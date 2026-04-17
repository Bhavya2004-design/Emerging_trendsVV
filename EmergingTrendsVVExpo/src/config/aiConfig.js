import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const AI_DEV_SERVER_PORT = 8787;
const FIXED_AI_API_BASE_URL = 'https://ladylike-elk-playmate.ngrok-free.dev';

/**
 * iPhone **Personal Hotspot** often assigns the laptop `172.20.10.x`. Expo may use that IP for
 * `EXPO_PUBLIC_AI_API_BASE_URL` / Metro, but **iOS usually will not route HTTP from the same
 * iPhone that is hosting the hotspot back to a tethered laptop** at that address—so scan fails.
 *
 * Reliable fixes: (1) Turn on **Mobile Hotspot on the Windows laptop** and join from the phone,
 * then set `EXPO_PUBLIC_AI_API_BASE_URL` to `http://192.168.137.1:8787` (or your `ipconfig` IPv4
 * on that adapter). (2) Or expose port 8787 with **ngrok** / **Cloudflare Tunnel** and point the app there.
 */

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

/**
 * `npx expo start --tunnel` sets hostUri to *.exp.direct — that tunnel only reaches Metro (~8081),
 * not arbitrary ports on your PC. `http://xxx.exp.direct:8787` will not hit the outfit AI server.
 */
function isTunnelMetroHostname(host) {
  if (!host || typeof host !== 'string') {
    return false;
  }
  const h = host.toLowerCase();
  return (
    h.includes('.exp.direct') ||
    h.includes('.exp.host') ||
    h.includes('ngrok-free.app') ||
    h.includes('.ngrok.io')
  );
}

function defaultDevBaseUrl() {
  const lan = devMachineHost();

  if (lan && isTunnelMetroHostname(lan)) {
    return null;
  }

  if (lan && lan !== 'localhost' && lan !== '127.0.0.1') {
    return `http://${lan}:${AI_DEV_SERVER_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${AI_DEV_SERVER_PORT}`;
  }

  return FIXED_AI_API_BASE_URL;
}

const explicitAiApiBase = String(
  process.env.EXPO_PUBLIC_AI_API_BASE_URL || '',
).trim();

/** True when Metro uses a tunnel host and the app has no explicit LAN URL for the AI server. */
export const aiScanUrlBlockedByExpoTunnel =
  !explicitAiApiBase &&
  Boolean(devMachineHost() && isTunnelMetroHostname(devMachineHost()));

export const aiApiBaseUrl = (() => {
  if (explicitAiApiBase) {
    return explicitAiApiBase.replace(/\/+$/, '');
  }
  const d = defaultDevBaseUrl();
  if (d) {
    return d;
  }
  return FIXED_AI_API_BASE_URL;
})();

/** True when the URL points at Apple's Personal Hotspot client range (laptop as client). */
export function isLikelyIphoneHotspotClientDevUrl(url) {
  return /https?:\/\/172\.20\.10\.\d+(?::\d+)?/i.test(String(url || ''));
}

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
