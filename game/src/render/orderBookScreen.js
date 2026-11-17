// The order book screen: the route of the run's six orders across the top, and under it the
// commissions on offer at this stop, each with its pattern, fabric trait, hazards and pay.

import { INK, VIEW } from '../config.js';
import { buildSeamPath } from '../core/seamPath.js';
import { seamOutlineOnCloth } from '../systems/layGarment.js';
import { commissionsOnOffer, ORDERS_IN_A_RUN, orderNumber } from '../systems/orderBook.js';
import { fabricPattern } from './fabric.js';
import { paintHazardIcon } from './hud.js';
import { formatScore, paintPaper, paintStitchedText, paintText } from './paint.js';
import { paintRosette } from './sprites.js';

const CENTER_X = VIEW.width / 2;
const CARD = { width: 430, height: 400, gap: 40, top: 318 };
const previewCache = new Map();

function commissionCardLeft(index, count) {
  const total = count * CARD.width + (count - 1) * CARD.gap;
  return CENTER_X - total / 2 + index * (CARD.width + CARD.gap);
}

// Which commission card is under the pointer, or -1.
export function commissionCardAt(world, x, y) {
  const count = commissionsOnOffer(world).length;
  for (let index = 0; index < count; index++) {
    const left = commissionCardLeft(index, count);
    if (x >= left && x <= left + CARD.width && y >= CARD.top && y <= CARD.top + CARD.height) return index;
  }
  return -1;
}

export function paintOrderBookScreen(ctx, world, pointer) {
  ctx.fillStyle = 'rgba(44, 24, 10, 0.9)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  paintStitchedText(ctx, 'THE ORDER BOOK', CENTER_X, 104, { size: 80, spacing: 6 });
  const offers = commissionsOnOffer(world);
  const royal = offers[0].royal;
  const ask = royal ? 'The last order: the Queen wants her cape, and the Grandmaster Ripper wants it unpicked.' : 'Choose your next commission: the harder garment pays more.';
  paintText(ctx, ask, CENTER_X, 146, { size: 22, weight: 800, color: INK.mustard, align: 'center' });

  paintRoute(ctx, world);

  const hovered = commissionCardAt(world, pointer.x, pointer.y);
  offers.forEach((commission, index) => paintCommissionCard(ctx, commission, commissionCardLeft(index, offers.length), index, hovered === index));

  const hint = offers.length > 1 ? 'Click a commission or press 1 or 2' : 'Click the commission or press 1';
  paintText(ctx, hint, CENTER_X, 750, { size: 20, weight: 800, color: INK.paper, align: 'center' });
  const kit = Object.values(world.kit.owned).reduce((sum, level) => sum + level, 0);
  paintText(ctx, `needles ${world.needles.left}/${world.needles.max}   ·   notions ${kit}   ·   score ${formatScore(world.score)}`, CENTER_X, 778, {
    size: 15, weight: 800, color: INK.mustard, align: 'center', spacing: 2,
  });
}

// Six stops joined by a line of stitches: ribbons for the orders sewn, a crown for the last.
function paintRoute(ctx, world) {
  const y = 226;
  const left = 260;
  const step = (VIEW.width - left * 2) / (ORDERS_IN_A_RUN - 1);
  ctx.setLineDash([12, 9]);
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(VIEW.width - left, y);
  ctx.strokeStyle = INK.paper;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.setLineDash([]);

  for (let stop = 0; stop < ORDERS_IN_A_RUN; stop++) {
    const x = left + stop * step;
    const piece = world.finished[stop];
    const current = stop === world.orderBook.stop;
    const last = stop === ORDERS_IN_A_RUN - 1;
    if (piece) {
      paintRosette(ctx, x, y - 6, 22, piece.ribbon, INK.teal);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, current ? 28 : 22, 0, Math.PI * 2);
      ctx.fillStyle = current ? INK.mustard : last ? INK.red : INK.paper;
      ctx.fill();
      ctx.strokeStyle = INK.text;
      ctx.lineWidth = 3;
      ctx.stroke();
      paintText(ctx, last ? 'Q' : `${stop + 1}`, x, y + 9, { size: 26, weight: 900, align: 'center', color: last && !current ? INK.paper : INK.text });
    }
    const label = piece ? piece.name : current ? 'YOU ARE HERE' : last ? 'ROYAL COMMISSION' : `order ${stop + 1}`;
    paintText(ctx, label, x, y + 58, { size: 13, weight: 900, color: current ? INK.mustard : INK.paper, align: 'center', spacing: 1 });
  }
}

