/*
 * Upload-to-vault sync script.
 *
 * Usage:
 *   node scripts/syncVaultSectionFromUploads.js travel
 *   node scripts/syncVaultSectionFromUploads.js work
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const UPLOADS_ROOT = path.join(ROOT, 'assets', 'uploads');
const CLOTHING_ROOT = path.join(ROOT, 'assets', 'clothing');
const OVERRIDES_PATH = path.join(ROOT, 'src', 'data', 'vaultAiOverrides.json');
const UPLOADED_MAP_PATH = path.join(ROOT, 'src', 'data', 'vaultUploadedImages.js');

const API_BASE_URL = process.env.AI_API_BASE_URL || 'http://127.0.0.1:8787';
const API_KEY = process.env.AI_SERVER_API_KEY || 'vv-local-dev-key';

const SECTION_ITEM_IDS = {
  travel: [
    'airport-comfort-set',
    'weekend-carry-on-look',
    'city-tour-denim-fit',
    'resort-transit-fit',
    'light-packing-fit',
    'holiday-denim-combo',
    'paris-summer-look',
    'mountain-trail-set',
  ],
  work: [
    'monday-blazer-set',
    'executive-black-pairing',
    'boardroom-neutral-fit',
    'desk-day-classic',
    'office-capsule-fit',
    'conference-ready-look',
    'smart-afternoon-fit',
  ],
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  throw new Error(`Unsupported image extension: ${ext}`);
}

function readImageAsBase64(filePath) {
  return fs.readFileSync(filePath).toString('base64');
}

async function analyzeImage(filePath, categoryHint) {
  const mimeType = getMimeType(filePath);
  const imageBase64 = readImageAsBase64(filePath);

  const headers = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze-outfit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ imageBase64, mimeType, categoryHint }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI analyze failed (${response.status}): ${body}`);
  }

  return response.json();
}

function normalizeResult(envelope, category) {
  const result = envelope?.result || {};
  const itemType = String(result.itemType || 'other').toLowerCase();
  const color = String(result.color || 'unknown').toLowerCase();
  const material = String(result.material || 'unknown').toLowerCase();
  const style = String(result.style || 'everyday').toLowerCase();
  const features = Array.isArray(result.features)
    ? result.features.map(v => String(v).toLowerCase()).filter(Boolean)
    : [];
  const occasion = String(result.occasion || category || 'other').toLowerCase();

  return {
    subtitle: `${color}, ${material}, ${style}`,
    aiMeta: {
      itemType,
      color,
      material,
      style,
      features: features.length > 0 ? features : ['unspecified'],
      occasion,
    },
  };
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function readUploadedMapFromJs(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(/'([^']+)'\s*:\s*require\('([^']+)'\)/g)];
  return matches.reduce((acc, match) => {
    acc[match[1]] = match[2];
    return acc;
  }, {});
}

function buildAssignments(files, targetItemIds) {
  const normalized = files.map(name => ({
    name,
    lower: name.toLowerCase(),
  }));

  const usedFiles = new Set();
  const assignments = [];

  // 1) Exact-id matching first: filename contains item id.
  for (const itemId of targetItemIds) {
    const match = normalized.find(
      file => !usedFiles.has(file.name) && file.lower.includes(itemId.toLowerCase()),
    );
    if (match) {
      assignments.push({ itemId, fileName: match.name });
      usedFiles.add(match.name);
    }
  }

  // 2) Fill remaining ids by filename order.
  const remainingIds = targetItemIds.filter(
    id => !assignments.some(a => a.itemId === id),
  );
  const remainingFiles = files.filter(name => !usedFiles.has(name));

  const fallbackCount = Math.min(remainingIds.length, remainingFiles.length);
  for (let i = 0; i < fallbackCount; i += 1) {
    assignments.push({ itemId: remainingIds[i], fileName: remainingFiles[i] });
  }

  return assignments;
}

function writeUploadedMapJs(map) {
  const keys = Object.keys(map).sort((a, b) => a.localeCompare(b));
  const lines = [
    'const vaultUploadedImages = {',
    ...keys.map(key => `  '${key}': require('${map[key]}'),`),
    '};',
    '',
    'export default vaultUploadedImages;',
    '',
  ];

  fs.writeFileSync(UPLOADED_MAP_PATH, lines.join('\n'));
}

async function main() {
  const section = String(process.argv[2] || '').toLowerCase();
  if (!SECTION_ITEM_IDS[section]) {
    console.error('Usage: node scripts/syncVaultSectionFromUploads.js <travel|work>');
    process.exit(1);
  }

  const sectionDir = path.join(UPLOADS_ROOT, section);
  ensureDir(sectionDir);
  ensureDir(CLOTHING_ROOT);

  const files = fs
    .readdirSync(sectionDir)
    .filter(name => /\.(jpg|jpeg|png|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    console.error(`No images found in ${sectionDir}`);
    process.exit(1);
  }

  const targetItemIds = SECTION_ITEM_IDS[section];
  const assignments = buildAssignments(files, targetItemIds);
  const usableCount = assignments.length;

  if (files.length < targetItemIds.length) {
    console.warn(`Only ${files.length} image(s) provided for ${section}. Updating first ${usableCount} item(s).`);
  } else if (files.length > targetItemIds.length) {
    console.warn(`Found ${files.length} images but ${targetItemIds.length} slots in ${section}. Extra images are ignored.`);
  }

  const overrides = readJson(OVERRIDES_PATH, {});
  const uploadedMap = readUploadedMapFromJs(UPLOADED_MAP_PATH);

  for (let i = 0; i < usableCount; i += 1) {
    const fileName = assignments[i].fileName;
    const itemId = assignments[i].itemId;
    const sourcePath = path.join(sectionDir, fileName);

    const ext = path.extname(fileName).toLowerCase() || '.jpg';
    const imageKey = `user-${itemId}`;
    const targetFileName = `${imageKey}${ext}`;
    const targetPath = path.join(CLOTHING_ROOT, targetFileName);

    console.log(`Analyzing [${section}] ${fileName} -> ${itemId} ...`);
    const envelope = await analyzeImage(sourcePath, section);
    const normalized = normalizeResult(envelope, section);

    fs.copyFileSync(sourcePath, targetPath);

    overrides[itemId] = {
      ...(overrides[itemId] || {}),
      imageKey,
      subtitle: normalized.subtitle,
      aiMeta: normalized.aiMeta,
    };

    uploadedMap[imageKey] = `../../assets/clothing/${targetFileName}`;
    console.log(`Updated ${itemId}: ${normalized.subtitle}`);
  }

  fs.writeFileSync(OVERRIDES_PATH, `${JSON.stringify(overrides, null, 2)}\n`);
  writeUploadedMapJs(uploadedMap);

  console.log('');
  console.log('Sync complete.');
  console.log(`Updated overrides: ${OVERRIDES_PATH}`);
  console.log(`Updated uploaded image map: ${UPLOADED_MAP_PATH}`);
  console.log('Restart Expo to pick up new local assets.');
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
