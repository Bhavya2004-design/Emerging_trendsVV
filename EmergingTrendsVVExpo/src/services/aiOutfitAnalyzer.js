import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import {
  AI_DEV_SERVER_PORT,
  aiApiBaseUrl,
  aiLocalFallbackEnabled,
  aiRemoteAttemptTimeoutMs,
  aiScanUrlBlockedByExpoTunnel,
  aiServerApiKey,
  isLikelyIphoneHotspotClientDevUrl,
} from '../config/aiConfig';

/** Resize for upload: smaller payload = fewer timeouts on phone → dev server. */
const ANALYSIS_MAX_WIDTH = 1024;
const ANALYSIS_JPEG_QUALITY = 0.85;

function toTitleCase(value) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }

  return normalized
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function withTimeoutSignal(ms) {
  if (
    typeof AbortSignal !== 'undefined' &&
    typeof AbortSignal.timeout === 'function'
  ) {
    return AbortSignal.timeout(ms);
  }

  return undefined;
}

async function prepareImageForAnalysis(imageUri) {
  if (!imageUri) {
    throw new Error('Image URI is required for AI detection');
  }

  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: ANALYSIS_MAX_WIDTH } }],
    {
      compress: ANALYSIS_JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
    encoding: 'base64',
  });

  try {
    await FileSystem.deleteAsync(manipulated.uri, { idempotent: true });
  } catch {
    // temp cleanup is best-effort
  }

  return { imageBase64: base64, mimeType: 'image/jpeg' };
}

function clipWarningLine(text, maxLen = 100) {
  const s = String(text || '').trim();
  if (s.length <= maxLen) {
    return s;
  }
  return `${s.slice(0, maxLen - 1)}…`;
}

function joinUrl(baseUrl, endpointPath) {
  const base = String(baseUrl || '').replace(/\/+$/, '');
  const path = String(endpointPath || '').replace(/^\/+/, '');
  return `${base}/${path}`;
}

function isNgrokUrl(url) {
  return /\.ngrok(-free)?\.app\b|\.ngrok(-free)?\.dev\b|\.ngrok\.io\b/i.test(
    String(url || ''),
  );
}

/**
 * Same JSON shape as `/api/analyze-outfit`. Honest placeholders when the server is unreachable.
 */
function buildOfflineFallbackEnvelope(category, remoteError) {
  const hint = String(category || '').toLowerCase();
  const occasion =
    hint === 'work' ? 'work' : hint === 'travel' ? 'travel' : 'other';

  const errMsg =
    remoteError instanceof Error ? remoteError.message : String(remoteError || '');
  const targetHint = aiScanUrlBlockedByExpoTunnel
    ? 'Expo tunnel (*.exp.direct) does not expose port 8787. Set EXPO_PUBLIC_AI_API_BASE_URL=http://YOUR_PC_LAN_IP:8787 in EmergingTrendsVVExpo/.env (ipconfig), then npx expo start -c.'
    : `Target URL: ${aiApiBaseUrl} — phone and PC must be on the same Wi‑Fi (cellular alone often fails).`;
  const warnings = [
    clipWarningLine(
      errMsg.trim() ||
        'Could not reach your outfit AI server; photo was not sent to Google Vision.',
      200,
    ),
    clipWarningLine(targetHint, 200),
    clipWarningLine(
      `On your PC run the server: EmergingTrendsVVExpo/server → npm run dev (port ${AI_DEV_SERVER_PORT}). Allow that port in Windows Firewall.`,
    ),
    'Optional: set EXPO_PUBLIC_AI_API_BASE_URL to http://YOUR_PC_LAN_IP:8787 in a .env file.',
  ].filter(w => w.length >= 2);

  return {
    version: '1.0',
    provider: 'offline',
    model: 'none',
    detectedAt: new Date().toISOString(),
    result: {
      itemType: 'other',
      color: 'unknown',
      secondaryColors: [],
      material: 'unknown',
      materialNotes: '',
      style: 'unavailable offline',
      features: ['Analysis requires the AI server (Vision or OpenAI)'],
      pattern: 'unknown',
      occasion,
      confidence: 0,
      reasoning: '',
      warnings: warnings.slice(0, 4),
    },
  };
}

