// The seam ripper: it wakes once you have sewn a little, then follows your own stitches and
// unpicks them. Brake too long and it catches the needle.

import { RIPPER, STITCH } from '../config.js';
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

// How far behind the needle the ripper is, in pixels of seam (Infinity while it sleeps).
export function ripperGap(world) {
  if (!world.ripper.awake) return Infinity;
  return Math.max(0, (world.stitches.length - world.ripper.at) * STITCH.length);
}
