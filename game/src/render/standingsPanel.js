// The Sewing Bee panel: live standings of you and the three rival tailors on this seam, with
// each one's gap to the leader and what your current place would pay.

import { INK } from '../config.js';
import { PLACE_NAMES } from '../data/rivalTailors.js';
import { currentPlace, podiumBonus, raceStandings } from '../systems/standings.js';
import { formatScore, paintPaper, paintText } from './paint.js';

export function paintStandingsPanel(ctx, world, column, top) {
  paintPaper(ctx, column.x, top, column.width, 168);
  const place = currentPlace(world);
  paintText(ctx, 'RIVALS', column.x + 14, top + 26, { size: 15, weight: 900, color: INK.red, spacing: 3 });
  paintText(ctx, `${PLACE_NAMES[place - 1]} pays +${formatScore(podiumBonus(world, place))}`, column.x + column.width - 14, top + 26, {
    size: 12, weight: 800, align: 'right',
  });

  raceStandings(world).forEach((row, index) => {
    const y = top + 56 + index * 28;
    if (row.you) {
      ctx.beginPath();
      ctx.roundRect(column.x + 8, y - 18, column.width - 16, 25, 7);
      ctx.fillStyle = 'rgba(233, 185, 73, 0.45)';
      ctx.fill();
    }
    paintText(ctx, `${index + 1}`, column.x + 16, y, { size: 16, weight: 900, color: INK.textSoft });
    ctx.beginPath();
    ctx.arc(column.x + 40, y - 5, 6, 0, Math.PI * 2);
    ctx.fillStyle = row.color;
    ctx.fill();
    ctx.strokeStyle = INK.text;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    paintText(ctx, row.name, column.x + 52, y, { size: 14, weight: 900 });
    const note = row.finished ? 'DONE' : row.fumbling ? 'fumble!' : index === 0 ? 'leads' : `+${row.gap}px`;
    paintText(ctx, note, column.x + column.width - 14, y, { size: 12, weight: 800, color: row.finished || row.fumbling ? INK.red : INK.textSoft, align: 'right' });
  });
}
