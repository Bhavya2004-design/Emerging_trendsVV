/**
 * One-time script: downloads 15 clothing photos from loremflickr.com
 * and saves them to assets/clothing/ for use as bundled app assets.
 *
 * Run once before starting Expo:
 *   cd EmergingTrendsVVExpo
 *   node scripts/downloadClothingImages.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const IMAGES = [
  { filename: 'jacket-navy.jpg',       keywords: 'jacket,navy,fashion'          },
  { filename: 'shirt-white.jpg',        keywords: 'shirt,white,linen'            },
  { filename: 'jeans-blue.jpg',         keywords: 'jeans,denim,fashion'          },
  { filename: 'dress-cream.jpg',        keywords: 'dress,fashion,woman'          },
  { filename: 'pants-olive.jpg',        keywords: 'pants,trousers,fashion'       },
  { filename: 'jacket-beige.jpg',       keywords: 'jacket,beige,fashion'         },
  { filename: 'blouse-white.jpg',       keywords: 'blouse,white,fashion'         },
  { filename: 'blazer-grey.jpg',        keywords: 'blazer,grey,fashion'          },
  { filename: 'pants-black.jpg',        keywords: 'pants,black,formal'           },
  { filename: 'blazer-nude.jpg',        keywords: 'blazer,beige,fashion'         },
  { filename: 'shirt-white-work.jpg',   keywords: 'shirt,white,office'           },
  { filename: 'coat-camel.jpg',         keywords: 'coat,autumn,fashion'          },
  { filename: 'blazer-ivory.jpg',       keywords: 'blazer,white,formal'          },
  { filename: 'shirt-sage-green.jpg',   keywords: 'shirt,green,fashion'          },
  { filename: 'jacket-charcoal.jpg',    keywords: 'jacket,outdoor,hiking'        },
];

const OUT_DIR = path.join(__dirname, '..', 'assets', 'clothing');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Created ${OUT_DIR}`);
}

function downloadWithRedirects(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 15) return reject(new Error('Too many redirects'));

    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'VogueVaultDemo/1.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let next = res.headers.location;
        if (next.startsWith('/')) {
          const parsed = new URL(url);
          next = `${parsed.protocol}//${parsed.host}${next}`;
        }
        res.resume();
        return downloadWithRedirects(next, dest, redirects + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
      file.on('error', err => { try { fs.unlinkSync(dest); } catch (_) {} reject(err); });
    });
    req.on('error', err => { try { fs.unlinkSync(dest); } catch (_) {} reject(err); });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function main() {
  console.log(`Downloading ${IMAGES.length} clothing images to assets/clothing/ ...\n`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (let i = 0; i < IMAGES.length; i++) {
    const { filename, keywords } = IMAGES[i];
    const dest = path.join(OUT_DIR, filename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      console.log(`  SKIP  ${filename}  (already exists)`);
      skip++;
      continue;
    }

    // loremflickr returns real Flickr photos tagged with these keywords.
    // The ?lock=N seed makes the same keywords always resolve to the same photo.
    const lockSeed = 200 + i + 1;
    const url = `https://loremflickr.com/400/500/${keywords}?lock=${lockSeed}`;

    process.stdout.write(`  GET   ${filename}  ...  `);
    try {
      await downloadWithRedirects(url, dest);
      const kb = Math.round(fs.statSync(dest).size / 1024);
      console.log(`OK  (${kb} KB)`);
      ok++;
    } catch (e) {
      console.log(`FAIL  ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} downloaded, ${skip} skipped, ${fail} failed.`);
  if (fail > 0) {
    console.log('Re-run the script to retry failed downloads.');
  } else {
    console.log('\nNext step: restart Expo so Metro re-bundles the new assets.');
    console.log('  npx.cmd expo start --host lan');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
