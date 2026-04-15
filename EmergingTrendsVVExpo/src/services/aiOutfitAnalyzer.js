import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  AI_DEV_SERVER_PORT,
  aiApiBaseUrl,
  aiLocalFallbackEnabled,
  aiRemoteAttemptTimeoutMs,
  aiServerApiKey,
} from '../config/aiConfig';

/** Smaller uploads = faster Wi‑Fi transfer + faster vision API; still enough detail for clothing. */
const ANALYSIS_MAX_WIDTH = 1280;
const ANALYSIS_JPEG_QUALITY = 0.82;

const LOCAL_ITEM_TYPES = [
  'shirt',
  'pants',
  'jacket',
  'dress',
  'shoes',
  'skirt',
  'sweater',
];
const LOCAL_COLORS = [
  'navy',
  'cream',
  'olive',
  'grey',
  'brown',
  'white',
  'blue',
  'burgundy',
];
const LOCAL_MATERIALS = [
  'cotton',
  'linen blend',
  'wool blend',
  'denim',
  'leather mix',
  'viscose blend',
];
const LOCAL_STYLES_TRAVEL = [
  'casual layered',
  'weekend comfort',
  'street casual',
];
const LOCAL_STYLES_WORK = [
  'smart tailored',
  'polished professional',
  'refined office',
];

function hashString(text) {
  let hash = 0;
  const s = String(text || '');
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
}

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

/**
 * Same JSON shape as the Express `/api/analyze-outfit` handler (envelope + result).
 */
function buildLocalAnalysisEnvelope(imageUri, category) {
  const h = hashString(`${imageUri}|${category}|local`);
  const itemType = LOCAL_ITEM_TYPES[h % LOCAL_ITEM_TYPES.length];
  const color = LOCAL_COLORS[(h >> 3) % LOCAL_COLORS.length];
  const material = LOCAL_MATERIALS[(h >> 5) % LOCAL_MATERIALS.length];
  const isWork = String(category || '').toLowerCase() === 'work';
  const styles = isWork ? LOCAL_STYLES_WORK : LOCAL_STYLES_TRAVEL;
  const style = styles[(h >> 7) % styles.length];

  const featuresByItem = {
    shirt: ['breathable', 'easy to layer', 'wardrobe staple'],
    pants: ['versatile base', 'daily comfort', 'balanced silhouette'],
    jacket: ['layering-ready', 'structured outer layer'],
    dress: ['one-piece styling', 'occasion-flexible'],
    shoes: ['look-finishing', 'comfort-focused'],
    skirt: ['movement-friendly', 'day-to-evening'],
    sweater: ['soft texture', 'seasonal layering'],
  };

  const features = featuresByItem[itemType] || [
    'versatile',
    'closet essential',
  ];

  return {
    version: '1.0',
    provider: 'local-estimate',
    model: 'on-device-fallback',
    detectedAt: new Date().toISOString(),
    result: {
      itemType,
      color,
      secondaryColors: [],
      material,
      materialNotes: '',
      style,
      features,
      pattern: 'not analyzed remotely',
      occasion: isWork ? 'work' : 'travel',
      confidence: 0.42,
      reasoning:
        'The AI server did not finish in time. These labels are a quick on-device estimate from your photo metadata.',
      warnings: [
        'Estimated on device — live vision API did not finish in time. Use a faster network or run the AI server on your PC.',
      ],
    },
  };
}

async function postAnalyzeRequest(body, timeoutMs) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (aiServerApiKey) {
    headers['x-api-key'] = aiServerApiKey;
  }

  let response;
  try {
    response = await fetch(`${aiApiBaseUrl}/api/analyze-outfit`, {
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
      throw new Error(
        `Remote AI did not finish within ${sec}s (Wi‑Fi or model may be slow).`,
      );
    }
    throw err;
  }

  if (!response.ok) {
    const failureBody = await response.text();
    throw new Error(`AI service failed (${response.status}): ${failureBody}`);
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

export async function analyzeOutfitImage({ imageUri, category }) {
  const { imageBase64, mimeType } = await prepareImageForAnalysis(imageUri);
  const body = {
    imageBase64,
    mimeType,
    categoryHint: category,
  };
  const remoteMs = aiRemoteAttemptTimeoutMs;

  if (aiLocalFallbackEnabled) {
    try {
      const apiResponse = await postAnalyzeRequest(body, remoteMs);
      return normalizeAnalyzerResponse(apiResponse, category);
    } catch {
      const apiResponse = buildLocalAnalysisEnvelope(imageUri, category);
      return normalizeAnalyzerResponse(apiResponse, category);
    }
  }

  const apiResponse = await postAnalyzeRequest(body, remoteMs);
  return normalizeAnalyzerResponse(apiResponse, category);
}
