// Shared painting helpers for the paper-and-cloth look: lettering, paper panels, bars, keycaps.

import { INK } from '../config.js';

export const FONT_STACK = '"Avenir Next", "Trebuchet MS", "Segoe UI", system-ui, sans-serif';

export function paintText(ctx, text, x, y, options = {}) {
  const { size = 18, weight = 700, color = INK.text, align = 'left', spacing = 0, alpha = 1, shadow = null } = options;
  ctx.save();
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = `${spacing}px`;
  ctx.globalAlpha = alpha;
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.fillText(text, x + Math.max(2, size * 0.05), y + Math.max(2, size * 0.06));
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Lettering that looks embroidered: solid letters with a dashed running stitch around them.
export function paintStitchedText(ctx, text, x, y, options = {}) {
  const { size = 100, color = INK.paper, thread = INK.red, spacing = 6, align = 'center' } = options;
  paintText(ctx, text, x, y, { size, weight: 900, color, align, spacing, shadow: 'rgba(40, 22, 10, 0.55)' });
  ctx.save();
  ctx.font = `900 ${size}px ${FONT_STACK}`;
  ctx.textAlign = align;
  ctx.letterSpacing = `${spacing}px`;
  ctx.setLineDash([size * 0.09, size * 0.07]);
  ctx.lineWidth = Math.max(2, size * 0.035);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = thread;
  ctx.strokeText(text, x, y);
  ctx.restore();
}

export function paintWrappedText(ctx, text, x, y, maxWidth, lineHeight, options = {}) {
  const { size = 16, weight = 600 } = options;
  ctx.save();
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  ctx.restore();
  for (const each of lines) {
    paintText(ctx, each, x, y, { ...options, size, weight, align: 'center' });
    y += lineHeight;
  }
  return y;
}

// A sheet of pattern paper: cream, with a brown edge and a soft shadow on the table.
export function paintPaper(ctx, x, y, width, height, radius = 14, fill = INK.paper, edge = INK.paperEdge) {
  ctx.save();
  ctx.fillStyle = 'rgba(40, 22, 10, 0.28)';
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 5, width, height, radius);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export function paintBar(ctx, x, y, width, height, share, color, track = 'rgba(58, 42, 32, 0.16)') {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, height / 2);
  ctx.fillStyle = track;
  ctx.fill();
  const filled = Math.max(0, Math.min(1, share)) * width;
  if (filled > 1) {
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(filled, height), height, height / 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// A key label with the action beside it; returns the x just past the action text.
export function paintKeycap(ctx, x, y, keys, action, color = INK.paper) {
  ctx.save();
  ctx.font = `800 13px ${FONT_STACK}`;
  const width = ctx.measureText(keys).width + 20;
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(x, y, width, 26, 7);
  ctx.fillStyle = INK.paper;
  ctx.fill();
  ctx.strokeStyle = INK.text;
  ctx.lineWidth = 2;
  ctx.stroke();
  paintText(ctx, keys, x + width / 2, y + 18, { size: 13, weight: 800, align: 'center' });
  paintText(ctx, action, x + width + 8, y + 19, { size: 15, weight: 900, color, spacing: 1, shadow: 'rgba(40, 22, 10, 0.5)' });
  ctx.save();
  ctx.font = `900 15px ${FONT_STACK}`;
  ctx.letterSpacing = '1px';
  const end = x + width + 8 + ctx.measureText(action).width;
  ctx.restore();
  return end;
}

export function formatScore(value) {
  return Math.round(value).toLocaleString('en-US');
}
