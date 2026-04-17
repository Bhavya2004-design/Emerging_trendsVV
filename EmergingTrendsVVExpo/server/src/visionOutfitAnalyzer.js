import namer from 'color-namer';
import { colornames } from 'color-name-list';
import { partial_ratio, token_set_ratio } from 'fuzzball';

/** Vision label phrases → schema `itemType` (fuzzball picks best match). */
const ITEM_TYPE_SYNONYMS = {
  coat: ['coat', 'overcoat', 'topcoat', 'winter coat', 'greatcoat'],
  jacket: ['jacket', 'bomber jacket', 'windbreaker', 'parka', 'anorak', 'outerwear'],
  blazer: ['blazer', 'suit jacket', 'sports coat'],
  shirt: ['shirt', 'dress shirt', 'button-up', 'button up', 'blouse', 'oxford shirt', 'collared shirt'],
  tshirt: ['t-shirt', 'tshirt', 'tee', 'tee shirt', 'polo shirt', 'polo neck', 'jersey'],
  sweater: ['sweater', 'jumper', 'pullover', 'cardigan', 'knitwear', 'knit'],
  hoodie: [
    'hoodie',
    'hooded sweatshirt',
    'sweatshirt',
    'hooded',
    'pullover hoodie',
    'zip hoodie',
    'fleece hoodie',
    'fleece',
    'activewear',
    'sportswear',
    'drawstring',
    'kangaroo pocket',
  ],
  dress: ['dress', 'gown', 'frock'],
  skirt: ['skirt', 'miniskirt', 'midi skirt'],
  pants: ['pants', 'trousers', 'slacks', 'chinos', 'khakis', 'cargo pants', 'leggings'],
  jeans: ['jeans', 'denim', 'blue jeans'],
  shorts: ['shorts', 'bermuda shorts'],
  shoes: [
    'shoe',
    'shoes',
    'footwear',
    'sneaker',
    'sneakers',
    'loafer',
    'oxford shoe',
    'high heels',
    'heel',
    'sandal',
    'slipper',
  ],
  boots: ['boot', 'boots', 'work boot', 'hiking boot', 'chelsea boot', 'ankle boot'],
  bag: ['bag', 'handbag', 'purse', 'tote', 'backpack', 'satchel', 'clutch'],
  accessory: ['belt', 'scarf', 'hat', 'cap', 'watch', 'jewelry', 'sunglasses', 'glove', 'tie', 'necktie'],
};

const MATERIAL_RULES = [
  { material: 'leather', keys: ['leather', 'suede'] },
  { material: 'denim', keys: ['denim', 'jeans'] },
  { material: 'wool', keys: ['wool', 'tweed', 'cashmere'] },
  { material: 'silk', keys: ['silk', 'satin'] },
  { material: 'linen', keys: ['linen'] },
  { material: 'cotton', keys: ['cotton', 'canvas', 'twill'] },
  { material: 'polyester', keys: ['polyester', 'nylon', 'spandex', 'lycra', 'synthetic', 'fleece'] },
  { material: 'viscose', keys: ['viscose', 'rayon', 'modal'] },
];

const PATTERN_RULES = [
  { pattern: 'striped', keys: ['stripe', 'striped'] },
  { pattern: 'checked', keys: ['check', 'plaid', 'tartan', 'gingham'] },
  { pattern: 'floral', keys: ['floral', 'flower'] },
  { pattern: 'graphic', keys: ['graphic', 'logo', 'print', 'typography'] },
  { pattern: 'textured', keys: ['texture', 'ribbed', 'quilted', 'mesh', 'lace', 'knit', 'embroider'] },
];

const TYPE_MATCH_THRESHOLD = 68;
const COLOR_NAME_CANON = {
  gray: 'grey',
  maroon: 'burgundy',
  tan: 'beige',
};
const KNOWN_COLOR_NAMES = [...new Set(
  colornames
    .map(entry => String(entry?.name || '').trim().toLowerCase())
    .filter(Boolean)
    .map(name => name.replace(/[^a-z0-9]+/g, ' ').trim())
    .filter(Boolean)
    .filter(name => name.length <= 40),
)].sort((a, b) => b.length - a.length);

