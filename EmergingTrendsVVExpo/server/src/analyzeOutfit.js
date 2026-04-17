import OpenAI from 'openai';
import {
  aiResponseEnvelopeSchema,
  allowedOccasions,
  toJsonSchemaForModel,
} from './schema.js';
import { buildUserPrompt, systemPrompt } from './prompt.js';
import { analyzeOutfitWithVision } from './visionOutfitAnalyzer.js';
import {
  classifyFashionItemsWithHf,
  isHfFashionClassifierEnabled,
} from './fashionItemClassifier.js';

const openAiModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const aiMode = (process.env.AI_MODE || 'stub').toLowerCase();
const openAiApiKey = process.env.OPENAI_API_KEY || '';
const visionApiKey = String(process.env.GOOGLE_CLOUD_VISION_API_KEY || '').trim();
const hfPrimaryOverrideEnabled =
  String(process.env.HUGGINGFACE_ENABLE_PRIMARY_OVERRIDE || '0').trim() === '1';
const openAiTimeoutMs = Number.parseInt(
  process.env.OPENAI_TIMEOUT_MS || '280000',
  10,
);

const client = openAiApiKey
  ? new OpenAI({
      apiKey: openAiApiKey,
      timeout: Number.isFinite(openAiTimeoutMs) ? openAiTimeoutMs : 280000,
    })
  : null;

function clampConfidence(value) {
  if (!Number.isFinite(value)) {
    return 0.5;
  }
  return Math.max(0, Math.min(1, value));
}

function normalizeEnvelope(candidate, provider, model) {
  const parsed = aiResponseEnvelopeSchema.safeParse(candidate);

  if (parsed.success) {
    return parsed.data;
  }

  const now = new Date().toISOString();
  const fallbackResult = {
    itemType: candidate?.result?.itemType || candidate?.itemType || 'other',
    relatedItemTypes:
      candidate?.result?.relatedItemTypes || candidate?.relatedItemTypes || [],
    color: candidate?.result?.color || candidate?.color || 'unknown',
    secondaryColors:
      candidate?.result?.secondaryColors || candidate?.secondaryColors || [],
    material: candidate?.result?.material || candidate?.material || 'unknown',
    materialNotes:
      candidate?.result?.materialNotes || candidate?.materialNotes || '',
    style: candidate?.result?.style || candidate?.style || 'everyday',
    features: candidate?.result?.features || candidate?.features || ['unspecified'],
    pattern: candidate?.result?.pattern || candidate?.pattern || 'unknown',
    occasion: allowedOccasions.includes(candidate?.result?.occasion)
      ? candidate.result.occasion
      : 'other',
    confidence: clampConfidence(candidate?.result?.confidence ?? candidate?.confidence),
    reasoning: candidate?.result?.reasoning || candidate?.reasoning || '',
    warnings: candidate?.result?.warnings || candidate?.warnings || [],
  };

  return aiResponseEnvelopeSchema.parse({
    version: '1.0',
    provider,
    model,
    detectedAt: now,
    result: fallbackResult,
  });
}

function unconfiguredEnvelope(categoryHint) {
  const normalizedHint = (categoryHint || '').toLowerCase();
  const occasion =
    normalizedHint === 'travel'
      ? 'travel'
      : normalizedHint === 'work'
        ? 'work'
        : 'other';

  return normalizeEnvelope(
    {
      version: '1.0',
      provider: 'unconfigured',
      model: 'none',
      detectedAt: new Date().toISOString(),
      result: {
        itemType: 'other',
        relatedItemTypes: [],
        color: 'unknown',
        secondaryColors: [],
        material: 'unknown',
        materialNotes: '',
        style: 'unavailable',
        features: ['Configure Vision or OpenAI on the AI server'],
        pattern: 'unknown',
        occasion,
        confidence: 0,
        reasoning: '',
        warnings: [
          'Set GOOGLE_CLOUD_VISION_API_KEY, or HUGGINGFACE_API_KEY, or AI_MODE=openai with OPENAI_API_KEY.',
        ],
      },
    },
    'unconfigured',
    'none',
  );
}

function mergeItemTypes(baseEnvelope, hfItems) {
  if (!hfItems) {
    return baseEnvelope;
  }

  const merged = structuredClone(baseEnvelope);
  const currentPrimary = merged.result.itemType;
  const shouldPromoteHfPrimary =
    hfPrimaryOverrideEnabled &&
    (currentPrimary === 'other' ||
      (merged.result.confidence < 0.5 && hfItems.confidence >= 0.72));

  if (shouldPromoteHfPrimary) {
    merged.result.itemType = hfItems.primaryItemType;
  }

  const related = new Set([
    ...(Array.isArray(merged.result.relatedItemTypes)
      ? merged.result.relatedItemTypes
      : []),
    ...(Array.isArray(hfItems.relatedItemTypes) ? hfItems.relatedItemTypes : []),
  ]);

  related.delete(merged.result.itemType);
  related.delete('other');
  merged.result.relatedItemTypes = [...related].slice(0, 4);

  if (shouldPromoteHfPrimary) {
    merged.result.confidence = Math.max(
      merged.result.confidence,
      Math.min(0.95, hfItems.confidence * 0.92),
    );
  }
  merged.result.reasoning = String(merged.result.reasoning || '').trim();
  merged.result.reasoning = merged.result.reasoning
    ? `${merged.result.reasoning} + hf-fashion-labels${shouldPromoteHfPrimary ? '(primary)' : '(related)'}` 
    : `hf-fashion-labels${shouldPromoteHfPrimary ? '(primary)' : '(related)'}`;
  merged.model = `${merged.model}+hf-fashion`;

  return merged;
}

export async function analyzeOutfit({ imageBase64, mimeType, categoryHint }) {
  if (visionApiKey) {
    const visionResult = await analyzeOutfitWithVision(
      { imageBase64, categoryHint },
      visionApiKey,
    );
    const baseEnvelope = normalizeEnvelope(
      visionResult,
      'google-cloud-vision',
      'label+color+objects-v1',
    );
    if (!isHfFashionClassifierEnabled()) {
      return baseEnvelope;
    }
    try {
      const hfItems = await classifyFashionItemsWithHf({ imageBase64, mimeType });
      return mergeItemTypes(baseEnvelope, hfItems);
    } catch {
      return baseEnvelope;
    }
  }

  if (aiMode === 'openai') {
    if (!client) {
      throw new Error('AI_MODE=openai but OPENAI_API_KEY is missing');
    }

    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    const completion = await client.chat.completions.create({
      model: openAiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: buildUserPrompt(categoryHint),
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'outfit_analysis_response',
          strict: true,
          schema: toJsonSchemaForModel(),
        },
      },
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Model returned empty response content');
    }

    const parsed = JSON.parse(content);
    return normalizeEnvelope(parsed, 'openai', openAiModel);
  }

  return unconfiguredEnvelope(categoryHint);
}
