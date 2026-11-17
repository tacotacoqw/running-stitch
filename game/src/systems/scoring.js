// Score: stitch ratings, the neat-stitch chain and its multiplier, what a commission pays,
// neatness, ribbons and the end-of-run summary.

import { CHAIN, PEDAL, REWARD, RIBBONS, STITCH } from '../config.js';
import { stitchStyleOf } from '../data/stitchStyles.js';
import { finishingPlace, podiumBonus } from './standings.js';

export function rateStitch(world, wobble) {
  const give = world.kit.precision * world.rules.precision * stitchStyleOf(world).give;
  if (wobble <= STITCH.perfectWithin * give) return 'perfect';
  if (wobble <= STITCH.goodWithin * give) return 'good';
  if (wobble <= STITCH.sloppyWithin) return 'sloppy';
  return 'off';
}

export function chainMultiplier(world) {
  const built = 1 + Math.floor(world.chain.count / CHAIN.stitchesPerStep) * CHAIN.stepBonus;
  return Math.min(CHAIN.maxMultiplier, Math.max(world.kit.chainFloor, built));
}

export function paceMultiplier(world) {
  const pace = PEDAL[world.needle.pedal].pace;
  return world.needle.pedal === 'fast' ? pace + world.kit.paceBonus : pace;
}

// Scores one stitch and keeps the chain: perfect and good stitches build it, anything else breaks it.
export function scoreStitch(world, rating) {
  world.tally[rating] += 1;
  if (rating === 'perfect' || rating === 'good') {
    world.chain.count += world.rules.chainRate;
    world.chain.best = Math.max(world.chain.best, world.chain.count);
  } else {
    breakChain(world);
  }
  const worth = STITCH.points[rating] * world.rules.stitchScore * world.commission.pay * stitchStyleOf(world).worth;
  const points = Math.round(worth * chainMultiplier(world) * paceMultiplier(world));
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
  const order = world.orderBook.stop + 1;
  const scale = world.commission.pay * world.kit.bonusScale;
  const neat = Math.round(Math.round(neatness * 100) * REWARD.neatnessPerPercent * order * world.rules.neatBonus * scale);
  const needles = Math.round(world.needles.left * REWARD.needleLeft * scale);
  const thread = Math.round((world.thread.left / world.thread.capacity) * 300 * scale);
  const place = finishingPlace(world);
  const podium = podiumBonus(world, place);
  return { neatness, neat, needles, thread, place, podium, total: neat + needles + thread + podium };
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
    wins: world.stats.wins,
    podiums: world.stats.podiums,
    stitches: world.stats.stitches,
  };
}
