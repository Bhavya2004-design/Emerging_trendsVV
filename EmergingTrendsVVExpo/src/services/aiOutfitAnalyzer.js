const ITEM_KEYWORDS = {
  coat: ['coat', 'trench', 'overcoat', 'jacket'],
  shirt: ['shirt', 'tee', 'tshirt', 'top', 'blouse'],
  skirt: ['skirt'],
  pants: ['pant', 'jean', 'trouser', 'denim'],
  dress: ['dress', 'gown'],
  shoes: ['shoe', 'sneaker', 'heel', 'boot'],
};

const ITEM_FEATURES = {
  coat: ['layering-ready', 'structured silhouette', 'outerwear staple'],
  shirt: ['breathable', 'easy to style', 'smart-casual friendly'],
  skirt: ['feminine silhouette', 'day-to-evening', 'light movement'],
  pants: ['versatile base', 'balanced structure', 'daily comfort'],
  dress: ['one-piece styling', 'occasion-flexible', 'polished look'],
  shoes: ['look-finishing piece', 'style-defining', 'comfort critical'],
};

const MATERIAL_BY_ITEM = {
  coat: 'wool blend',
  shirt: 'cotton',
  skirt: 'linen blend',
  pants: 'denim',
  dress: 'viscose blend',
  shoes: 'leather mix',
};

const STYLE_BY_CATEGORY = {
  travel: 'casual layered',
  work: 'smart tailored',
};

const COLOR_POOL = ['beige', 'white', 'blue', 'olive', 'brown', 'cream', 'grey', 'navy'];
const FALLBACK_ITEM_POOL = ['shirt', 'pants', 'dress', 'skirt', 'shoes'];

function hashValue(text) {
  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 2147483647;
  }

  return Math.abs(hash);
}

function detectItemTypeFromUri(uri) {
  const normalized = (uri || '').toLowerCase();

  for (const [itemType, keywords] of Object.entries(ITEM_KEYWORDS)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      return itemType;
    }
  }

  const hash = hashValue(normalized || 'outfit');
  return FALLBACK_ITEM_POOL[hash % FALLBACK_ITEM_POOL.length];
}

function detectColorFromUri(uri) {
  const hash = hashValue(uri || 'outfit');
  return COLOR_POOL[hash % COLOR_POOL.length];
}

export async function processOutfitImage(imageUri) {
  // Placeholder for real AI image pipeline (crop + background removal).
  // Replace this with your backend (e.g. remove.bg, segmentation model, or custom CV API).
  await new Promise(resolve => setTimeout(resolve, 600));

  return {
    processedImageUri: imageUri,
    backgroundRemoved: true,
    cropApplied: true,
  };
}

export async function analyzeOutfitImage({ imageUri, category }) {
  // Placeholder for production AI classification and attribute extraction.
  // Replace with your model/API response when backend is connected.
  await new Promise(resolve => setTimeout(resolve, 750));

  const itemType = detectItemTypeFromUri(imageUri);
  const color = detectColorFromUri(imageUri);
  const material = MATERIAL_BY_ITEM[itemType] || 'fabric blend';
  const style = STYLE_BY_CATEGORY[category] || 'everyday casual';
  const features = ITEM_FEATURES[itemType] || ['versatile', 'closet essential'];

  return {
    itemType,
    color,
    material,
    style,
    features,
    occasion: category === 'work' ? 'workday' : 'travel and casual day',
  };
}
