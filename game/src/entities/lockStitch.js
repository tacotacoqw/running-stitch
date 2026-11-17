// The lock stitch: every button you sew on earns a knot (up to three). Spend one to tie off
// the seam at the needle: the seam ripper cannot unpick past a knot until it has gnawed
// through it, and a ripper that is close when you tie it is thrown back.

import { INK, STITCH } from '../config.js';
import { spawnBurst, spawnFloatingWord } from '../effects/particles.js';

export const LOCK_STITCH = { maxKnots: 3, holdsSeconds: 4.5, throwsBackWithin: 110, thrownBack: 160 };

export function earnKnot(world) {
  world.knots.held = Math.min(LOCK_STITCH.maxKnots, world.knots.held + 1);
}

export function tieLockStitch(world) {
  const needle = world.needle;
  if (world.knots.held <= 0 || world.stitches.length < 2 || needle.hop > 0) return false;
  world.knots.held -= 1;
  world.knots.tied.push({ stitch: world.stitches.length - 1, x: needle.x, y: needle.y, holds: LOCK_STITCH.holdsSeconds });
  world.stats.knots += 1;
  world.sounds.push('knot');
  spawnBurst(world, needle.x, needle.y, world.garment.thread, 14, 180);
  spawnFloatingWord(world, needle.x, needle.y - 24, 'lock stitch!', INK.navy, 20);

  const ripper = world.ripper;
  const gap = (world.stitches.length - ripper.at) * STITCH.length;
  if (ripper.awake && gap < LOCK_STITCH.throwsBackWithin) {
    ripper.at = Math.max(0, ripper.at - LOCK_STITCH.thrownBack / STITCH.length);
    ripper.dazed = 1.2;
  }
  return true;
}

// Called by the seam ripper as it advances: returns the furthest stitch it may reach this step.
// A knot ahead of it stops it there while it gnaws; a gnawed-through knot comes undone.
export function holdRipperAtKnots(world, wantsToReach, dt) {
  for (const knot of world.knots.tied) {
    if (knot.holds <= 0 || wantsToReach < knot.stitch) continue;
    knot.holds -= dt;
    return knot.stitch;
  }
  return wantsToReach;
}
