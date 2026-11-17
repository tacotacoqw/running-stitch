// The Sewing Bee's standings: you and the three rival tailors, ranked by how far along the
// seam each has sewn, and what your place on the podium pays when the garment is finished.

import { PATH_SPACING } from '../core/seamPath.js';
import { PODIUM_PAY } from '../data/rivalTailors.js';

// Everyone on the seam, leader first: { name, color, you, index, gap (px behind the leader), finished }.
export function raceStandings(world) {
  const rows = world.rivals.map((rival) => ({
    name: rival.tailor.name, color: rival.tailor.color, you: false, index: rival.index, finished: rival.finishedAt !== null, fumbling: rival.fumble > 0,
  }));
  rows.push({ name: 'YOU', color: world.garment.thread, you: true, index: world.needle.progress, finished: false, fumbling: false });
  rows.sort((a, b) => (b.finished - a.finished) || (b.index - a.index));
  const lead = rows[0].index;
  for (const row of rows) row.gap = Math.round((lead - row.index) * PATH_SPACING);
  return rows;
}

// Your place right now, 1 to 4.
export function currentPlace(world) {
  return raceStandings(world).findIndex((row) => row.you) + 1;
}

// Your place when you reach END: one behind every rival who finished first.
export function finishingPlace(world) {
  return 1 + world.rivals.filter((rival) => rival.finishedAt !== null).length;
}

export function podiumBonus(world, place) {
  return Math.round(PODIUM_PAY[place - 1] * world.commission.pay * world.kit.bonusScale);
}
