// Rasterize public/icon.svg into two PNG sizes for the PWA manifest.
// Run via `node scripts/generate-icons.mjs`.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');
const svg = await readFile(join(pub, 'icon.svg'));

for (const size of [192, 512]) {
  const buf = await sharp(svg, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(pub, `icon-${size}.png`), buf);
  console.log(`wrote icon-${size}.png (${buf.length} bytes)`);
}
