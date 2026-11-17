// Score: stitch ratings, the neat-stitch chain and its multiplier, neatness, ribbons and grades.

import { CHAIN, PEDAL, REWARD, RIBBONS, STITCH } from '../config.js';

export function rateStitch(world, wobble) {
  const give = world.kit.precision;
  if (wobble <= STITCH.perfectWithin * give) return 'perfect';
  if (wobble <= STITCH.goodWithin * give) return 'good';
  if (wobble <= STITCH.sloppyWithin) return 'sloppy';
  return 'off';
}

export function chainMultiplier(world) {
  return Math.min(CHAIN.maxMultiplier, 1 + Math.floor(world.chain.count / CHAIN.stitchesPerStep) * CHAIN.stepBonus);
}

export function paceMultiplier(world) {
  const pace = PEDAL[world.needle.pedal].pace;
  return world.needle.pedal === 'fast' ? pace + world.kit.paceBonus : pace;
}

// Scores one stitch and keeps the chain: perfect and good stitches build it, anything else breaks it.
export function scoreStitch(world, rating) {
  world.tally[rating] += 1;
  if (rating === 'perfect' || rating === 'good') {
    world.chain.count += 1;
    world.chain.best = Math.max(world.chain.best, world.chain.count);
  } else {
    breakChain(world);
  }
  const points = Math.round(STITCH.points[rating] * chainMultiplier(world) * paceMultiplier(world));
  world.score += points;
  return points;
}

export function breakChain(world) {
  world.chain.count = 0;
}

export function neatnessOf(tally) {
  const stitches = tally.perfect + tally.good + tally.sloppy + tally.off;
  if (stitches === 0) return 1;
  const weights = STITCH.neatness;
  return (tally.perfect * weights.perfect + tally.good * weights.good + tally.sloppy * weights.sloppy) / stitches;
}

export function ribbonFor(neatness) {
  return RIBBONS.find((ribbon) => neatness >= ribbon.neatness).letter;
}

// The bonus paid when a garment is finished, itemised for the results card.
export function garmentBonus(world) {
  const neatness = neatnessOf(world.tally);
  const neat = Math.round(neatness * 100) * REWARD.neatnessPerPercent * world.garmentNumber;
  const needles = world.needles.left * REWARD.needleLeft;
  const thread = Math.round((world.thread.left / world.thread.capacity) * 300);
  return { neatness, neat, needles, thread, total: neat + needles + thread };
}

export function summarizeRun(world) {
  const done = world.finished.length;
  const meanNeatness = done > 0 ? world.finished.reduce((sum, piece) => sum + piece.neatness, 0) / done : neatnessOf(world.tally);
  return {
    score: world.score,
    garmentsDone: done,
    neatnessPercent: Math.round(meanNeatness * 100),
    ribbon: ribbonFor(meanNeatness),
    bestChain: world.chain.best,
    buttons: world.stats.buttons,
    stitches: world.stats.stitches,
  };
}
