import OpenAI from 'openai';
import {
  aiResponseEnvelopeSchema,
  allowedOccasions,
  toJsonSchemaForModel,
} from './schema.js';
import { buildUserPrompt, systemPrompt } from './prompt.js';

const openAiModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const aiMode = (process.env.AI_MODE || 'stub').toLowerCase();
const openAiApiKey = process.env.OPENAI_API_KEY || '';
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

  // Defensive normalization in case the model omits wrapper fields.
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

function stubAnalysis({ categoryHint }) {
  const normalizedHint = (categoryHint || '').toLowerCase();
  const occasion = normalizedHint === 'travel' ? 'travel' : normalizedHint === 'work' ? 'work' : 'casual';

  return {
    version: '1.0',
    provider: 'stub',
    model: 'deterministic-demo',
    detectedAt: new Date().toISOString(),
    result: {
      itemType: 'shirt',
      color: 'white',
      secondaryColors: ['blue'],
      material: 'cotton',
      materialNotes: 'smooth weave, likely cotton blend',
      style: 'smart casual',
      features: ['collared neckline', 'button placket', 'long sleeves'],
      pattern: 'solid',
      occasion,
      confidence: 0.62,
      reasoning: 'single upper-body garment is dominant in frame',
      warnings: ['stub mode enabled; replace with live model for production'],
    },
  };
}

export async function analyzeOutfit({ imageBase64, mimeType, categoryHint }) {
  if (aiMode !== 'openai') {
    return stubAnalysis({ categoryHint });
  }

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
