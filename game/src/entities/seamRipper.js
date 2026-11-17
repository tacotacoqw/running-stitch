// The seam ripper: it wakes once you have sewn a little, then follows your own stitches and
// unpicks them. Brake too long and it catches the needle.

import { RIPPER, STITCH } from '../config.js';
import { seamPointAt } from '../core/seamPath.js';
import { bendNeedle } from './needle.js';

export function updateSeamRipper(world, dt) {
  const ripper = world.ripper;
  const stitches = world.stitches;
  if (!ripper.awake) {
    if (stitches.length * STITCH.length >= RIPPER.headStart) {
      ripper.awake = true;
      world.sounds.push('ripperWakes');
    }
    return;
  }
  if (ripper.dazed > 0) {
    ripper.dazed -= dt;
    return;
  }
  if (ripper.grandmaster) throwPinsAhead(world, dt);

  ripper.at += (ripper.speed / STITCH.length) * dt;
  const reached = Math.min(stitches.length - 1, Math.floor(ripper.at));
  for (let i = Math.max(0, reached - 3); i < reached; i++) stitches[i].ripped = true;

  const stitch = stitches[Math.max(0, reached)];
  if (stitch) {
    const along = Math.max(0, Math.min(1, ripper.at - reached));
    ripper.x = stitch.ax + (stitch.bx - stitch.ax) * along;
    ripper.y = stitch.ay + (stitch.by - stitch.ay) * along;
    ripper.angle = Math.atan2(stitch.by - stitch.ay, stitch.bx - stitch.ax);
  }

  if (ripper.at >= stitches.length - 0.5) {
    // Caught the needle: it costs a needle and the ripper is thrown back down the seam.
    world.needle.safe = 0;
    bendNeedle(world, 'the seam ripper caught you');
    ripper.at = Math.max(0, ripper.at - RIPPER.thrownBack / STITCH.length);
    ripper.dazed = RIPPER.dazedSeconds;
  }
}

// The Grandmaster Ripper of the royal commission does more than follow: every few seconds it
// flings a pin onto the seam ahead of the needle, which lands after a short warning.
function throwPinsAhead(world, dt) {
  const ripper = world.ripper;
  ripper.pinClock -= dt;
  if (ripper.pinClock > 0) return;
  ripper.pinClock = 3.4;
  const index = world.needle.progress + world.rng.int(38, 60);
  if (index > world.path.points.length - 30) return;
  world.pins.push({ ...seamPointAt(world.path, index), index, gone: false, hopped: false, fresh: 1 });
  world.sounds.push('snip');
}

// The boss's resolve is the seam still to sew: finish the cape and it is beaten.
export function grandmasterResolve(world) {
  return 1 - world.needle.progress / (world.path.points.length - 1);
}

// How far behind the needle the ripper is, in pixels of seam (Infinity while it sleeps).
export function ripperGap(world) {
  if (!world.ripper.awake) return Infinity;
  return Math.max(0, (world.stitches.length - world.ripper.at) * STITCH.length);
}
