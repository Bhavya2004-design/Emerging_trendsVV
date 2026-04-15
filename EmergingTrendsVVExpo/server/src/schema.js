import { z } from 'zod';

export const allowedItemTypes = [
  'coat',
  'jacket',
  'blazer',
  'shirt',
  'tshirt',
  'sweater',
  'hoodie',
  'dress',
  'skirt',
  'pants',
  'jeans',
  'shorts',
  'shoes',
  'boots',
  'bag',
  'accessory',
  'other',
];

export const allowedMaterials = [
  'cotton',
  'denim',
  'linen',
  'wool',
  'leather',
  'silk',
  'polyester',
  'viscose',
  'blend',
  'unknown',
];

export const allowedPatterns = [
  'solid',
  'striped',
  'checked',
  'floral',
  'graphic',
  'textured',
  'other',
  'unknown',
];

export const allowedOccasions = [
  'casual',
  'work',
  'travel',
  'formal',
  'sport',
  'party',
  'other',
];

export const analyzeRequestSchema = z.object({
  imageBase64: z.string().min(100, 'imageBase64 is too short'),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/i, 'mimeType must be jpeg/png/webp')
    .default('image/jpeg'),
  categoryHint: z.string().trim().optional(),
});

export const aiOutfitSchema = z.object({
  itemType: z.enum(allowedItemTypes),
  color: z.string().trim().min(2).max(40),
  secondaryColors: z.array(z.string().trim().min(2).max(40)).max(3).default([]),
  material: z.enum(allowedMaterials),
  materialNotes: z.string().trim().max(80).default(''),
  style: z.string().trim().min(2).max(50),
  features: z.array(z.string().trim().min(2).max(50)).min(1).max(6),
  pattern: z.enum(allowedPatterns),
  occasion: z.enum(allowedOccasions),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().trim().max(180).default(''),
  warnings: z.array(z.string().trim().min(2).max(100)).max(4).default([]),
});

export const aiResponseEnvelopeSchema = z.object({
  version: z.literal('1.0'),
  provider: z.string().trim().min(2),
  model: z.string().trim().min(2),
  detectedAt: z.string().datetime(),
  result: aiOutfitSchema,
});

export function toJsonSchemaForModel() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['version', 'provider', 'model', 'detectedAt', 'result'],
    properties: {
      version: { type: 'string', enum: ['1.0'] },
      provider: { type: 'string' },
      model: { type: 'string' },
      detectedAt: { type: 'string' },
      result: {
        type: 'object',
        additionalProperties: false,
        required: [
          'itemType',
          'color',
          'secondaryColors',
          'material',
          'materialNotes',
          'style',
          'features',
          'pattern',
          'occasion',
          'confidence',
          'reasoning',
          'warnings',
        ],
        properties: {
          itemType: { type: 'string', enum: allowedItemTypes },
          color: { type: 'string' },
          secondaryColors: {
            type: 'array',
            maxItems: 3,
            items: { type: 'string' },
          },
          material: { type: 'string', enum: allowedMaterials },
          materialNotes: { type: 'string' },
          style: { type: 'string' },
          features: {
            type: 'array',
            minItems: 1,
            maxItems: 6,
            items: { type: 'string' },
          },
          pattern: { type: 'string', enum: allowedPatterns },
          occasion: { type: 'string', enum: allowedOccasions },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          reasoning: { type: 'string' },
          warnings: {
            type: 'array',
            maxItems: 4,
            items: { type: 'string' },
          },
        },
      },
    },
  };
}
