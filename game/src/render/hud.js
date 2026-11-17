// The heads-up display, as pattern paper pinned around the cloth. Top: needles, garment, the win
// and lose rules, score. Left: what is on the cloth and the neat-stitch chain. Right: notions,
// thread, the pedal and the ripper's distance. Bottom: every control with its key.

import { CHAIN, CLOTH, INK, NEEDLE, PEDAL, VIEW } from '../config.js';
import { NOTIONS, listOwnedNotions } from '../data/notions.js';
import { ripperGap } from '../entities/seamRipper.js';
import { garmentCount } from '../systems/layGarment.js';
import { chainMultiplier, neatnessOf, paceMultiplier, ribbonFor } from '../systems/scoring.js';
import { formatScore, paintBar, paintKeycap, paintPaper, paintText, paintWrappedText } from './paint.js';
import { paintBobbin, paintButton, paintIron, paintPin, paintRosette, paintScissors, paintSeamRipper } from './sprites.js';

const LEFT = { x: 14, width: 220 };
const RIGHT = { x: VIEW.width - 234, width: 220 };
const CENTER_X = VIEW.width / 2;
const RATING_WORDS = { perfect: ['PERFECT', INK.teal], good: ['GOOD', '#b98a12'], sloppy: ['SLOPPY', '#e07a2f'], off: ['OFF THE LINE', INK.red] };

export function paintHud(ctx, world, status, time) {
  paintNeedlesLeft(ctx, world);
  paintGarmentHeader(ctx, world);
  paintScore(ctx, world, status.bestScore);
  paintOnTheClothPanel(ctx, world);
  paintChainPanel(ctx, world);
  paintNotionsPanel(ctx, world);
  paintThreadPanel(ctx, world);
  paintPedalPanel(ctx, world);
  paintControlsLegend(ctx, world, status.muted);
  paintGarmentBanner(ctx, world);
}

function paintTitle(ctx, column, top, title, note = '') {
  paintText(ctx, title, column.x + 14, top + 26, { size: 15, weight: 900, color: INK.red, spacing: 3 });
  if (note) paintText(ctx, note, column.x + column.width - 14, top + 26, { size: 14, weight: 800, align: 'right' });
}

