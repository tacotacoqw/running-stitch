// What lies in wait on the cloth: pins to hop, scissors that snap shut on a rhythm, a hot iron
// sliding to and fro.

import { INK, REWARD, THREAD } from '../config.js';
import { spawnBurst, spawnFloatingWord } from '../effects/particles.js';
import { breakChain } from '../systems/scoring.js';
import { bendNeedle, isHopping } from './needle.js';

export const SCISSORS_CYCLE = { seconds: 2.6, shutFor: 0.95 };

// `shutScale` shortens the shut part of the cycle (the Thread Snips notion).
export function scissorsAreShut(scissors, shutScale = 1) {
  return scissors.clock % SCISSORS_CYCLE.seconds < SCISSORS_CYCLE.shutFor * shutScale;
}

export function updateHazards(world, dt) {
  updatePins(world, dt);
  updateScissors(world, dt);
  updateIron(world, dt);
}

function updatePins(world, dt) {
  const needle = world.needle;
  for (const pin of world.pins) {
    // A pin the Grandmaster has just thrown is harmless for a moment while it lands.
    pin.fresh = Math.max(0, pin.fresh - dt);
    if (pin.gone || pin.fresh > 0) continue;
    if (Math.hypot(pin.x - needle.x, pin.y - needle.y) >= 11) continue;
    if (isHopping(world)) {
      if (!pin.hopped) {
        pin.hopped = true;
        world.score += REWARD.cleanHop;
        world.stats.hops += 1;
        spawnFloatingWord(world, pin.x, pin.y - 18, `clean hop +${REWARD.cleanHop}`, INK.teal, 18);
      }
    } else if (!pin.hopped && needle.safe <= 0) {
      pin.gone = true;
      if (world.kit.pinGuardsLeft > 0) {
        world.kit.pinGuardsLeft -= 1;
        spawnFloatingWord(world, pin.x, pin.y - 18, 'pincushion saved you', INK.plum, 18);
        world.sounds.push('bobbin');
      } else {
        bendNeedle(world, 'you hit a pin');
      }
    }
  }
}

function updateScissors(world, dt) {
  const needle = world.needle;
  const shutScale = world.kit.scissorsShutScale;
  for (const scissors of world.scissors) {
    const wasShut = scissorsAreShut(scissors, shutScale);
    scissors.clock += dt;
    const shut = scissorsAreShut(scissors, shutScale);
    if (!wasShut && shut) world.sounds.push('snip');
    if (shut && needle.safe <= 0 && Math.hypot(scissors.x - needle.x, scissors.y - needle.y) < 17) {
      // Snipped: no needle is lost, but a length of thread and the chain are.
      world.thread.left = Math.max(1, world.thread.left - world.thread.capacity * THREAD.snipLoss);
      needle.safe = 1;
      breakChain(world);
      world.shake = 0.4;
      world.sounds.push('snap');
      spawnBurst(world, needle.x, needle.y, world.garment.thread, 16, 220);
      spawnFloatingWord(world, needle.x, needle.y - 22, 'thread snipped!', INK.red, 20);
    }
  }
}

function updateIron(world, dt) {
  const iron = world.iron;
  if (!iron) return;
  iron.clock += dt;
  const swing = 0.5 - 0.5 * Math.cos((iron.clock / iron.seconds) * Math.PI * 2);
  iron.x = iron.from[0] + (iron.to[0] - iron.from[0]) * swing;
  iron.y = iron.from[1] + (iron.to[1] - iron.from[1]) * swing;
  if (Math.hypot(iron.x - world.needle.x, iron.y - world.needle.y) < iron.radius + 4) bendNeedle(world, 'scorched by the iron');
}
