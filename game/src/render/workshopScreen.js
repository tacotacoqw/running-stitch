// The workshop screen: the bench of permanent upgrades, what each costs in thimbles, and the
// badges won so far.

import { INK, VIEW } from '../config.js';
import { BADGES } from '../data/badges.js';
import { WORKSHOP_BENCH } from '../data/workshopBench.js';
import { benchLevel, nextCost } from '../systems/workshop.js';
import { paintTable } from './fabric.js';
import { paintPaper, paintStitchedText, paintText, paintWrappedText } from './paint.js';

const CENTER_X = VIEW.width / 2;
const CARD = { width: 372, height: 150, gapX: 20, gapY: 16, top: 190 };

function benchCardBox(index) {
  const total = 3 * CARD.width + 2 * CARD.gapX;
  return {
    x: CENTER_X - total / 2 + (index % 3) * (CARD.width + CARD.gapX),
    y: CARD.top + Math.floor(index / 3) * (CARD.height + CARD.gapY),
  };
}

// Which bench upgrade (0 to 5) is under the pointer, or -1.
export function benchCardAt(x, y) {
  for (let index = 0; index < WORKSHOP_BENCH.length; index++) {
    const box = benchCardBox(index);
    if (x >= box.x && x <= box.x + CARD.width && y >= box.y && y <= box.y + CARD.height) return index;
  }
  return -1;
}

export function paintWorkshopScreen(ctx, save, pointer) {
  paintTable(ctx);
  ctx.fillStyle = 'rgba(44, 24, 10, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  paintStitchedText(ctx, 'THE WORKSHOP', CENTER_X, 104, { size: 84, spacing: 6, thread: INK.teal });
  paintText(ctx, `${save.thimbles} thimbles to spend   ·   earned by score, podiums and Sewing Bee wins`, CENTER_X, 152, {
    size: 22, weight: 800, color: INK.mustard, align: 'center',
  });

  const hovered = benchCardAt(pointer.x, pointer.y);
  WORKSHOP_BENCH.forEach((upgrade, index) => {
    const box = benchCardBox(index);
    const level = benchLevel(save, upgrade);
    const cost = nextCost(save, upgrade);
    const affordable = cost !== null && save.thimbles >= cost;
    paintPaper(ctx, box.x, box.y, CARD.width, CARD.height, 16, INK.paper, hovered === index ? INK.red : INK.paperEdge);
    paintText(ctx, `${index + 1}`, box.x + 20, box.y + 40, { size: 30, weight: 900, color: INK.red });
    paintText(ctx, upgrade.name, box.x + 52, box.y + 38, { size: 24, weight: 900 });
    paintWrappedText(ctx, upgrade.text, box.x + CARD.width / 2, box.y + 70, CARD.width - 40, 20, { size: 15, color: INK.textSoft });
    for (let pip = 0; pip < upgrade.costs.length; pip++) {
      ctx.fillStyle = pip < level ? INK.teal : 'rgba(58, 42, 32, 0.18)';
      ctx.fillRect(box.x + 20 + pip * 22, box.y + CARD.height - 34, 17, 17);
    }
    const label = cost === null ? 'FULLY FITTED' : `${cost} thimbles`;
    paintText(ctx, label, box.x + CARD.width - 20, box.y + CARD.height - 20, {
      size: 16, weight: 900, color: cost === null ? INK.teal : affordable ? INK.text : INK.textSoft, align: 'right',
    });
  });

  // The badge shelf.
  const shelfTop = CARD.top + 2 * (CARD.height + CARD.gapY) + 10;
  paintPaper(ctx, 62, shelfTop, VIEW.width - 124, 150, 16);
  const held = BADGES.filter((badge) => save.badges[badge.id]).length;
  paintText(ctx, 'BADGES', 82, shelfTop + 30, { size: 15, weight: 900, color: INK.red, spacing: 3 });
  paintText(ctx, `${held} of ${BADGES.length}`, VIEW.width - 82, shelfTop + 30, { size: 15, weight: 900, align: 'right' });
  BADGES.forEach((badge, index) => {
    const x = 82 + (index % 5) * 226;
    const y = shelfTop + 62 + Math.floor(index / 5) * 44;
    const won = Boolean(save.badges[badge.id]);
    ctx.beginPath();
    ctx.arc(x + 10, y - 5, 10, 0, Math.PI * 2);
    ctx.fillStyle = won ? INK.mustard : 'rgba(58, 42, 32, 0.15)';
    ctx.fill();
    ctx.strokeStyle = INK.text;
    ctx.lineWidth = 2;
    ctx.stroke();
    paintText(ctx, badge.name, x + 28, y - 4, { size: 14, weight: 900, color: won ? INK.text : INK.textSoft });
    paintText(ctx, badge.text, x + 28, y + 11, { size: 11, weight: 600, color: INK.textSoft });
  });

  paintText(ctx, 'Press 1 to 6 or click to buy   ·   Esc or Enter returns to the title screen', CENTER_X, 772, { size: 18, weight: 800, color: INK.paper, align: 'center' });
}
