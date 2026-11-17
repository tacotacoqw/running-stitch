// Hand-drawn canvas sprites of the sewing table: the needle and its presser foot, the seam ripper,
// pins, scissors, the iron, buttons and bobbins. Each paints around (0, 0) so the HUD can reuse it.

import { INK } from '../config.js';

function at(ctx, x, y, angle, scale, draw) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  draw();
  ctx.restore();
}

// The presser foot around the needle, pointing the way it sews. `lift` 0..1 is the hop.
export function paintNeedle(ctx, x, y, heading, lift, ringColor, blink) {
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#2a1608';
  ctx.beginPath();
  ctx.ellipse(x + 4 + lift * 10, y + 6 + lift * 14, 17, 12, heading, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (ringColor) {
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  at(ctx, x, y - lift * 12, heading, 1 + lift * 0.3, () => {
    if (blink) ctx.globalAlpha = 0.5;
    ctx.fillStyle = INK.steel;
    ctx.strokeStyle = INK.steelDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-13, -11, 30, 22, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f7f9fb';
    ctx.fillRect(-9, -7, 12, 4);
    ctx.fillStyle = INK.text;
    ctx.beginPath();
    ctx.roundRect(2, -3.5, 13, 7, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
  });
}

// The seam ripper: a red-handled fork with a mean little face. `dazed` makes it wobble.
export function paintSeamRipper(ctx, x, y, angle, scale = 1, dazed = false, time = 0) {
  at(ctx, x, y, angle + (dazed ? Math.sin(time * 30) * 0.3 : 0), scale, () => {
    ctx.fillStyle = INK.red;
    ctx.strokeStyle = '#7e1f17';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-46, -8, 34, 16, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK.steel;
    ctx.strokeStyle = INK.steelDark;
    ctx.beginPath();
    ctx.moveTo(-12, -3.5);
    ctx.lineTo(8, -3.5);
    ctx.lineTo(18, -9);
    ctx.lineTo(13, -1);
    ctx.lineTo(22, 2);
    ctx.lineTo(8, 4);
    ctx.lineTo(-12, 3.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    for (const eye of [-36, -26]) {
      ctx.beginPath();
      ctx.arc(eye, -1, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = INK.text;
    for (const eye of [-35, -25]) {
      ctx.beginPath();
      ctx.arc(eye, -1, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// A dressmaker's pin lying across the seam.
export function paintPin(ctx, x, y, angle, scale = 1, headColor = INK.mustard) {
  at(ctx, x, y, angle + Math.PI / 2, scale, () => {
    ctx.strokeStyle = 'rgba(40, 22, 10, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, 3);
    ctx.lineTo(22, 3);
    ctx.stroke();
    ctx.strokeStyle = INK.steel;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();
    ctx.fillStyle = headColor;
    ctx.strokeStyle = INK.text;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(22, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

// Scissors over the seam. `open` runs 0 (shut, dangerous) to 1 (wide open, safe).
export function paintScissors(ctx, x, y, angle, open, scale = 1) {
  at(ctx, x, y, angle + Math.PI / 2, scale, () => {
    const spread = 0.12 + open * 0.55;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.rotate(side * spread);
      ctx.fillStyle = INK.steel;
      ctx.strokeStyle = INK.steelDark;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(30, -3 * side);
      ctx.lineTo(4, 5 * side);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = open < 0.2 ? INK.red : '#e07a2f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(-17, 7 * side, 9, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = INK.text;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function paintIron(ctx, x, y, scale = 1, time = 0) {
  at(ctx, x, y, 0, scale, () => {
    ctx.fillStyle = 'rgba(40, 22, 10, 0.3)';
    ctx.beginPath();
    ctx.ellipse(4, 8, 34, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8edf2';
    ctx.strokeStyle = INK.steelDark;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-30, 22);
    ctx.lineTo(-30, -6);
    ctx.quadraticCurveTo(-26, -28, 0, -30);
    ctx.quadraticCurveTo(28, -24, 32, 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK.navy;
    ctx.beginPath();
    ctx.roundRect(-20, -4, 40, 12, 6);
    ctx.fill();
    ctx.fillStyle = INK.red;
    ctx.beginPath();
    ctx.arc(0, -17, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let puff = 0; puff < 3; puff++) {
      const rise = (time * 0.9 + puff * 0.33) % 1;
      ctx.globalAlpha = 0.6 * (1 - rise);
      ctx.beginPath();
      ctx.arc(-22 + puff * 22, -34 - rise * 22, 5 + rise * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function paintButton(ctx, x, y, color, sewn, threadColor, scale = 1) {
  at(ctx, x, y, 0, scale, () => {
    ctx.fillStyle = 'rgba(40, 22, 10, 0.3)';
    ctx.beginPath();
    ctx.arc(2, 3, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.strokeStyle = INK.text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(40, 22, 10, 0.3)';
    ctx.stroke();
    ctx.fillStyle = INK.text;
    for (const [hx, hy] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) {
      ctx.beginPath();
      ctx.arc(hx, hy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (sewn) {
      ctx.strokeStyle = threadColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-3, -3); ctx.lineTo(3, 3);
      ctx.moveTo(3, -3); ctx.lineTo(-3, 3);
      ctx.stroke();
    }
  });
}

export function paintBobbin(ctx, x, y, threadColor, scale = 1) {
  at(ctx, x, y, 0, scale, () => {
    ctx.fillStyle = threadColor;
    ctx.strokeStyle = INK.text;
    ctx.lineWidth = 1.5;
    ctx.fillRect(-7, -9, 14, 18);
    ctx.strokeRect(-7, -9, 14, 18);
    ctx.fillStyle = '#d9b48a';
    for (const flange of [-12, 9]) {
      ctx.beginPath();
      ctx.roundRect(-11, flange, 22, 4, 2);
      ctx.fill();
      ctx.stroke();
    }
  });
}

// A prize rosette with a ribbon letter.
export function paintRosette(ctx, x, y, radius, letter, color = INK.red) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  for (const tail of [-0.35, 0.35]) {
    ctx.save();
    ctx.rotate(tail);
    ctx.fillRect(-radius * 0.28, radius * 0.5, radius * 0.56, radius * 1.25);
    ctx.restore();
  }
  ctx.beginPath();
  for (let petal = 0; petal < 14; petal++) {
    const angle = (petal / 14) * Math.PI * 2;
    ctx.moveTo(Math.cos(angle) * radius + radius * 0.24, Math.sin(angle) * radius);
    ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, radius * 0.24, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.74, 0, Math.PI * 2);
  ctx.fillStyle = INK.paper;
  ctx.fill();
  ctx.font = `900 ${radius * 1.05}px "Avenir Next", "Trebuchet MS", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = INK.text;
  ctx.fillText(letter, 0, radius * 0.37);
  ctx.restore();
}
