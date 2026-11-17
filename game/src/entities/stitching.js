// Laying stitches: each one is rated by how close it runs to the chalk line, scored, and paid
// for in thread. Sewing through a button's holes sews it on; a bobbin tops up the spool.

import { INK, REWARD, STITCH, THREAD } from '../config.js';
import { spawnBurst, spawnFloatingWord } from '../effects/particles.js';
import { chainMultiplier, rateStitch, scoreStitch } from '../systems/scoring.js';
import { isHopping } from './needle.js';

export function layStitches(world) {
  const needle = world.needle;
  if (isHopping(world) || needle.sinceStitch < STITCH.length) return;
  const rating = rateStitch(world, needle.wobble);
  world.stitches.push({ ax: needle.stitchFromX, ay: needle.stitchFromY, bx: needle.x, by: needle.y, rating, ripped: false });
  needle.stitchFromX = needle.x;
  needle.stitchFromY = needle.y;
  needle.lastRating = rating;
  world.thread.left -= needle.sinceStitch * world.rules.threadCost;
  needle.sinceStitch = 0;
  world.stats.stitches += 1;
  scoreStitch(world, rating);
  world.sounds.push(rating === 'off' ? 'stitchOff' : 'stitch');
  if (rating === 'perfect' && world.stats.stitches % 3 === 0) spawnBurst(world, needle.x, needle.y, INK.mustard, 2, 70);

  if (world.thread.left <= 0) {
    world.thread.left = 0;
    world.phase = 'gameOver';
    world.loseReason = 'The spool ran out of thread';
    world.sounds.push('snap');
  }
}

export function sewButtonsAndBobbins(world) {
  const needle = world.needle;
  for (const button of world.buttons) {
    if (button.sewn || button.missed) continue;
    const gap = Math.hypot(button.x - needle.x, button.y - needle.y);
    if (gap < 11 && !isHopping(world)) {
      button.sewn = true;
      const points = Math.round(REWARD.button * world.kit.buttonScale * world.rules.buttons * world.commission.pay * chainMultiplier(world));
      world.score += points;
      world.stats.buttons += 1;
      world.sounds.push('button');
      spawnBurst(world, button.x, button.y, INK.mustard, 14, 200);
      spawnFloatingWord(world, button.x, button.y - 18, `button +${points}`, INK.teal, 20);
    } else if (needle.progress > button.index + 8) {
      button.missed = true;
    }
  }
  for (const bobbin of world.bobbins) {
    if (bobbin.taken || Math.hypot(bobbin.x - needle.x, bobbin.y - needle.y) > 16) continue;
    bobbin.taken = true;
    world.thread.left = Math.min(world.thread.capacity, world.thread.left + world.thread.capacity * THREAD.bobbinRefill);
    world.score += REWARD.bobbin;
    world.sounds.push('bobbin');
    spawnFloatingWord(world, bobbin.x, bobbin.y - 16, '+thread', INK.navy, 18);
  }
}
