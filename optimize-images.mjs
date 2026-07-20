/**
 * Image optimiser for the glow website.
 *
 *   node optimize-images.mjs
 *
 * Reads the full-resolution originals from MEDIA/ and writes web-sized
 * .jpg + .webp pairs into assets/img/. Always reads from the originals,
 * never from its own output, so it is safe to run as many times as you
 * like without the quality degrading.
 *
 * To add a photo: drop it in MEDIA/, add a line to the MAP below, run
 * the script, then reference it in index.html.
 *
 * Requires sharp:  npm install sharp
 */

import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'MEDIA';
const OUT = 'assets/img';

/* source filename (or a unique fragment of it) → [output name, max width] */
const MAP = [
  ['12345990',      'logo-glow-green',  600],   // header 56px / footer 84px / og:image
  ['IMG_3931',      'pedicure-lounge', 1200],   // hero
  ['9CB0FD2D',      'here-we-glow',    1000],   // about
  ['IMG_3895',      'storefront',      1200],   // gallery + lightbox
  ['RNI-Films',     'nail-studio',     1200],
  ['IMG_3925',      'treatment-room',  1200],
  ['593193BC',      'laser-treatment', 1200],
  ['794F9F79',      'laser-device',    1200],
  ['3938863A',      'body-device',     1200],
  ['1. BANNER',     'espa-banner-gr',  1400],   // ΕΣΠΑ, Greek version
];

const kb = (b) => Math.round(b / 1024);

const files = await readdir(SRC);
await mkdir(OUT, { recursive: true });

let before = 0, after = 0;

for (const [fragment, name, width] of MAP) {
  const match = files.find((f) => f.includes(fragment));
  if (!match) {
    console.warn(`  !! no source matching "${fragment}" — skipped`);
    continue;
  }

  const src = path.join(SRC, match);
  const srcSize = (await stat(src)).size;
  const meta = await sharp(src).metadata();

  // Never upscale past the original.
  const target = Math.min(width, meta.width);

  const base = sharp(src).rotate().resize({ width: target, withoutEnlargement: true });

  await base.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(path.join(OUT, `${name}.jpg`));
  await base.clone().webp({ quality: 74 })
    .toFile(path.join(OUT, `${name}.webp`));

  const j = (await stat(path.join(OUT, `${name}.jpg`))).size;
  const w = (await stat(path.join(OUT, `${name}.webp`))).size;

  before += srcSize;
  after  += w;   // WebP is what modern browsers actually download

  console.log(
    `${name.padEnd(18)} ${String(meta.width).padStart(4)}px → ${String(target).padStart(4)}px   ` +
    `${String(kb(srcSize)).padStart(5)}KB → jpg ${String(kb(j)).padStart(4)}KB / webp ${String(kb(w)).padStart(4)}KB`
  );
}

console.log(`\ntotal: ${kb(before)}KB → ${kb(after)}KB (WebP)  —  ${(100 - (after / before) * 100).toFixed(1)}% smaller`);
