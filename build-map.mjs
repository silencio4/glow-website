/**
 * Renders a static map image of the salon from OpenStreetMap tiles.
 *
 *   node build-map.mjs
 *
 * The image is composed once here and served from assets/img/, so a
 * visitor's browser never contacts a map provider — no third-party
 * request, no cookies. Map data © OpenStreetMap contributors (ODbL);
 * the attribution is drawn onto the image as the licence requires.
 */

import sharp from 'sharp';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const LAT = 40.5700767;
const LON = 22.9589642;
const ZOOM = 17;
const W = 800, H = 460;        // output size
const TILE = 256;

const n = 2 ** ZOOM;
const latRad = (LAT * Math.PI) / 180;

// Centre in world-pixel coordinates.
const cx = ((LON + 180) / 360) * n * TILE;
const cy =
  ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
  n * TILE;

// World-pixel bounds of the output image.
const left = cx - W / 2;
const top = cy - H / 2;

const xTileMin = Math.floor(left / TILE);
const xTileMax = Math.floor((left + W) / TILE);
const yTileMin = Math.floor(top / TILE);
const yTileMax = Math.floor((top + H) / TILE);

const tmp = mkdtempSync(path.join(tmpdir(), 'glowmap-'));
const composites = [];

try {
  for (let xt = xTileMin; xt <= xTileMax; xt++) {
    for (let yt = yTileMin; yt <= yTileMax; yt++) {
      const url = `https://tile.openstreetmap.org/${ZOOM}/${xt}/${yt}.png`;
      const file = path.join(tmp, `${xt}_${yt}.png`);
      execSync(
        `curl -s --max-time 30 -A "glow-beauty-nails-static-map/1.0 (one-time local render)" -o "${file}" "${url}"`
      );
      composites.push({
        input: file,
        left: Math.round(xt * TILE - left),
        top: Math.round(yt * TILE - top),
      });
    }
  }

  // Brand-coloured map pin, centred on the coordinate.
  const pin = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
       <path d="M20 51C20 51 37 32 37 19A17 17 0 1 0 3 19C3 32 20 51 20 51Z"
             fill="#445739" stroke="#ffffff" stroke-width="2.5"/>
       <circle cx="20" cy="19" r="6.5" fill="#ffffff"/>
     </svg>`
  );

  // Attribution chip (bottom-right) — required by the OSM licence.
  const attribution = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
       <g>
         <rect x="${W - 232}" y="${H - 22}" width="232" height="22" fill="#ffffff" opacity="0.82"/>
         <text x="${W - 116}" y="${H - 7}" font-family="Arial, sans-serif" font-size="11"
               fill="#1c1e1a" text-anchor="middle">© OpenStreetMap contributors</text>
       </g>
     </svg>`
  );

  const base = sharp({
    create: { width: W, height: H, channels: 3, background: '#e8e8e3' },
  });

  await base
    .composite([
      ...composites,
      { input: pin, left: Math.round(W / 2 - 20), top: Math.round(H / 2 - 51) },
      { input: attribution, left: 0, top: 0 },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile('assets/img/map-location.jpg');

  // Recompose for WebP (sharp consumes the pipeline once).
  await sharp({
    create: { width: W, height: H, channels: 3, background: '#e8e8e3' },
  })
    .composite([
      ...composites,
      { input: pin, left: Math.round(W / 2 - 20), top: Math.round(H / 2 - 51) },
      { input: attribution, left: 0, top: 0 },
    ])
    .webp({ quality: 80 })
    .toFile('assets/img/map-location.webp');

  console.log(`map rendered ${W}x${H} from ${composites.length} tiles`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