function paintNeedlesLeft(ctx, world) {
  paintPaper(ctx, LEFT.x, 12, LEFT.width, 80);
  paintText(ctx, 'NEEDLES', LEFT.x + 14, 38, { size: 15, weight: 900, color: INK.red, spacing: 3 });
  for (let i = 0; i < world.needles.max; i++) {
    const x = LEFT.x + 28 + i * 38;
    const whole = i < world.needles.left;
    ctx.save();
    ctx.translate(x, 64);
    ctx.rotate(-0.5);
    ctx.globalAlpha = whole ? 1 : 0.25;
    ctx.fillStyle = INK.steelDark;
    ctx.beginPath();
    ctx.moveTo(-2.5, -16);
    ctx.lineTo(2.5, -16);
    ctx.lineTo(0.5, 18);
    ctx.lineTo(-0.5, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = INK.paper;
    ctx.fillRect(-1, -13, 2, 6);
    ctx.restore();
  }
}

function paintGarmentHeader(ctx, world) {
  const width = CLOTH.right - CLOTH.left;
  paintPaper(ctx, CLOTH.left, 12, width, 80);
  paintText(ctx, `GARMENT ${world.garmentNumber} / ${garmentCount()}`, CENTER_X - 12, 42, { size: 26, weight: 900, align: 'right', spacing: 1 });
  paintText(ctx, world.garment.name.toUpperCase(), CENTER_X + 12, 42, { size: 24, weight: 900, color: INK.navy, spacing: 2 });

  const left = garmentCount() - world.garmentNumber;
  const win = left > 0 ? `sew to END, then ${left} more garment${left === 1 ? '' : 's'}` : 'sew to END to finish the quilt';
  const lose = `no needles (${world.needles.left} left) or no thread`;
  const half = width / 2 - 18;
  paintRule(ctx, CLOTH.left + 12, half, 'WIN', win, INK.teal);
  paintRule(ctx, CENTER_X + 6, half, 'LOSE', lose, INK.red);
  paintBar(ctx, CLOTH.left + 12, 82, width - 24, 5, world.needle.progress / (world.path.points.length - 1), INK.navy);
}

function paintRule(ctx, x, width, label, text, color) {
  ctx.beginPath();
  ctx.roundRect(x, 52, width, 24, 12);
  ctx.fillStyle = color;
  ctx.fill();
  paintText(ctx, label, x + 12, 69, { size: 13, weight: 900, color: INK.paper, spacing: 2 });
  paintText(ctx, text, x + (label === 'WIN' ? 50 : 58), 69, { size: 13, weight: 700, color: '#ffffff' });
}

function paintScore(ctx, world, bestScore) {
  paintPaper(ctx, RIGHT.x, 12, RIGHT.width, 80);
  const right = RIGHT.x + RIGHT.width - 14;
  paintText(ctx, 'SCORE', RIGHT.x + 14, 38, { size: 15, weight: 900, color: INK.red, spacing: 3 });
  paintText(ctx, formatScore(world.score), right, 66, { size: 34, weight: 900, align: 'right' });
  paintText(ctx, `BEST ${formatScore(Math.max(bestScore, world.score))}`, right, 84, { size: 12, weight: 800, color: INK.textSoft, align: 'right' });
}

function paintOnTheClothPanel(ctx, world) {
  const top = CLOTH.top;
  paintPaper(ctx, LEFT.x, top, LEFT.width, 330);
  paintTitle(ctx, LEFT, top, 'ON THE CLOTH');

  const gap = ripperGap(world);
  const pinsLeft = world.pins.filter((pin) => !pin.gone && !pin.hopped).length;
  const sewn = world.buttons.filter((button) => button.sewn).length;
  const rows = [
    ['ripper', 'Seam Ripper', gap === Infinity ? 'asleep for now' : `${Math.round(gap)}px behind you`, ''],
    ['pin', 'Pins', 'hop them: Space', `x${pinsLeft}`],
    ['scissors', 'Scissors', 'brake till they open', `x${world.scissors.length}`],
    ['iron', 'Hot Iron', 'keep well clear', world.iron ? 'x1' : 'none'],
    ['button', 'Buttons', 'sew dead centre', `${sewn}/${world.buttons.length}`],
    ['bobbin', 'Bobbins', 'spare thread', `x${world.bobbins.filter((bobbin) => !bobbin.taken).length}`],
  ];
  rows.forEach(([icon, name, hint, count], index) => {
    const y = top + 60 + index * 46;
    paintHazardIcon(ctx, icon, LEFT.x + 30, y - 4, world.garment.thread);
    paintText(ctx, name, LEFT.x + 56, y - 3, { size: 15, weight: 900 });
    paintText(ctx, hint, LEFT.x + 56, y + 13, { size: 12, weight: 600, color: INK.textSoft });
    paintText(ctx, count, LEFT.x + LEFT.width - 14, y + 3, { size: 15, weight: 900, color: INK.red, align: 'right' });
  });
}

export function paintHazardIcon(ctx, icon, x, y, threadColor = INK.navy) {
  if (icon === 'ripper') paintSeamRipper(ctx, x + 10, y, 0, 0.62);
  if (icon === 'pin') paintPin(ctx, x, y, Math.PI / 4, 0.62);
  if (icon === 'scissors') paintScissors(ctx, x, y, -Math.PI / 2, 1, 0.62);
  if (icon === 'iron') paintIron(ctx, x, y + 4, 0.42);
  if (icon === 'button') paintButton(ctx, x, y, INK.red, false, threadColor, 0.95);
  if (icon === 'bobbin') paintBobbin(ctx, x, y, threadColor, 0.95);
}

function paintChainPanel(ctx, world) {
  const top = CLOTH.top + 342;
  const height = CLOTH.bottom - top;
  paintPaper(ctx, LEFT.x, top, LEFT.width, height);
  const multiplier = chainMultiplier(world);
  paintTitle(ctx, LEFT, top, 'CHAIN', `${world.chain.count} in a row`);
  paintText(ctx, `x${multiplier.toFixed(2)}`, LEFT.x + 14, top + 72, { size: 40, weight: 900, color: multiplier > 1 ? INK.teal : INK.textSoft });
  const intoStep = (world.chain.count % CHAIN.stitchesPerStep) / CHAIN.stitchesPerStep;
  paintBar(ctx, LEFT.x + 14, top + 84, LEFT.width - 28, 7, multiplier >= CHAIN.maxMultiplier ? 1 : intoStep, INK.teal);
  paintText(ctx, 'stay on the line to raise it', LEFT.x + 14, top + 108, { size: 12, weight: 700, color: INK.textSoft });

  const neatness = neatnessOf(world.tally);
  paintText(ctx, 'NEATNESS', LEFT.x + 14, top + 140, { size: 15, weight: 900, color: INK.red, spacing: 3 });
  paintText(ctx, `${Math.round(neatness * 100)}%`, LEFT.x + 14, top + 180, { size: 34, weight: 900 });
  paintRosette(ctx, LEFT.x + LEFT.width - 46, top + 158, 22, ribbonFor(neatness));

  const chips = [['perfect', INK.teal], ['good', INK.mustard], ['sloppy', '#e07a2f'], ['off', INK.red]];
  chips.forEach(([rating, color], index) => {
    const x = LEFT.x + 14 + index * 49;
    ctx.beginPath();
    ctx.roundRect(x, top + 196, 44, 34, 8);
    ctx.fillStyle = color;
    ctx.fill();
    paintText(ctx, `${world.tally[rating]}`, x + 22, top + 213, { size: 15, weight: 900, color: '#ffffff', align: 'center' });
    paintText(ctx, rating, x + 22, top + 226, { size: 9, weight: 800, color: '#ffffff', align: 'center' });
  });
}

function paintNotionsPanel(ctx, world) {
  const top = CLOTH.top;
  const owned = listOwnedNotions(world);
  paintPaper(ctx, RIGHT.x, top, RIGHT.width, 250);
  paintTitle(ctx, RIGHT, top, 'NOTIONS', `${owned.length} of ${NOTIONS.length}`);
  if (owned.length === 0) {
    paintWrappedText(ctx, 'Finish a garment to visit the haberdashery and pick your first notion.', RIGHT.x + RIGHT.width / 2, top + 62, RIGHT.width - 36, 20, {
      size: 14, weight: 600, color: INK.textSoft,
    });
    return;
  }
  owned.slice(0, 7).forEach((notion, index) => {
    const y = top + 56 + index * 27;
    paintText(ctx, notion.name, RIGHT.x + 14, y, { size: 15, weight: 800 });
    for (let pip = 0; pip < notion.limit; pip++) {
      ctx.fillStyle = pip < notion.level ? INK.teal : 'rgba(58, 42, 32, 0.18)';
      ctx.fillRect(RIGHT.x + RIGHT.width - 14 - (notion.limit - pip) * 13, y - 10, 10, 10);
    }
  });
}

function paintThreadPanel(ctx, world) {
  const top = CLOTH.top + 262;
  paintPaper(ctx, RIGHT.x, top, RIGHT.width, 112);
  const share = world.thread.left / world.thread.capacity;
  const low = share < 0.25;
  paintTitle(ctx, RIGHT, top, 'THREAD', low ? 'LOW!' : 'empty = lose');
  paintBobbin(ctx, RIGHT.x + 32, top + 64, world.garment.thread, 1.5);
  paintText(ctx, `${Math.round(share * 100)}%`, RIGHT.x + 62, top + 76, { size: 34, weight: 900, color: low ? INK.red : INK.text });
  paintBar(ctx, RIGHT.x + 14, top + 92, RIGHT.width - 28, 9, share, low ? INK.red : INK.navy);
}

function paintPedalPanel(ctx, world) {
  const top = CLOTH.top + 386;
  const height = CLOTH.bottom - top;
  const needle = world.needle;
  paintPaper(ctx, RIGHT.x, top, RIGHT.width, height);
  paintTitle(ctx, RIGHT, top, 'PEDAL', `x${paceMultiplier(world).toFixed(1)} points`);

  ['brake', 'cruise', 'fast'].forEach((pedal, index) => {
    const x = RIGHT.x + 14 + index * 65;
    const on = needle.pedal === pedal;
    ctx.beginPath();
    ctx.roundRect(x, top + 40, 61, 30, 8);
    ctx.fillStyle = on ? (pedal === 'fast' ? INK.red : pedal === 'brake' ? INK.navy : INK.teal) : 'rgba(58, 42, 32, 0.12)';
    ctx.fill();
    paintText(ctx, ['BRAKE', 'CRUISE', 'FLAT OUT'][index], x + 30.5, top + 60, { size: 11, weight: 900, color: on ? '#ffffff' : INK.textSoft, align: 'center' });
  });
  paintBar(ctx, RIGHT.x + 14, top + 78, RIGHT.width - 28, 7, needle.speed / PEDAL.fast.speed, INK.red);

  const [word, color] = RATING_WORDS[needle.lastRating];
  paintText(ctx, 'LAST STITCH', RIGHT.x + 14, top + 112, { size: 12, weight: 800, color: INK.textSoft, spacing: 2 });
  paintText(ctx, word, RIGHT.x + 14, top + 138, { size: 24, weight: 900, color });

  const gap = ripperGap(world);
  const close = gap < 120;
  paintText(ctx, 'RIPPER', RIGHT.x + 14, top + 170, { size: 12, weight: 800, color: INK.textSoft, spacing: 2 });
  paintText(ctx, gap === Infinity ? 'asleep' : close ? 'RIGHT BEHIND YOU!' : `${Math.round(gap)}px behind`, RIGHT.x + RIGHT.width - 14, top + 170, {
    size: 13, weight: 900, color: close ? INK.red : INK.text, align: 'right',
  });
  paintBar(ctx, RIGHT.x + 14, top + 180, RIGHT.width - 28, 9, gap === Infinity ? 1 : gap / 500, close ? INK.red : INK.teal);
  paintText(ctx, 'brake too long and it bends a needle', RIGHT.x + 14, top + 208, { size: 11, weight: 700, color: INK.textSoft });
}

function paintControlsLegend(ctx, world, muted) {
  const y = CLOTH.bottom + 22;
  paintKeycap(ctx, 14, y, 'MOUSE / A D', 'STEER');
  paintKeycap(ctx, 196, y, 'HOLD CLICK / W', 'FLAT OUT');
  paintKeycap(ctx, 436, y, 'HOLD RIGHT-CLICK / S', 'BRAKE');
  const hopX = paintKeycap(ctx, 700, y, 'SPACE', 'HOP');
  const cooldown = NEEDLE.hopCooldown * world.kit.hopCooldownScale;
  paintBar(ctx, hopX + 8, y + 9, 60, 8, 1 - world.needle.hopCooldown / cooldown, INK.mustard, 'rgba(255, 255, 255, 0.35)');
  paintKeycap(ctx, 900, y, 'P', 'PAUSE');
  paintKeycap(ctx, 1010, y, 'R', 'RESTART');
  paintKeycap(ctx, 1136, y, 'M', muted ? 'MUTED' : 'SOUND');
}

function paintGarmentBanner(ctx, world) {
  if (world.bannerClock <= 0) return;
  const alpha = Math.min(1, world.bannerClock / 0.6);
  const y = CLOTH.top + 300;
  ctx.save();
  ctx.globalAlpha = alpha;
  paintPaper(ctx, CENTER_X - 250, y - 62, 500, 104, 18);
  paintText(ctx, `GARMENT ${world.garmentNumber}`, CENTER_X, y - 22, { size: 22, weight: 900, color: INK.red, align: 'center', spacing: 5 });
  paintText(ctx, world.garment.name, CENTER_X, y + 22, { size: 42, weight: 900, align: 'center' });
  ctx.restore();
}
