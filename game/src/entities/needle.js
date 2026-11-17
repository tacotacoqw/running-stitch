// The needle the player drives: the pedal, steering, the hop over pins, and bending needles.

import { CLOTH, NEEDLE, PEDAL } from '../config.js';
import { nearestOnSeam, seamPointAt } from '../core/seamPath.js';
import { spawnBurst } from '../effects/particles.js';
import { breakChain } from '../systems/scoring.js';

export function placeNeedleAtStart(world) {
  const start = seamPointAt(world.path, 0);
  world.needle = {
    x: start.x, y: start.y, heading: start.angle, speed: 0, pedal: 'cruise',
    progress: 0, wobble: 0, hop: 0, hopCooldown: 0, safe: 1.2,
    sinceStitch: 0, stitchFromX: start.x, stitchFromY: start.y, lastRating: 'perfect',
  };
}

export function driveNeedle(world, controls, dt) {
  const needle = world.needle;
  needle.pedal = controls.brake ? 'brake' : controls.fast ? 'fast' : 'cruise';
  const pedal = PEDAL[needle.pedal];
  // The fabric's trait scales how fast the cloth feeds and how tightly it turns.
  needle.speed += (pedal.speed * world.rules.speed - needle.speed) * Math.min(1, PEDAL.response * dt);

  const turnRate = pedal.turn * world.kit.turnScale * world.rules.turn;
  if (controls.useAim) {
    const want = Math.atan2(controls.aimY - needle.y, controls.aimX - needle.x);
    let turn = (want - needle.heading) % (Math.PI * 2);
    if (turn > Math.PI) turn -= Math.PI * 2;
    if (turn < -Math.PI) turn += Math.PI * 2;
    const far = Math.hypot(controls.aimX - needle.x, controls.aimY - needle.y) > 6;
    if (far) needle.heading += Math.max(-turnRate * dt, Math.min(turnRate * dt, turn));
  } else {
    needle.heading += controls.turn * turnRate * dt;
  }

  const travel = needle.speed * dt;
  needle.x = Math.max(CLOTH.left + 8, Math.min(CLOTH.right - 8, needle.x + Math.cos(needle.heading) * travel));
  needle.y = Math.max(CLOTH.top + 8, Math.min(CLOTH.bottom - 8, needle.y + Math.sin(needle.heading) * travel));
  needle.sinceStitch += travel;

  const ahead = nearestOnSeam(world.path, needle.x, needle.y, needle.progress, needle.progress + 45);
  if (ahead.gap < 34) needle.progress = ahead.index;
  needle.wobble = nearestOnSeam(world.path, needle.x, needle.y, needle.progress - 12, needle.progress + 45).gap;

  needle.safe = Math.max(0, needle.safe - dt);
  needle.hopCooldown = Math.max(0, needle.hopCooldown - dt);
  if (controls.hop && needle.hop <= 0 && needle.hopCooldown <= 0) {
    needle.hop = NEEDLE.hopSeconds;
    needle.hopCooldown = NEEDLE.hopCooldown * world.kit.hopCooldownScale;
    world.sounds.push('hop');
  }
  if (needle.hop > 0) {
    needle.hop -= dt;
    // No thread is laid in the air: the next stitch starts where the needle lands.
    needle.sinceStitch = 0;
    needle.stitchFromX = needle.x;
    needle.stitchFromY = needle.y;
  }
}

export function isHopping(world) {
  return world.needle.hop > 0;
}

// Bends a needle. Returns true when it was the last one.
export function bendNeedle(world, why) {
  const needle = world.needle;
  if (needle.safe > 0 || world.phase !== 'sewing') return false;
  world.needles.left -= 1;
  world.stats.bent += 1;
  needle.safe = NEEDLE.hurtSafeSeconds * world.kit.safeScale;
  breakChain(world);
  world.shake = 0.6;
  world.hurtFlash = 0.35;
  world.sounds.push('snap');
  spawnBurst(world, needle.x, needle.y, '#d9483b', 18, 260);
  world.floaters.push({ x: needle.x, y: needle.y - 24, text: why, color: '#d9483b', size: 20, age: 0, life: 1.1 });
  if (world.needles.left <= 0) {
    world.phase = 'gameOver';
    world.loseReason = `Your last needle bent: ${why}`;
    return true;
  }
  return false;
}
