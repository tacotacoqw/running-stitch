// One run of Running Stitch: its state, the fixed simulation step, finishing a garment, and
// the rules for winning (sew all six) and losing (no needles, or no thread).

import { NEEDLE } from './config.js';
import { createRng } from './core/rng.js';
import { buyNotion, createKit, rollNotionChoices } from './data/notions.js';
import { updateHazards } from './entities/hazards.js';
import { driveNeedle } from './entities/needle.js';
import { updateSeamRipper } from './entities/seamRipper.js';
import { layStitches, sewButtonsAndBobbins } from './entities/stitching.js';
import { updateParticles } from './effects/particles.js';
import { garmentCount, layGarment } from './systems/layGarment.js';
import { garmentBonus, ribbonFor } from './systems/scoring.js';

// phase: 'sewing' | 'haberdashery' | 'gameOver' | 'victory'
export function createWorld(seed) {
  const world = {
    seed,
    rng: createRng(seed),
    phase: 'sewing',
    time: 0,
    score: 0,
    needles: { left: NEEDLE.startNeedles, max: NEEDLE.startNeedles },
    chain: { count: 0, best: 0 },
    stats: { stitches: 0, buttons: 0, hops: 0 },
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
  layGarment(world, 1);
  return world;
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
  world.finished.push({
    name: world.garment.name,
    fabric: world.garment.fabric,
    thread: world.garment.thread,
    stitches: world.stitches,
    neatness: bonus.neatness,
    ribbon: ribbonFor(bonus.neatness),
    seconds: Math.round(world.garmentClock),
  });
  world.sounds.push('garmentDone');
  if (world.garmentNumber >= garmentCount()) {
    world.phase = 'victory';
    return;
  }
  world.notionChoices = rollNotionChoices(world);
  world.phase = 'haberdashery';
}

// The player picked a notion at the haberdashery: buy it and lay the next garment.
export function chooseNotion(world, index) {
  const notion = world.notionChoices[index];
  if (world.phase !== 'haberdashery' || !notion) return false;
  buyNotion(world, notion);
  world.notionChoices = [];
  world.phase = 'sewing';
  layGarment(world, world.garmentNumber + 1);
  return true;
}