function normalizePhrase(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function includesWholePhrase(haystack, phrase) {
  if (!haystack || !phrase) {
    return false;
  }
  return ` ${haystack} `.includes(` ${phrase} `);
}

function normalizeRgbComponent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  if (value >= 0 && value <= 1) {
    return Math.round(value * 255);
  }
  return Math.round(Math.max(0, Math.min(255, value)));
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function hexDistance(a, b) {
  if (!a || !b || a.length < 7 || b.length < 7) {
    return 0;
  }
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  return Math.sqrt(pa.reduce((s, v, i) => s + (v - pb[i]) ** 2, 0));
}

function colorNameFromHex(hex) {
  const results = namer(hex);
  const pick =
    results.basic?.[0]?.name ||
    results.html?.[0]?.name ||
    results.ntc?.[0]?.name ||
    'grey';
  return String(pick).toLowerCase().slice(0, 40);
}

function dominantColorFromVision(colors) {
  if (!colors?.length) {
    return { name: 'unknown', hex: '#808080', sorted: [] };
  }

  const sorted = [...colors].sort((a, b) => {
    const fa = a.pixelFraction ?? a.score ?? 0;
    const fb = b.pixelFraction ?? b.score ?? 0;
    return fb - fa;
  });

  const first = sorted[0];
  const c = first.color || {};
  const r = normalizeRgbComponent(c.red);
  const g = normalizeRgbComponent(c.green);
  const b = normalizeRgbComponent(c.blue);
  const hex = rgbToHex(r, g, b);

  return { name: colorNameFromHex(hex), hex, sorted };
}

function secondaryColorsFromVision(sorted, primaryHex, primaryName) {
  const out = [];
  for (const entry of sorted.slice(1)) {
    const c = entry.color || {};
    const r = normalizeRgbComponent(c.red);
    const g = normalizeRgbComponent(c.green);
    const b = normalizeRgbComponent(c.blue);
    const hex = rgbToHex(r, g, b);
    if (primaryHex && hexDistance(hex, primaryHex) < 28) {
      continue;
    }
    const nm = colorNameFromHex(hex);
    if (nm === primaryName) {
      continue;
    }
    out.push(nm);
    if (out.length >= 2) {
      break;
    }
  }
  return out;
}

function extractLabelColors(labels) {
  const hits = [];
  for (const label of labels) {
    const text = normalizePhrase(label.description);
    let matchesForLabel = 0;
    for (const knownColor of KNOWN_COLOR_NAMES) {
      if (!includesWholePhrase(text, knownColor)) {
        continue;
      }
      const canonical = COLOR_NAME_CANON[knownColor] || knownColor;
      hits.push({ color: canonical, score: Number(label.score) || 0 });
      matchesForLabel += 1;
      // Keep only the strongest 2 color hits per label.
      if (matchesForLabel >= 2) {
        break;
      }
    }
  }
  return hits;
}

function mergeColorSignals(labels, dominant) {
  const labelHits = extractLabelColors(labels).sort((a, b) => b.score - a.score);
  if (!labelHits.length) {
    return {
      color: dominant.name,
      secondary: secondaryColorsFromVision(
        dominant.sorted.length ? dominant.sorted : [],
        dominant.hex,
        dominant.name,
      ),
    };
  }

  const primary = labelHits[0].color;
  const secondary = [];
  for (const hit of labelHits.slice(1)) {
    if (hit.color !== primary && !secondary.includes(hit.color)) {
      secondary.push(hit.color);
    }
    if (secondary.length >= 2) {
      break;
    }
  }

  if (!secondary.includes(dominant.name) && dominant.name !== primary && dominant.name !== 'unknown') {
    secondary.push(dominant.name);
  }

  return {
    color: primary,
    secondary: secondary.slice(0, 2),
  };
}

function inferMaterial(labelTexts) {
  const joined = labelTexts.join(' ').toLowerCase();
  const hits = [];
  for (const rule of MATERIAL_RULES) {
    for (const k of rule.keys) {
      if (joined.includes(k)) {
        hits.push(rule.material);
      }
    }
  }
  const uniq = [...new Set(hits)];
  if (uniq.length === 0) {
    return 'unknown';
  }
  if (uniq.length >= 2) {
    return 'blend';
  }
  return uniq[0];
}

function inferPattern(labelTexts) {
  const joined = labelTexts.join(' ').toLowerCase();
  for (const rule of PATTERN_RULES) {
    for (const k of rule.keys) {
      if (joined.includes(k)) {
        return rule.pattern;
      }
    }
  }
  if (/\b(solid|plain|monochrome|one[\s-]?color)\b/.test(joined)) {
    return 'solid';
  }
  return 'unknown';
}

function applyHoodieHeuristics(labelDescriptions, itemType, score) {
  const joined = labelDescriptions.join(' ').toLowerCase();
  const strongHoodie =
    /\bhoodie\b/.test(joined) ||
    /\bhooded sweatshirt\b/.test(joined) ||
    /\bhooded jacket\b/.test(joined);
  const softHoodie =
    /\bhooded\b/.test(joined) ||
    /\bdrawstring\b/.test(joined) ||
    /\bkangaroo pocket\b/.test(joined) ||
    /\bpouch pocket\b/.test(joined);

  if (strongHoodie) {
    return { itemType: 'hoodie', score: Math.max(score, 93) };
  }
  if (softHoodie) {
    return { itemType: 'hoodie', score: Math.max(score, 86) };
  }
  if (itemType === 'sweater' && /\bhood\b/.test(joined)) {
    return { itemType: 'hoodie', score: Math.max(score, 84) };
  }
  return { itemType, score };
}

function rankItemTypes(labelDescriptions) {
  const labs = labelDescriptions.map(s => String(s).toLowerCase());
  const typeScores = {};
  for (const type of Object.keys(ITEM_TYPE_SYNONYMS)) {
    typeScores[type] = 0;
  }

  for (const [type, synonyms] of Object.entries(ITEM_TYPE_SYNONYMS)) {
    for (const lab of labs) {
      for (const syn of synonyms) {
        const p = partial_ratio(syn, lab);
        const t = token_set_ratio(syn, lab);
        const s = Math.max(p, t);
        if (s > typeScores[type]) {
          typeScores[type] = s;
        }
      }
    }
  }

  const hoodieBoost = applyHoodieHeuristics(
    labelDescriptions,
    'hoodie',
    typeScores.hoodie || 0,
  );
  typeScores.hoodie = Math.max(typeScores.hoodie || 0, hoodieBoost.score);

  const ranked = Object.entries(typeScores)
    .map(([type, score]) => ({ type, score }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0] || { type: 'other', score: 0 };
  const primaryType = best.score >= TYPE_MATCH_THRESHOLD ? best.type : 'other';
  const relatedItemTypes = ranked
    .filter(
      entry =>
        entry.type !== primaryType &&
        entry.type !== 'other' &&
        entry.score >= TYPE_MATCH_THRESHOLD - 8,
    )
    .slice(0, 3)
    .map(entry => entry.type);

  if (primaryType === 'other') {
    return { itemType: 'other', score: best.score, relatedItemTypes };
  }
  return { itemType: primaryType, score: best.score, relatedItemTypes };
}

function inferStyleAndOccasion(labelTexts, categoryHint) {
  const joined = labelTexts.join(' ').toLowerCase();
  const hint = String(categoryHint || '').toLowerCase();
  let style = 'everyday casual';
  let occasion = 'casual';

  if (hint === 'work') {
    occasion = 'work';
    style = 'work appropriate';
  } else if (hint === 'travel') {
    occasion = 'travel';
    style = 'travel ready';
  }

  if (/\b(formal|suit|evening gown|gown|tuxedo)\b/.test(joined)) {
    occasion = 'formal';
    style = 'formal dressed';
  }
  if (/\b(athletic|sport|gym|running|training|yoga)\b/.test(joined)) {
    occasion = 'sport';
    style = 'active athletic';
  }
  if (/\b(cocktail|party|club|nightlife)\b/.test(joined)) {
    occasion = 'party';
    style = 'going out';
  }
  if (/\b(beach|vacation|resort)\b/.test(joined) && hint !== 'work') {
    occasion = 'travel';
    style = 'resort casual';
  }

  return { style, occasion };
}

function pickFeatures(labels, objects, max = 6) {
  const seen = new Set();
  const feats = [];

  const add = raw => {
    const x = String(raw || '').trim();
    if (x.length < 3) {
      return;
    }
    const clipped = x.length > 50 ? `${x.slice(0, 47)}...` : x;
    const key = clipped.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    feats.push(clipped.charAt(0).toUpperCase() + clipped.slice(1));
  };

  for (const l of labels.slice(0, 10)) {
    add(l.description);
    if (feats.length >= max) {
      return feats;
    }
  }
  for (const o of objects.slice(0, 8)) {
    add(o.name);
    if (feats.length >= max) {
      return feats;
    }
  }

  if (feats.length === 0) {
    add('Clothing detected');
  }
  return feats;
}

function truncateReasoning(text, max = 180) {
  const s = String(text || '').trim();
  if (s.length <= max) {
    return s;
  }
  return `${s.slice(0, max - 1)}…`;
}

async function callVisionAnnotate(imageBase64, apiKey) {
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: imageBase64 },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 25 },
            { type: 'IMAGE_PROPERTIES' },
            { type: 'OBJECT_LOCALIZATION', maxResults: 15 },
          ],
        },
      ],
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || JSON.stringify(json);
    throw new Error(`Vision API error (${res.status}): ${msg}`);
  }

  const err = json?.responses?.[0]?.error;
  if (err) {
    throw new Error(`Vision API error: ${err.message || JSON.stringify(err)}`);
  }

  return json;
}

