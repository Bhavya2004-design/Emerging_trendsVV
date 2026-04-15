import {
  allowedItemTypes,
  allowedMaterials,
  allowedOccasions,
  allowedPatterns,
} from './schema.js';

export const systemPrompt = `You are a fashion item vision analyst.
Return STRICT JSON only.
Do not include markdown, prose, or extra keys.
You must follow the schema exactly.`;

export function buildUserPrompt(categoryHint = '') {
  return [
    'Task: Analyze one clothing-focused image and extract garment metadata.',
    '',
    'Rules:',
    '- Prefer the dominant garment in frame.',
    '- If multiple garments are visible, choose the central/foreground one and add a warning.',
    '- Be conservative: use unknown/other instead of hallucinating.',
    '- Use lowercase labels for enums and color names.',
    '- confidence must be 0 to 1 and reflect visual certainty.',
    '- features should be visually verifiable traits only.',
    '',
    `Allowed itemType: ${allowedItemTypes.join(', ')}`,
    `Allowed material: ${allowedMaterials.join(', ')}`,
    `Allowed pattern: ${allowedPatterns.join(', ')}`,
    `Allowed occasion: ${allowedOccasions.join(', ')}`,
    '',
    categoryHint
      ? `Category hint from app: ${String(categoryHint).trim().toLowerCase()}`
      : 'Category hint from app: none',
  ].join('\n');
}