async function postAnalyzeRequest(body, timeoutMs) {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Bypass ngrok browser interstitial when calling API endpoints programmatically.
  if (isNgrokUrl(aiApiBaseUrl)) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }

  if (aiServerApiKey) {
    headers['x-api-key'] = aiServerApiKey;
  }

  let response;
  try {
    response = await fetch(joinUrl(aiApiBaseUrl, '/api/analyze-outfit'), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: withTimeoutSignal(timeoutMs),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/network request failed/i.test(msg)) {
      throw new Error(
        `Cannot reach AI server at ${aiApiBaseUrl}. Run EmergingTrendsVVExpo/server (npm run dev), same Wi‑Fi, firewall port ${AI_DEV_SERVER_PORT}.`,
      );
    }
    if (/timed out|timeout|aborted/i.test(msg)) {
      const sec = Math.round(timeoutMs / 1000);
      let detail = `Remote AI did not finish within ${sec}s (server slow or network blocked).`;
      if (Platform.OS === 'ios' && isLikelyIphoneHotspotClientDevUrl(aiApiBaseUrl)) {
        detail += ` On iPhone Personal Hotspot, ${aiApiBaseUrl} often never connects—use Windows Mobile Hotspot on the laptop and EXPO_PUBLIC_AI_API_BASE_URL to that PC IP.`;
      }
      throw new Error(detail);
    }
    throw err;
  }

  if (!response.ok) {
    const failureBody = await response.text();
    throw new Error(`AI service failed (${response.status}): ${failureBody}`);
  }

  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    const raw = await response.text();
    const snippet = raw.replace(/\s+/g, ' ').trim().slice(0, 220);
    if (/ngrok/i.test(raw) && /visit site|browser warning|you are about to visit/i.test(raw)) {
      throw new Error(
        'Ngrok browser warning page was returned instead of API JSON. Ensure requests include ngrok-skip-browser-warning header and that Expo is using the latest bundle.',
      );
    }
    throw new Error(
      `AI service returned non-JSON response (${contentType || 'unknown content-type'}): ${snippet || 'empty response'}`,
    );
  }

  return response.json();
}

function normalizeAnalyzerResponse(apiResponse, category) {
  const result = apiResponse?.result || {};
  const secondaryColors = Array.isArray(result.secondaryColors)
    ? result.secondaryColors.filter(Boolean)
    : [];

  const color = [result.color, ...secondaryColors].filter(Boolean).join(', ');
  const materialNotes = String(result.materialNotes || '').trim();

  return {
    itemType: String(result.itemType || '').trim().toLowerCase(),
    color: color || 'unknown',
    material: materialNotes
      ? `${result.material} (${materialNotes})`
      : result.material || 'unknown',
    style: String(result.style || '').trim() || 'everyday',
    features:
      Array.isArray(result.features) && result.features.length > 0
        ? result.features
        : ['unspecified'],
    occasion: String(result.occasion || '').trim() || category || 'other',
    pattern: String(result.pattern || '').trim(),
    confidence: Number.isFinite(result.confidence) ? result.confidence : null,
    reasoning: String(result.reasoning || '').trim(),
    warnings: Array.isArray(result.warnings) ? result.warnings : [],
    provider: String(apiResponse?.provider || '').trim(),
    model: String(apiResponse?.model || '').trim(),
    detectedAt: String(apiResponse?.detectedAt || '').trim(),
    displayItemType: toTitleCase(result.itemType),
  };
}

export async function processOutfitImage(imageUri) {
  return {
    processedImageUri: imageUri,
    backgroundRemoved: false,
    cropApplied: false,
  };
}

const EXPO_TUNNEL_BLOCK_MSG =
  'Expo tunnel (*.exp.direct) only forwards Metro (JS) on ~8081, not your outfit AI server on 8787. Add EmergingTrendsVVExpo/.env: EXPO_PUBLIC_AI_API_BASE_URL=http://YOUR_PC_LAN_IP:8787 (Windows: ipconfig → Wireless LAN IPv4). Restart Expo with npx expo start -c.';

const IPHONE_HOTSPOT_HOST_BLOCK_MSG =
  'This scan URL uses 172.20.10.x (laptop tethered to iPhone Personal Hotspot). iOS usually cannot route HTTP from the hosting phone to that laptop, so requests hang or fail. Use Windows Mobile Hotspot on the laptop, join from the iPhone, run ipconfig, set EXPO_PUBLIC_AI_API_BASE_URL to that adapter IPv4 with :8787 (often 192.168.137.1), then restart Expo.';

export async function analyzeOutfitImage({ imageUri, category }) {
  const { imageBase64, mimeType } = await prepareImageForAnalysis(imageUri);
  const body = {
    imageBase64,
    mimeType,
    categoryHint: category,
  };
  const remoteMs = aiRemoteAttemptTimeoutMs;

  if (aiScanUrlBlockedByExpoTunnel) {
    if (aiLocalFallbackEnabled) {
      return normalizeAnalyzerResponse(
        buildOfflineFallbackEnvelope(category, new Error(EXPO_TUNNEL_BLOCK_MSG)),
        category,
      );
    }
    throw new Error(EXPO_TUNNEL_BLOCK_MSG);
  }

  const iphoneHotspotHostIssue =
    Platform.OS === 'ios' && isLikelyIphoneHotspotClientDevUrl(aiApiBaseUrl);

  if (iphoneHotspotHostIssue) {
    if (aiLocalFallbackEnabled) {
      return normalizeAnalyzerResponse(
        buildOfflineFallbackEnvelope(category, new Error(IPHONE_HOTSPOT_HOST_BLOCK_MSG)),
        category,
      );
    }
    throw new Error(IPHONE_HOTSPOT_HOST_BLOCK_MSG);
  }

  if (aiLocalFallbackEnabled) {
    try {
      const apiResponse = await postAnalyzeRequest(body, remoteMs);
      return normalizeAnalyzerResponse(apiResponse, category);
    } catch (err) {
      const apiResponse = buildOfflineFallbackEnvelope(category, err);
      return normalizeAnalyzerResponse(apiResponse, category);
    }
  }

  const apiResponse = await postAnalyzeRequest(body, remoteMs);
  return normalizeAnalyzerResponse(apiResponse, category);
}
