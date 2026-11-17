// The menu screens painted over the table: title, the haberdashery after a garment, pause,
// game over and the finished quilt.

import { INK, VIEW } from '../config.js';
import { ORDERS_IN_A_RUN, orderNumber } from '../systems/orderBook.js';
import { formatScore, paintPaper, paintStitchedText, paintText, paintWrappedText } from './paint.js';
import { paintPatch } from './scene.js';
import { paintHazardIcon } from './hud.js';
import { paintBobbin, paintButton, paintNeedle, paintPin, paintRosette, paintSeamRipper } from './sprites.js';

const CENTER_X = VIEW.width / 2;
const CARD = { width: 290, height: 250, gap: 34, top: 440 };

function shade(ctx, strength) {
  ctx.fillStyle = `rgba(44, 24, 10, ${strength})`;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function paintPrompt(ctx, text, y, time) {
  const bob = Math.sin(time * 4) * 2;
  paintPaper(ctx, CENTER_X - 390, y - 52 + bob, 780, 76, 38, INK.mustard, INK.text);
  paintText(ctx, text, CENTER_X, y + bob, { size: 40, weight: 900, align: 'center', spacing: 1 });
}

export function paintTitleScreen(ctx, bestScore, time) {
  shade(ctx, 0.5);
  paintStitchedText(ctx, 'RUNNING STITCH', CENTER_X + 4, 212, { size: 118, spacing: 8 });
  paintText(ctx, 'Race your needle down the chalk line. Outrun the seam ripper.', CENTER_X, 270, { size: 28, weight: 800, color: INK.mustard, align: 'center' });

  const controls = [
    ['STEER', 'Mouse, or A and D'],
    ['FLAT OUT', 'Hold click or W: double points'],
    ['BRAKE', 'Hold right-click or S'],
    ['HOP', 'Space: jump a pin'],
  ];
  const column = 262;
  const left = CENTER_X - (controls.length * column) / 2;
  paintPaper(ctx, left - 16, 314, controls.length * column + 32, 150, 18);
  controls.forEach(([name, keys], index) => {
    const x = left + index * column + column / 2;
    paintText(ctx, name, x, 362, { size: 26, weight: 900, color: INK.red, align: 'center', spacing: 3 });
    paintText(ctx, keys, x, 394, { size: 16, weight: 700, align: 'center' });
  });
  paintText(ctx, 'Six orders a run, picked from the order book: 12 patterns, 6 fabrics, 14 notions, and the Grandmaster Ripper waiting on the last.', CENTER_X, 440, {
    size: 15, weight: 700, color: INK.textSoft, align: 'center',
  });

  paintPrompt(ctx, 'CLICK OR PRESS ENTER TO START', 548, time);
  const best = bestScore > 0 ? `BEST SCORE  ${formatScore(bestScore)}` : 'P pauses  ·  R restarts  ·  M mutes';
  paintText(ctx, best, CENTER_X, 606, { size: 17, weight: 800, color: INK.paper, align: 'center', spacing: 3 });

  const legend = [
    ['ripper', 'Seam Ripper', 'unpicks your seam'],
    ['pin', 'Pins', 'hop over them'],
    ['scissors', 'Scissors', 'wait till they open'],
    ['iron', 'Hot Iron', 'keep well clear'],
    ['button', 'Buttons', 'sew dead centre'],
    ['bobbin', 'Bobbins', 'spare thread'],
  ];
  const cell = 198;
  const legendLeft = CENTER_X - (legend.length * cell) / 2;
  paintPaper(ctx, legendLeft - 12, 660, legend.length * cell + 24, 100, 16);
  paintText(ctx, 'ON THE CLOTH', legendLeft + 4, 684, { size: 13, weight: 900, color: INK.red, spacing: 4 });
  legend.forEach(([icon, name, hint], index) => {
    const x = legendLeft + index * cell;
    paintHazardIcon(ctx, icon, x + 24, 722);
    paintText(ctx, name, x + 52, 720, { size: 15, weight: 900 });
    paintText(ctx, hint, x + 52, 737, { size: 12, weight: 600, color: INK.textSoft });
  });
}

function notionCardLeft(index) {
  const total = 3 * CARD.width + 2 * CARD.gap;
  return CENTER_X - total / 2 + index * (CARD.width + CARD.gap);
}

// Which notion card (0 to 2) is under the pointer, or -1.
export function notionCardAt(x, y) {
  for (let index = 0; index < 3; index++) {
    const left = notionCardLeft(index);
    if (x >= left && x <= left + CARD.width && y >= CARD.top && y <= CARD.top + CARD.height) return index;
  }
  return -1;
}

export function paintHaberdasheryScreen(ctx, world, pointer, time) {
  shade(ctx, 0.72);
  const piece = world.finished[world.finished.length - 1];
  const bonus = world.lastBonus;
  paintStitchedText(ctx, `${piece.name.toUpperCase()} FINISHED!`, CENTER_X, 112, { size: 64, spacing: 4, thread: INK.teal });

  // The garment exactly as it was sewn, with its ribbon and the bonus it earned.
  paintPaper(ctx, CENTER_X - 400, 140, 800, 232, 18);
  paintPatch(ctx, piece, CENTER_X - 380, 160, 240);
  paintText(ctx, 'NEATNESS', CENTER_X - 110, 190, { size: 15, weight: 900, color: INK.red, spacing: 3 });
  paintText(ctx, `${Math.round(piece.neatness * 100)}%`, CENTER_X - 110, 244, { size: 56, weight: 900 });
  paintRosette(ctx, CENTER_X + 70, 216, 40, piece.ribbon);
  const lines = [['neat stitching', bonus.neat], ['needles left', bonus.needles], ['thread left', bonus.thread]];
  lines.forEach(([label, points], index) => {
    paintText(ctx, label, CENTER_X + 150, 186 + index * 30, { size: 16, weight: 700, color: INK.textSoft });
    paintText(ctx, `+${formatScore(points)}`, CENTER_X + 376, 186 + index * 30, { size: 18, weight: 900, align: 'right' });
  });
  paintText(ctx, 'GARMENT BONUS', CENTER_X + 150, 292, { size: 14, weight: 900, color: INK.red, spacing: 2 });
  paintText(ctx, `+${formatScore(bonus.total)}`, CENTER_X + 376, 336, { size: 38, weight: 900, color: INK.teal, align: 'right' });
  paintText(ctx, `sewn in ${piece.seconds}s  ·  score ${formatScore(world.score)}`, CENTER_X - 110, 344, { size: 15, weight: 700, color: INK.textSoft });

  paintText(ctx, 'THE HABERDASHERY: PICK ONE NOTION', CENTER_X, 418, { size: 24, weight: 900, color: INK.mustard, align: 'center', spacing: 4 });
  const hovered = notionCardAt(pointer.x, pointer.y);
  world.notionChoices.forEach((notion, index) => {
    const left = notionCardLeft(index);
    const lift = hovered === index ? -8 : 0;
    const middle = left + CARD.width / 2;
    paintPaper(ctx, left, CARD.top + lift, CARD.width, CARD.height, 18, INK.paper, hovered === index ? INK.red : INK.paperEdge);
    paintNotionIcon(ctx, notion.icon, middle, CARD.top + 62 + lift);
    paintText(ctx, notion.name, middle, CARD.top + 134 + lift, { size: 25, weight: 900, align: 'center' });
    paintWrappedText(ctx, notion.text, middle, CARD.top + 164 + lift, CARD.width - 44, 21, { size: 15, color: INK.textSoft });
    ctx.beginPath();
    ctx.roundRect(middle - 26, CARD.top + 206 + lift, 52, 30, 8);
    ctx.fillStyle = INK.red;
    ctx.fill();
    paintText(ctx, `${index + 1}`, middle, CARD.top + 228 + lift, { size: 20, weight: 900, color: '#ffffff', align: 'center' });
  });
  paintText(ctx, 'Click a card or press 1, 2 or 3', CENTER_X, 730, { size: 20, weight: 800, color: INK.paper, align: 'center' });
}

function paintNotionIcon(ctx, icon, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK.text;
  if (icon === 'thimble') {
    ctx.fillStyle = INK.steel;
    ctx.beginPath(); ctx.moveTo(-24, 30); ctx.lineTo(-18, -18); ctx.quadraticCurveTo(0, -38, 18, -18); ctx.lineTo(24, 30); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK.steelDark;
    for (let row = 0; row < 3; row++) for (let dot = -1; dot <= 1; dot++) { ctx.beginPath(); ctx.arc(dot * 10, -12 + row * 12, 2, 0, Math.PI * 2); ctx.fill(); }
  } else if (icon === 'spool') {
    paintBobbin(ctx, 0, 0, INK.plum, 3);
  } else if (icon === 'wax') {
    ctx.fillStyle = INK.mustard;
    ctx.beginPath();
    for (let side = 0; side < 6; side++) { const angle = (side / 6) * Math.PI * 2; ctx.lineTo(Math.cos(angle) * 34, Math.sin(angle) * 34); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (icon === 'needle') {
    ctx.rotate(-0.6);
    ctx.fillStyle = INK.steelDark;
    ctx.beginPath(); ctx.moveTo(-5, -44); ctx.lineTo(5, -44); ctx.lineTo(1, 44); ctx.lineTo(-1, 44); ctx.closePath(); ctx.fill();
    ctx.fillStyle = INK.paper; ctx.fillRect(-2, -38, 4, 14);
  } else if (icon === 'foot') {
    ctx.scale(2.6, 2.6);
    paintNeedle(ctx, 0, 0, 0, 0, null, false);
  } else if (icon === 'cushion') {
    ctx.fillStyle = INK.red;
    ctx.beginPath(); ctx.arc(0, 6, 32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    paintPin(ctx, -8, -18, -Math.PI / 2 - 0.3, 0.9);
    paintPin(ctx, 12, -14, -Math.PI / 2 + 0.3, 0.9, INK.teal);
  } else if (icon === 'button') {
    paintButton(ctx, 0, 0, INK.mustard, true, INK.red, 3);
  } else if (icon === 'ripper') {
    paintSeamRipper(ctx, 16, 0, -0.4, 1.5);
  } else if (icon === 'tape') {
    ctx.fillStyle = INK.mustard;
    ctx.beginPath(); ctx.arc(-8, 0, 28, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillRect(18, 14, 28, 14); ctx.strokeRect(18, 14, 28, 14);
    ctx.fillStyle = INK.paper;
    ctx.beginPath(); ctx.arc(-8, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (icon === 'case') {
    ctx.fillStyle = INK.teal;
    ctx.beginPath(); ctx.roundRect(-38, -18, 76, 36, 16); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = INK.paper;
    for (let needle = -1; needle <= 1; needle++) { ctx.beginPath(); ctx.moveTo(-24, needle * 8); ctx.lineTo(24, needle * 8); ctx.stroke(); }
  } else if (icon === 'weights') {
    ctx.fillStyle = INK.steelDark;
    for (const [dx, dy] of [[-20, 10], [20, 10], [0, -16]]) { ctx.beginPath(); ctx.arc(dx, dy, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  } else if (icon === 'wheel') {
    ctx.fillStyle = INK.paper;
    ctx.beginPath(); ctx.arc(14, 12, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = INK.red; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(4, 2); ctx.lineTo(-34, -30); ctx.stroke();
  } else if (icon === 'snips') {
    ctx.fillStyle = INK.steel;
    ctx.beginPath(); ctx.moveTo(-36, -16); ctx.lineTo(36, 0); ctx.lineTo(-36, 16); ctx.lineTo(-24, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK.red;
    ctx.beginPath(); ctx.arc(-22, 0, 5, 0, Math.PI * 2); ctx.fill();
  } else if (icon === 'pedal') {
    ctx.fillStyle = INK.navy;
    ctx.beginPath(); ctx.moveTo(-36, 28); ctx.lineTo(36, 28); ctx.lineTo(30, -6); ctx.lineTo(-26, -28); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = INK.paper;
    for (let rib = 0; rib < 3; rib++) { ctx.beginPath(); ctx.moveTo(-18 + rib * 4, -8 + rib * 11); ctx.lineTo(22 + rib * 3, 2 + rib * 8); ctx.stroke(); }
  }
  ctx.restore();
}

export function paintPauseScreen(ctx) {
  shade(ctx, 0.7);
  paintStitchedText(ctx, 'PAUSED', CENTER_X, 400, { size: 110, spacing: 12 });
  paintText(ctx, 'P or Esc to resume   ·   R to restart   ·   M to mute', CENTER_X, 462, { size: 22, weight: 800, color: INK.paper, align: 'center' });
}

// The run's summary card and every finished garment as a patch of the quilt.
function paintRunSummary(ctx, world, summary, bestScore, isNewBest, top) {
  paintPaper(ctx, CENTER_X - 480, top, 960, 300, 20);
  const rows = [
    ['SCORE', formatScore(summary.score)],
    ['ORDERS SEWN', `${summary.garmentsDone} / ${ORDERS_IN_A_RUN}`],
    ['NEATNESS', `${summary.neatnessPercent}%`],
    ['BEST NEAT CHAIN', `${summary.bestChain} stitches`],
    ['BUTTONS SEWN ON', `${summary.buttons}`],
  ];
  rows.forEach(([label, value], index) => {
    const y = top + 56 + index * 44;
    const first = index === 0;
    paintText(ctx, label, CENTER_X - 448, y, { size: first ? 24 : 18, weight: 900, color: INK.textSoft, spacing: 3 });
    paintText(ctx, value, CENTER_X - 60, y, { size: first ? 46 : 26, weight: 900, align: 'right', color: first ? INK.red : INK.text });
  });
  paintText(ctx, isNewBest ? 'NEW BEST SCORE!' : `BEST ${formatScore(bestScore)}`, CENTER_X - 448, top + 278, {
    size: 16, weight: 900, color: isNewBest ? INK.teal : INK.textSoft, spacing: 3,
  });

  paintRosette(ctx, CENTER_X + 30, top + 96, 46, summary.ribbon);
  paintText(ctx, 'RIBBON', CENTER_X + 30, top + 196, { size: 14, weight: 900, color: INK.red, align: 'center', spacing: 4 });

  paintText(ctx, 'YOUR QUILT', CENTER_X + 120, top + 34, { size: 14, weight: 900, color: INK.red, spacing: 4 });
  const patch = 108;
  for (let slot = 0; slot < ORDERS_IN_A_RUN; slot++) {
    const x = CENTER_X + 120 + (slot % 3) * (patch + 10);
    const y = top + 46 + Math.floor(slot / 3) * 100;
    const piece = world.finished[slot];
    if (piece) {
      paintPatch(ctx, piece, x, y, patch);
    } else {
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(58, 42, 32, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, patch, patch * 0.795);
      ctx.setLineDash([]);
    }
  }
}

export function paintGameOverScreen(ctx, world, summary, bestScore, isNewBest, time) {
  shade(ctx, 0.76);
  paintStitchedText(ctx, 'ALL UNPICKED!', CENTER_X, 150, { size: 104, spacing: 8, color: '#ffd9d2' });
  paintText(ctx, `${world.loseReason} on order ${orderNumber(world)}: ${world.garment.name}`, CENTER_X, 200, { size: 24, weight: 800, color: INK.paper, align: 'center' });
  paintRunSummary(ctx, world, summary, bestScore, isNewBest, 232);
  paintPrompt(ctx, 'PRESS R OR CLICK TO RESTART', 626, time);
  paintText(ctx, 'Esc returns to the title screen', CENTER_X, 700, { size: 18, weight: 800, color: INK.paper, align: 'center' });
}

export function paintVictoryScreen(ctx, world, summary, bestScore, isNewBest, time) {
  shade(ctx, 0.66);
  paintStitchedText(ctx, 'THE QUILT IS DONE!', CENTER_X, 150, { size: 96, spacing: 6, thread: INK.teal });
  paintText(ctx, 'Six orders sewn and the Grandmaster Ripper beaten. You win!', CENTER_X, 200, { size: 24, weight: 800, color: INK.mustard, align: 'center' });
  paintRunSummary(ctx, world, summary, bestScore, isNewBest, 232);
  paintPrompt(ctx, 'PRESS R OR CLICK TO PLAY AGAIN', 626, time);
  paintText(ctx, 'Esc returns to the title screen', CENTER_X, 700, { size: 18, weight: 800, color: INK.paper, align: 'center' });
}
