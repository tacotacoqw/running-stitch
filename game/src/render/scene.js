// Paints the sewing table: the cloth, the chalk pattern line, the stitches laid so far, every
// hazard and pickup, the seam ripper on your trail and the needle. Also paints finished pieces
// as small patches for the results screens.

import { CLOTH, INK, STITCH, VIEW } from '../config.js';
import { scissorsAreShut, SCISSORS_CYCLE } from '../entities/hazards.js';
import { paintCloth, paintTable, fabricPattern } from './fabric.js';
import { seamPointAt } from '../core/seamPath.js';
import { LOCK_STITCH } from '../entities/lockStitch.js';
import { FONT_STACK, paintText } from './paint.js';
import { paintBobbin, paintButton, paintIron, paintNeedle, paintPin, paintRosette, paintScissors, paintSeamRipper } from './sprites.js';

const RATING_RING = { perfect: INK.teal, good: INK.mustard, sloppy: '#e07a2f', off: INK.red };
const BUTTON_COLORS = [INK.red, INK.teal, INK.mustard, INK.plum, '#ffffff'];

export function paintScene(ctx, world, time) {
  paintTable(ctx);
  ctx.save();
  if (world.shake > 0) {
    const jolt = world.shake * world.shake * 12;
    ctx.translate(Math.sin(time * 91) * jolt, Math.cos(time * 77) * jolt);
  }
  paintCloth(ctx, world.garment.fabric);
  paintChalkLine(ctx, world);
  paintIronRail(ctx, world);
  for (const bobbin of world.bobbins) if (!bobbin.taken) paintBobbin(ctx, bobbin.x, bobbin.y, world.garment.thread);
  paintStitches(ctx, world.stitches, world.garment.thread, 4);
  world.buttons.forEach((button, order) => {
    ctx.globalAlpha = button.missed ? 0.45 : 1;
    paintButton(ctx, button.x, button.y, BUTTON_COLORS[order % BUTTON_COLORS.length], button.sewn, world.garment.thread);
    ctx.globalAlpha = 1;
  });
  for (const pin of world.pins) {
    if (pin.gone) continue;
    if (pin.fresh > 0) {
      // A pin the Grandmaster has thrown: a red ring closes in on where it will land.
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, 10 + pin.fresh * 26, 0, Math.PI * 2);
      ctx.strokeStyle = INK.red;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.globalAlpha = 0.5;
    }
    paintPin(ctx, pin.x, pin.y, pin.angle, 1, pin.hopped ? INK.teal : pin.fresh > 0 ? INK.red : INK.mustard);
    ctx.globalAlpha = 1;
  }
  for (const scissors of world.scissors) paintScissors(ctx, scissors.x, scissors.y, scissors.angle, scissorsOpenness(scissors));
  if (world.iron) paintIron(ctx, world.iron.x, world.iron.y, 1, time);
  paintLockStitches(ctx, world);
  paintRivals(ctx, world);
  paintRipperAndNeedle(ctx, world, time);
  paintEffects(ctx, world);
  ctx.restore();

  if (world.hurtFlash > 0) {
    ctx.fillStyle = `rgba(217, 72, 59, ${world.hurtFlash * 0.6})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
}

// 0 while shut, opening smoothly to 1 and closing again just before the next snap.
function scissorsOpenness(scissors) {
  if (scissorsAreShut(scissors)) return 0;
  const openFor = SCISSORS_CYCLE.seconds - SCISSORS_CYCLE.shutFor;
  const into = (scissors.clock % SCISSORS_CYCLE.seconds) - SCISSORS_CYCLE.shutFor;
  return Math.min(1, into / 0.3, (openFor - into) / 0.45);
}

function paintChalkLine(ctx, world) {
  const points = world.path.points;
  const from = Math.max(0, world.needle.progress - 2);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // The forgiving band either side of the line, then the chalk line still to sew.
  ctx.beginPath();
  ctx.moveTo(points[from].x, points[from].y);
  for (let i = from + 1; i < points.length; i += 2) ctx.lineTo(points[i].x, points[i].y);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = STITCH.goodWithin * 2 * world.kit.precision * world.rules.precision;
  ctx.stroke();
  ctx.setLineDash([9, 8]);
  ctx.strokeStyle = 'rgba(40, 22, 10, 0.35)';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = INK.chalk;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.setLineDash([]);

  const end = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(end.x, end.y, 13, 0, Math.PI * 2);
  ctx.fillStyle = INK.paper;
  ctx.fill();
  ctx.strokeStyle = INK.text;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  paintText(ctx, 'END', end.x, end.y + 4, { size: 10, weight: 900, align: 'center' });
}

function paintIronRail(ctx, world) {
  const iron = world.iron;
  if (!iron) return;
  ctx.setLineDash([3, 9]);
  ctx.beginPath();
  ctx.moveTo(iron.from[0], iron.from[1]);
  ctx.lineTo(iron.to[0], iron.to[1]);
  ctx.strokeStyle = 'rgba(40, 22, 10, 0.5)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.setLineDash([]);
}

// Every stitch as a short thread with a shadow; unpicked ones leave only their needle holes.
export function paintStitches(ctx, stitches, threadColor, width) {
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const stitch of stitches) {
    if (stitch.ripped) continue;
    ctx.moveTo(stitch.ax + 1, stitch.ay + 2);
    ctx.lineTo(stitch.ax + (stitch.bx - stitch.ax) * 0.66 + 1, stitch.ay + (stitch.by - stitch.ay) * 0.66 + 2);
  }
  ctx.strokeStyle = 'rgba(30, 14, 4, 0.45)';
  ctx.lineWidth = width + 1;
  ctx.stroke();
  ctx.beginPath();
  for (const stitch of stitches) {
    if (stitch.ripped) continue;
    ctx.moveTo(stitch.ax, stitch.ay);
    ctx.lineTo(stitch.ax + (stitch.bx - stitch.ax) * 0.66, stitch.ay + (stitch.by - stitch.ay) * 0.66);
  }
  ctx.strokeStyle = threadColor;
  ctx.lineWidth = width;
  ctx.stroke();
  // Unpicked stitches hang on as loose, faded thread beside their needle holes.
  ctx.beginPath();
  for (const stitch of stitches) {
    if (!stitch.ripped) continue;
    ctx.moveTo(stitch.ax, stitch.ay);
    ctx.quadraticCurveTo(stitch.ax + (stitch.by - stitch.ay) * 0.35, stitch.ay - (stitch.bx - stitch.ax) * 0.35, stitch.ax + (stitch.bx - stitch.ax) * 0.6, stitch.ay + (stitch.by - stitch.ay) * 0.6);
  }
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = width * 0.55;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(30, 14, 4, 0.4)';
  for (const stitch of stitches) {
    if (stitch.ripped) ctx.fillRect(stitch.ax - 1, stitch.ay - 1, 2.5, 2.5);
  }
}

// Each rival tailor: a short run of their own thread beside the chalk line, their needle in
// their colour, and a name flag.
function paintRivals(ctx, world) {
  const points = world.path.points;
  for (const rival of world.rivals) {
    const at = Math.floor(rival.index);
    const spot = seamPointAt(world.path, at);
    const sideX = -Math.sin(spot.angle) * rival.lane * 9;
    const sideY = Math.cos(spot.angle) * rival.lane * 9;
    ctx.beginPath();
    for (let i = Math.max(0, at - 44); i <= at; i += 2) {
      if (i === Math.max(0, at - 44)) ctx.moveTo(points[i].x + sideX, points[i].y + sideY);
      else ctx.lineTo(points[i].x + sideX, points[i].y + sideY);
    }
    ctx.setLineDash([7, 5]);
    ctx.strokeStyle = rival.tailor.color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]);

    const x = spot.x + sideX;
    const y = spot.y + sideY;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = rival.tailor.color;
    ctx.fill();
    ctx.strokeStyle = INK.paper;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = INK.paper;
    ctx.fill();

    const flag = rival.fumble > 0 ? 'fumble!' : rival.finishedAt !== null ? `${rival.tailor.name}: done` : rival.tailor.name;
    ctx.font = `800 11px ${FONT_STACK}`;
    const width = ctx.measureText(flag).width + 10;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - 29, width, 16, 5);
    ctx.fillStyle = rival.tailor.color;
    ctx.fill();
    paintText(ctx, flag, x, y - 17, { size: 11, weight: 800, color: '#ffffff', align: 'center' });
  }
}

// A knot of the lock stitch: a little bow on the seam, ringed while it still holds the ripper.
function paintLockStitches(ctx, world) {
  for (const knot of world.knots.tied) {
    ctx.save();
    ctx.translate(knot.x, knot.y);
    ctx.fillStyle = world.garment.thread;
    ctx.strokeStyle = INK.text;
    ctx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * 7, -1, 7, 4.5, side * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (knot.holds > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, 15, -Math.PI / 2, -Math.PI / 2 + (knot.holds / LOCK_STITCH.holdsSeconds) * Math.PI * 2);
      ctx.strokeStyle = INK.navy;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }
}

function paintRipperAndNeedle(ctx, world, time) {
  const needle = world.needle;
  const ripper = world.ripper;
  if (ripper.awake) {
    paintSeamRipper(ctx, ripper.x, ripper.y, ripper.angle, ripper.grandmaster ? 1.4 : 1, ripper.dazed > 0, time);
    paintText(ctx, ripper.dazed > 0 ? 'dazed' : ripper.grandmaster ? 'GRANDMASTER RIPPER' : 'SEAM RIPPER', ripper.x, ripper.y - 22, {
      size: 12, weight: 900, color: INK.paper, align: 'center', spacing: 1, shadow: 'rgba(40, 22, 10, 0.8)',
    });
  }
  const lastStitch = world.stitches[world.stitches.length - 1];
  if (lastStitch && needle.hop <= 0) {
    ctx.beginPath();
    ctx.moveTo(needle.stitchFromX, needle.stitchFromY);
    ctx.lineTo(needle.x, needle.y);
    ctx.strokeStyle = world.garment.thread;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  const lift = needle.hop > 0 ? Math.sin((needle.hop / 0.42) * Math.PI) : 0;
  const blink = needle.safe > 0 && Math.floor(needle.safe * 12) % 2 === 0;
  paintNeedle(ctx, needle.x, needle.y, needle.heading, lift, RATING_RING[needle.lastRating], blink);
}

function paintEffects(ctx, world) {
  for (const particle of world.particles) {
    ctx.globalAlpha = 1 - particle.age / particle.life;
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
  for (const floater of world.floaters) {
    paintText(ctx, floater.text, floater.x, floater.y, {
      size: floater.size, weight: 900, color: floater.color, align: 'center', alpha: 1 - floater.age / floater.life, shadow: 'rgba(255, 255, 255, 0.7)',
    });
  }
}

// A finished garment as a small patch: its fabric, the seam exactly as it was sewn, its ribbon.
export function paintPatch(ctx, piece, x, y, width) {
  const scale = width / (CLOTH.right - CLOTH.left);
  const height = (CLOTH.bottom - CLOTH.top) * scale;
  ctx.save();
  ctx.fillStyle = 'rgba(40, 22, 10, 0.35)';
  ctx.fillRect(x + 3, y + 4, width, height);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.fillStyle = fabricPattern(ctx, piece.fabric);
  ctx.fillRect(x, y, width, height);
  ctx.translate(x - CLOTH.left * scale, y - CLOTH.top * scale);
  ctx.scale(scale, scale);
  paintStitches(ctx, piece.stitches.map((stitch) => ({ ...stitch, ripped: false })), piece.thread, 6);
  ctx.restore();
  ctx.strokeStyle = INK.text;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  paintRosette(ctx, x + width - 6, y + 8, 15, piece.ribbon);
  return height;
}