function paintCommissionCard(ctx, commission, left, index, hovered) {
  const top = CARD.top + (hovered ? -8 : 0);
  paintPaper(ctx, left, top, CARD.width, CARD.height, 18, INK.paper, hovered ? INK.red : INK.paperEdge);

  // The pattern, chalked on a swatch of the fabric it is to be cut from.
  const swatch = { x: left + 16, y: top + 16, width: CARD.width - 32, height: 168 };
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(swatch.x, swatch.y, swatch.width, swatch.height, 10);
  ctx.clip();
  ctx.fillStyle = fabricPattern(ctx, commission.fabric.id);
  ctx.fillRect(swatch.x, swatch.y, swatch.width, swatch.height);
  paintPatternPreview(ctx, commission.garment, swatch.x + swatch.width / 2, swatch.y + swatch.height / 2, 0.25);
  ctx.restore();
  paintRosette(ctx, left + CARD.width - 46, top + 46, 24, `x${commission.pay}`.replace('x1.25', '1¼').replace('x1.5', '1½').replace('x1', '1').replace('x2', '2'));
  paintText(ctx, 'PAYS', left + CARD.width - 46, top + 100, { size: 11, weight: 900, color: INK.paper, align: 'center', spacing: 2, shadow: 'rgba(40, 22, 10, 0.8)' });

  paintText(ctx, commission.garment.name, left + 20, top + 222, { size: 30, weight: 900 });
  paintText(ctx, `for ${commission.customer}`, left + CARD.width - 20, top + 220, { size: 15, weight: 800, color: INK.textSoft, align: 'right' });
  paintText(ctx, commission.fabric.name.toUpperCase(), left + 20, top + 252, { size: 14, weight: 900, color: INK.navy, spacing: 2 });
  paintText(ctx, `${commission.fabric.trait}: ${commission.fabric.text}`, left + 20, top + 274, { size: 15, weight: 700, color: INK.text });

  const hazards = commission.hazards;
  const list = [['pin', `x${hazards.pins}`], ['scissors', `x${hazards.scissors}`], ['iron', hazards.iron ? 'x1' : 'none'], ['button', `x${hazards.buttons}`], ['bobbin', `x${hazards.bobbins}`]];
  list.forEach(([icon, count], order) => {
    const x = left + 36 + order * 80;
    paintHazardIcon(ctx, icon, x, top + 316, commission.fabric.thread);
    paintText(ctx, count, x + 20, top + 322, { size: 15, weight: 900, color: INK.red });
  });
  if (commission.royal) paintText(ctx, 'BOSS: the Grandmaster Ripper throws pins ahead of you', left + 20, top + 350, { size: 13, weight: 900, color: INK.red });

  ctx.beginPath();
  ctx.roundRect(left + CARD.width / 2 - 30, top + CARD.height - 42, 60, 30, 8);
  ctx.fillStyle = INK.red;
  ctx.fill();
  paintText(ctx, `${index + 1}`, left + CARD.width / 2, top + CARD.height - 20, { size: 20, weight: 900, color: '#ffffff', align: 'center' });
}

// A garment's whole seam, outline and topstitching, as a small chalk drawing.
function paintPatternPreview(ctx, garment, x, y, scale) {
  let path = previewCache.get(garment.name);
  if (!path) {
    path = buildSeamPath(seamOutlineOnCloth(garment));
    previewCache.set(garment.name, path);
  }
  ctx.save();
  ctx.translate(x - (VIEW.width / 2) * scale, y - 416 * scale);
  ctx.scale(scale, scale);
  ctx.beginPath();
  path.points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else if (index % 2 === 0) ctx.lineTo(point.x, point.y);
  });
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(40, 22, 10, 0.4)';
  ctx.lineWidth = 16;
  ctx.stroke();
  ctx.setLineDash([26, 20]);
  ctx.strokeStyle = INK.chalk;
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.restore();
}
