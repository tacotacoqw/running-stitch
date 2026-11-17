// Balance check: the autopilot sews whole runs headless and prints how each one went.
//   node tools/simulate.mjs [runs] [firstSeed] [skill]

import { createAutopilot, steerAutopilot } from '../game/src/autopilot.js';
import { STEP_SECONDS } from '../game/src/config.js';
import { commissionsOnOffer } from '../game/src/systems/orderBook.js';
import { chooseNotion, createWorld, stepWorld, takeCommission } from '../game/src/world.js';

const runs = Number(process.argv[2] ?? 5);
const firstSeed = Number(process.argv[3] ?? 1);
const skill = Number(process.argv[4] ?? 1);

for (let seed = firstSeed; seed < firstSeed + runs; seed++) {
  const world = createWorld(seed);
  const pilot = createAutopilot(skill);
  for (let step = 0; step < 120 * 60 * 20 && world.phase !== 'gameOver' && world.phase !== 'victory'; step++) {
    if (world.phase === 'orderBook') takeCommission(world, world.rng.int(0, commissionsOnOffer(world).length - 1));
    if (world.phase === 'haberdashery') chooseNotion(world, world.rng.int(0, world.notionChoices.length - 1));
    stepWorld(world, steerAutopilot(pilot, world), STEP_SECONDS);
    world.sounds.length = 0;
  }
  const pieces = world.finished.map((piece) => `${piece.name} ${Math.round(piece.neatness * 100)}%${piece.ribbon} ${piece.seconds}s`).join(', ');
  console.log(`seed ${seed}: ${world.phase} on order ${world.orderBook.stop + 1}, score ${world.score}, needles ${world.needles.left}/${world.needles.max}, ` +
    `thread ${Math.round((world.thread.left / world.thread.capacity) * 100)}%, best chain ${world.chain.best}, ${world.loseReason}\n   ${pieces}`);
}
