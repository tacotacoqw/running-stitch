// Rival tailors: three needles that sew the same seam beside yours. They ease off for bends,
// fumble now and then, and get a little quicker with every order of the run.

import { PATH_SPACING, bendAhead } from '../core/seamPath.js';
import { RIVAL_TAILORS } from '../data/rivalTailors.js';

const RIVALS_PER_ORDER = 3;

export function seatRivals(world, order) {
  const bench = [...RIVAL_TAILORS];
  const rivals = [];
  for (let lane = 0; lane < RIVALS_PER_ORDER; lane++) {
    const tailor = bench.splice(world.rng.int(0, bench.length - 1), 1)[0];
    rivals.push({
      tailor,
      lane: lane - 1,
      index: 0,
      pace: tailor.pace * (1.2 + order * 0.035),
      sway: world.rng.range(0, 6),
      fumble: 0,
      untilFumble: world.rng.range(5, 11),
      finishedAt: null,
    });
  }
  return rivals;
}

export function updateRivals(world, dt) {
  const end = world.path.points.length - 4;
  for (const rival of world.rivals) {
    if (rival.finishedAt !== null) continue;
    if (rival.fumble > 0) {
      rival.fumble -= dt;
      continue;
    }
    rival.untilFumble -= dt;
    if (rival.untilFumble <= 0) {
      // A dropped stitch: the less nerve a tailor has, the longer it costs them.
      rival.fumble = 0.5 + (1 - rival.tailor.nerve) * 2.4;
      rival.untilFumble = world.rng.range(6, 13);
      continue;
    }
    const bend = bendAhead(world.path, Math.floor(rival.index), 20);
    const care = bend > 0.5 ? 0.7 : 1;
    const breath = 1 + 0.1 * Math.sin(world.time * 0.8 + rival.sway);
    rival.index += ((rival.pace * care * breath) / PATH_SPACING) * dt;
    if (rival.index >= end) {
      rival.index = end;
      rival.finishedAt = world.garmentClock;
      world.sounds.push('rivalDone');
    }
  }
}
