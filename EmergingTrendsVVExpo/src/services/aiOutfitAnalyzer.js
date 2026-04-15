import * as FileSystem from 'expo-file-system/legacy';
import { aiApiBaseUrl, aiServerApiKey } from '../config/aiConfig';

const DEFAULT_TIMEOUT_MS = 30000;

function inferMimeTypeFromUri(uri) {
  const normalized = String(uri || '').toLowerCase();

  if (normalized.endsWith('.png')) {
    return 'image/png';
  }

  if (normalized.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
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
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }

  return undefined;
}

async function readImageAsBase64(imageUri) {
  if (!imageUri) {
    throw new Error('Image URI is required for AI detection');
  }

  return FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });
}

async function postAnalyzeRequest(body) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (aiServerApiKey) {
    headers['x-api-key'] = aiServerApiKey;
  }

  const response = await fetch(`${aiApiBaseUrl}/api/analyze-outfit`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: withTimeoutSignal(DEFAULT_TIMEOUT_MS),
  });

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
    material: materialNotes ? `${result.material} (${materialNotes})` : result.material || 'unknown',
    style: String(result.style || '').trim() || 'everyday',
    features: Array.isArray(result.features) && result.features.length > 0
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
  const imageBase64 = await readImageAsBase64(imageUri);
  const mimeType = inferMimeTypeFromUri(imageUri);

  const apiResponse = await postAnalyzeRequest({
    imageBase64,
    mimeType,
    categoryHint: category,
  });

  return normalizeAnalyzerResponse(apiResponse, category);
}