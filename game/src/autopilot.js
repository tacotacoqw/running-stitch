// The autopilot: a bot that sews by the player's own controls. It runs the demo behind the
// title screen and plays the seeded runs the screenshot scenes are taken from.

import { bendAhead, seamPointAt } from './core/seamPath.js';
import { scissorsAreShut } from './entities/hazards.js';
import { ripperGap } from './entities/seamRipper.js';

export function createAutopilot(skill = 1) {
  return { skill };
}

export function steerAutopilot(pilot, world) {
  const needle = world.needle;
  const path = world.path;
  const aim = seamPointAt(path, needle.progress + 8);
  const controls = { useAim: true, aimX: aim.x, aimY: aim.y, turn: 0, fast: false, brake: false, hop: false };

  // Floor it on the straights, or when the ripper is close; ease off for bends.
  const bend = bendAhead(path, needle.progress, 22);
  controls.fast = bend < 0.3 * pilot.skill || ripperGap(world) < 90;

  for (const pin of world.pins) {
    const ahead = pin.index - needle.progress;
    if (!pin.gone && !pin.hopped && ahead >= 0 && ahead <= 5) controls.hop = true;
    if (!pin.gone && !pin.hopped && ahead > 5 && ahead < 14 && needle.hopCooldown > 0.1) controls.brake = true;
  }
  for (const scissors of world.scissors) {
    const ahead = scissors.index - needle.progress;
    if (ahead > 2 && ahead < 16 && scissorsAreShut({ clock: scissors.clock + 0.25 })) controls.brake = true;
  }
  const iron = world.iron;
  if (iron) {
    const soon = seamPointAt(path, needle.progress + 14);
    const near = Math.hypot(iron.x - soon.x, iron.y - soon.y) < iron.radius + 26;
    const onTop = Math.hypot(iron.x - needle.x, iron.y - needle.y) < iron.radius + 22;
    if (near && !onTop) controls.brake = true;
  }
  if (controls.brake) controls.fast = false;
  return controls;
}
