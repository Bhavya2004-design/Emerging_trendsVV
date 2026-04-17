import { InferenceClient } from '@huggingface/inference';
import { allowedItemTypes } from './schema.js';

const hfApiKey = String(process.env.HUGGINGFACE_API_KEY || '').trim();
const hfModel =
  String(process.env.HUGGINGFACE_MODEL || '').trim() ||
  'openai/clip-vit-large-patch14-336';

const hfClient = hfApiKey ? new InferenceClient(hfApiKey) : null;

const ITEM_TYPE_LABELS = {
  coat: ['coat', 'overcoat'],
  jacket: ['jacket', 'outerwear'],
  blazer: ['blazer', 'suit jacket'],
  shirt: ['shirt', 'button-up shirt', 'blouse'],
  tshirt: ['t-shirt', 'tee shirt'],
  sweater: ['sweater', 'jumper', 'knit top'],
  hoodie: ['hoodie', 'hooded sweatshirt'],
  dress: ['dress'],
  skirt: ['skirt'],
  pants: ['pants', 'trousers'],
  jeans: ['jeans', 'denim pants'],
  shorts: ['shorts'],
  shoes: ['shoes', 'sneakers', 'footwear'],
  boots: ['boots'],
  bag: ['bag', 'handbag', 'backpack'],
  accessory: ['accessory', 'belt', 'hat', 'scarf'],
};

const LABEL_TO_ITEM_TYPE = (() => {
  const out = {};
  for (const [itemType, labels] of Object.entries(ITEM_TYPE_LABELS)) {
    for (const label of labels) {
      out[label] = itemType;
    }
  }
  return out;
})();

const CANDIDATE_LABELS = [...new Set(Object.values(ITEM_TYPE_LABELS).flat())];

function cleanItemType(value) {
  const v = String(value || '').trim().toLowerCase();
  if (allowedItemTypes.includes(v)) {
    return v;
  }
  return 'other';
}

function mapLabelToType(label) {
  const key = String(label || '').trim().toLowerCase();
  return cleanItemType(LABEL_TO_ITEM_TYPE[key] || key);
}

export function isHfFashionClassifierEnabled() {
  return Boolean(hfClient);
}

export async function classifyFashionItemsWithHf({ imageBase64, mimeType }) {
  if (!hfClient) {
    return null;
  }

  const buffer = Buffer.from(String(imageBase64 || ''), 'base64');
  const imageBlob = new Blob([buffer], { type: mimeType || 'image/jpeg' });

  const results = await hfClient.zeroShotImageClassification({
    model: hfModel,
    inputs: { image: imageBlob },
    parameters: {
      candidate_labels: CANDIDATE_LABELS,
    },
  });

  const ranked = (Array.isArray(results) ? results : [])
    .map(row => ({
      itemType: mapLabelToType(row?.label),
      score: Number(row?.score) || 0,
    }))
    .filter(row => row.itemType !== 'other')
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) {
    return null;
  }

  const primary = ranked[0];
  const related = [];
  for (const row of ranked.slice(1)) {
    if (!related.includes(row.itemType) && row.score >= 0.2) {
      related.push(row.itemType);
    }
    if (related.length >= 4) {
      break;
    }
  }

  return {
    primaryItemType: primary.itemType,
    relatedItemTypes: related,
    confidence: Math.max(0, Math.min(1, primary.score)),
    model: hfModel,
  };
}
