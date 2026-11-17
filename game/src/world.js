// One run of Running Stitch: its state, the fixed simulation step, and the loop of a run:
// pick a commission from the order book, sew it, pick a notion at the haberdashery, and on to
// the next order. Win by sewing all six; lose with no needles or no thread.

import { commissionsOnOffer, ORDERS_IN_A_RUN, writeOrderBook } from './systems/orderBook.js';
import { updateSeamRipper } from './entities/seamRipper.js';
import { updateRivals } from './entities/rivals.js';
import { updateHazards } from './entities/hazards.js';
import { tieLockStitch } from './entities/lockStitch.js';
import { buyNotion, createKit, rollNotionChoices } from './data/notions.js';
import { garmentBonus, ribbonFor } from './systems/scoring.js';
import { layGarment } from './systems/layGarment.js';
import { driveNeedle } from './entities/needle.js';
import { layStitches, sewButtonsAndBobbins } from './entities/stitching.js';
import { updateParticles } from './effects/particles.js';
import { NEEDLE } from './config.js';
import { createRng } from './core/rng.js';

// phase: 'orderBook' | 'sewing' | 'haberdashery' | 'gameOver' | 'victory'
export function createWorld(seed) {
  const rng = createRng(seed);
  return {
    seed,
    rng,
    phase: 'orderBook',
    time: 0,
    score: 0,
    orderBook: writeOrderBook(rng),
    needles: { left: NEEDLE.startNeedles, max: NEEDLE.startNeedles },
    chain: { count: 0, best: 0 },
    stats: { stitches: 0, buttons: 0, hops: 0, knots: 0, wins: 0, podiums: 0, bent: 0 },
    knots: { held: 1, tied: [] },
    rivals: [],
    kit: createKit(),
    notionChoices: [],
    finished: [],
    lastBonus: null,
    loseReason: '',
    particles: [],
    floaters: [],
    sounds: [],
    shake: 0,
    hurtFlash: 0,
  };
}

// The player picked a commission from the order book: lay it on the cloth and start sewing.
export function takeCommission(world, index) {
  const commission = commissionsOnOffer(world)[index];
  if (world.phase !== 'orderBook' || !commission) return false;
  world.orderBook.taken.push(commission);
  layGarment(world, commission);
  world.phase = 'sewing';
  return true;
}

// One fixed step. `controls` come from the player's input or from the autopilot.
export function stepWorld(world, controls, dt) {
  if (world.phase !== 'sewing') return;
  world.time += dt;
  world.garmentClock += dt;
  world.bannerClock = Math.max(0, world.bannerClock - dt);
  world.shake = Math.max(0, world.shake - dt * 2.5);
  world.hurtFlash = Math.max(0, world.hurtFlash - dt);

  driveNeedle(world, controls, dt);
  if (controls.knot) tieLockStitch(world);
  updateRivals(world, dt);
  layStitches(world);
  sewButtonsAndBobbins(world);
  updateHazards(world, dt);
  updateSeamRipper(world, dt);
  updateParticles(world, dt);

  if (world.phase === 'sewing' && world.needle.progress >= world.path.points.length - 4) finishGarment(world);
}

function finishGarment(world) {
  const bonus = garmentBonus(world);
  world.score += bonus.total;
  world.lastBonus = bonus;
  if (bonus.place === 1) world.stats.wins += 1;
  if (bonus.place <= 3) world.stats.podiums += 1;
  world.finished.push({
    place: bonus.place,
    name: world.garment.name,
    fabric: world.garment.fabric,
    thread: world.garment.thread,
    stitches: world.stitches,
    neatness: bonus.neatness,
    ribbon: ribbonFor(bonus.neatness),
    seconds: Math.round(world.garmentClock),
  });
  world.sounds.push('garmentDone');
  if (world.orderBook.stop + 1 >= ORDERS_IN_A_RUN) {
    world.phase = 'victory';
    return;
  }
  world.notionChoices = rollNotionChoices(world);
  world.phase = 'haberdashery';
}

// The player picked a notion at the haberdashery: buy it and open the order book at the next stop.
export function chooseNotion(world, index) {
  const notion = world.notionChoices[index];
  if (world.phase !== 'haberdashery' || !notion) return false;
  buyNotion(world, notion);
  world.notionChoices = [];
  world.orderBook.stop += 1;
  world.phase = 'orderBook';
  return true;
}
