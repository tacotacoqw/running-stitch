// Woven backgrounds, drawn once and tiled: six fabrics for the six garments, and the wooden table.

import { CLOTH, INK, VIEW } from '../config.js';

const TILE = 48;
const patternCache = new Map();
let tableImage = null;

const WEAVERS = {
  gingham(g) {
    g.fillStyle = '#fff6ea';
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle = 'rgba(214, 72, 59, 0.5)';
    g.fillRect(0, 0, TILE / 2, TILE);
    g.fillRect(0, 0, TILE, TILE / 2);
  },
  stripes(g) {
    g.fillStyle = '#fbefd2';
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle = '#7cc1b5';
    g.fillRect(0, 6, TILE, 12);
    g.fillStyle = '#f2c14e';
    g.fillRect(0, 30, TILE, 7);
  },
  tartan(g) {
    g.fillStyle = '#2f7d5b';
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle = 'rgba(16, 48, 74, 0.55)';
    g.fillRect(0, 0, 18, TILE);
    g.fillRect(0, 0, TILE, 18);
    g.fillStyle = 'rgba(242, 193, 78, 0.9)';
    g.fillRect(30, 0, 3, TILE);
    g.fillRect(0, 30, TILE, 3);
    g.fillStyle = 'rgba(214, 72, 59, 0.85)';
    g.fillRect(40, 0, 2, TILE);
    g.fillRect(0, 40, TILE, 2);
  },
  dots(g) {
    g.fillStyle = '#f7a8b8';
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle = '#fff6ea';
    for (const [x, y] of [[12, 12], [36, 36]]) {
      g.beginPath();
      g.arc(x, y, 6, 0, Math.PI * 2);
      g.fill();
    }
  },
  denim(g) {
    g.fillStyle = '#3f6ea8';
    g.fillRect(0, 0, TILE, TILE);
    g.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    g.lineWidth = 2;
    for (let offset = -TILE; offset < TILE * 2; offset += 8) {
      g.beginPath();
      g.moveTo(offset, 0);
      g.lineTo(offset + TILE, TILE);
      g.stroke();
    }
  },
  velvet(g) {
    g.fillStyle = '#6b3f8c';
    g.fillRect(0, 0, TILE, TILE);
    g.strokeStyle = 'rgba(255, 220, 255, 0.2)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(TILE, TILE);
    g.moveTo(TILE, 0); g.lineTo(0, TILE);
    g.stroke();
    g.fillStyle = 'rgba(255, 215, 168, 0.75)';
    g.beginPath();
    g.arc(TILE / 2, TILE / 2, 2.5, 0, Math.PI * 2);
    g.fill();
  },
};

export function fabricPattern(ctx, fabric) {
  let pattern = patternCache.get(fabric);
  if (!pattern) {
    const tile = document.createElement('canvas');
    tile.width = TILE;
    tile.height = TILE;
    const g = tile.getContext('2d');
    WEAVERS[fabric](g);
    // A faint weave over every fabric.
    g.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let line = 0; line < TILE; line += 4) g.fillRect(0, line, TILE, 1);
    pattern = ctx.createPattern(tile, 'repeat');
    patternCache.set(fabric, pattern);
  }
  return pattern;
}

function drawTable() {
  const image = document.createElement('canvas');
  image.width = VIEW.width;
  image.height = VIEW.height;
  const g = image.getContext('2d');
  g.fillStyle = INK.wood;
  g.fillRect(0, 0, VIEW.width, VIEW.height);
  for (let plank = 0; plank < 8; plank++) {
    const y = plank * 100;
    g.fillStyle = plank % 2 === 0 ? 'rgba(255, 230, 190, 0.07)' : 'rgba(60, 30, 10, 0.06)';
    g.fillRect(0, y, VIEW.width, 100);
    g.strokeStyle = 'rgba(70, 40, 18, 0.35)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(VIEW.width, y);
    g.stroke();
    g.strokeStyle = 'rgba(70, 40, 18, 0.12)';
    g.lineWidth = 1.5;
    for (let grain = 1; grain < 5; grain++) {
      g.beginPath();
      for (let x = 0; x <= VIEW.width; x += 40) {
        const wave = Math.sin(x * 0.011 + plank * 2.1 + grain) * 5;
        if (x === 0) g.moveTo(x, y + grain * 20 + wave);
        else g.lineTo(x, y + grain * 20 + wave);
      }
      g.stroke();
    }
  }
  return image;
}

export function paintTable(ctx) {
  if (!tableImage) tableImage = drawTable();
  ctx.drawImage(tableImage, 0, 0);
}

// The cloth itself: a rectangle of fabric with pinked (zigzag-cut) edges and a shadow.
export function paintCloth(ctx, fabric) {
  const tooth = 10;
  const outline = new Path2D();
  const { left, top, right, bottom } = CLOTH;
  outline.moveTo(left, top);
  for (let x = left; x < right; x += tooth) { outline.lineTo(x + tooth / 2, top - 5); outline.lineTo(Math.min(right, x + tooth), top); }
  for (let y = top; y < bottom; y += tooth) { outline.lineTo(right + 5, y + tooth / 2); outline.lineTo(right, Math.min(bottom, y + tooth)); }
  for (let x = right; x > left; x -= tooth) { outline.lineTo(x - tooth / 2, bottom + 5); outline.lineTo(Math.max(left, x - tooth), bottom); }
  for (let y = bottom; y > top; y -= tooth) { outline.lineTo(left - 5, y - tooth / 2); outline.lineTo(left, Math.max(top, y - tooth)); }
  outline.closePath();

  ctx.save();
  ctx.translate(5, 8);
  ctx.fillStyle = 'rgba(40, 22, 10, 0.35)';
  ctx.fill(outline);
  ctx.restore();
  ctx.fillStyle = fabricPattern(ctx, fabric);
  ctx.fill(outline);
  ctx.strokeStyle = 'rgba(40, 22, 10, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke(outline);
}
