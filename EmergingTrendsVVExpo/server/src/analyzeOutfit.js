import OpenAI from 'openai';
import {
  aiResponseEnvelopeSchema,
  allowedOccasions,
  toJsonSchemaForModel,
} from './schema.js';
import { buildUserPrompt, systemPrompt } from './prompt.js';
import { analyzeOutfitWithVision } from './visionOutfitAnalyzer.js';

const openAiModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const aiMode = (process.env.AI_MODE || 'stub').toLowerCase();
const openAiApiKey = process.env.OPENAI_API_KEY || '';
const visionApiKey = String(process.env.GOOGLE_CLOUD_VISION_API_KEY || '').trim();
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
          'Set GOOGLE_CLOUD_VISION_API_KEY (recommended) or AI_MODE=openai with OPENAI_API_KEY.',
        ],
      },
    },
    'unconfigured',
    'none',
  );
}

export async function analyzeOutfit({ imageBase64, mimeType, categoryHint }) {
  if (visionApiKey) {
    const visionResult = await analyzeOutfitWithVision(
      { imageBase64, categoryHint },
      visionApiKey,
    );
    return normalizeEnvelope(visionResult, 'google-cloud-vision', 'label+color+objects-v1');
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