function visionResponseToEnvelope(visionJson, categoryHint) {
  const resp = visionJson.responses?.[0] || {};
  const labelAnn = resp.labelAnnotations || [];
  const labels = labelAnn
    .map(l => ({ description: l.description, score: Number(l.score) || 0 }))
    .filter(l => l.description);

  const objects = (resp.localizedObjectAnnotations || [])
    .map(o => ({ name: o.name, score: Number(o.score) || 0 }))
    .filter(o => o.name);

  const colorInfo = resp.imagePropertiesAnnotation?.dominantColors?.colors || [];

  const labelTexts = [...labels.map(l => l.description), ...objects.map(o => o.name)];

  const {
    itemType,
    score: typeScore,
    relatedItemTypes,
  } = rankItemTypes(labelTexts);
  const dominant = dominantColorFromVision(colorInfo);
  const { color: colorName, secondary: secondaryColors } = mergeColorSignals(
    labels,
    dominant,
  );

  const material = inferMaterial(labelTexts);
  const pattern = inferPattern(labelTexts);
  const { style, occasion } = inferStyleAndOccasion(labelTexts, categoryHint);

  const topLabelScore = labels.length ? Math.max(...labels.map(l => l.score)) : 0;
  const typeConfidence = Math.min(1, typeScore / 100);
  const confidence = Math.min(
    0.95,
    0.2 + topLabelScore * 0.55 + typeConfidence * 0.25,
  );

  const features = pickFeatures(labels, objects);
  const topLabelNames = labels
    .slice(0, 3)
    .map(l => l.description)
    .join(', ');

  const reasoning = truncateReasoning(
    `From Cloud Vision labels (${topLabelNames || 'limited signal'}) and dominant colours via color-namer.`,
  );

  const warnings = [];
  if (typeScore < TYPE_MATCH_THRESHOLD) {
    warnings.push('Category is uncertain; best fuzzy match from Vision labels.');
  }
  if (!labels.length) {
    warnings.push('No label detections returned; colour-only or low-confidence image.');
  }

  return {
    version: '1.0',
    provider: 'google-cloud-vision',
    model: 'label+color+objects-v1',
    detectedAt: new Date().toISOString(),
    result: {
      itemType,
      relatedItemTypes,
      color: colorName,
      secondaryColors,
      material,
      materialNotes: material === 'blend' ? 'Mixed fibre cues from Vision labels' : '',
      style,
      features,
      pattern,
      occasion,
      confidence: Math.round(confidence * 100) / 100,
      reasoning,
      warnings,
    },
  };
}

export async function analyzeOutfitWithVision({ imageBase64, categoryHint }, apiKey) {
  const visionJson = await callVisionAnnotate(imageBase64, apiKey);
  return visionResponseToEnvelope(visionJson, categoryHint);
}
