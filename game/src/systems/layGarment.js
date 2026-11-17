// Lays a garment on the cloth: builds its seam path, threads the spool and places the pins,
// buttons, bobbins, scissors and iron along the seam, then sets the needle at the seam's start.

import { CLOTH, RIPPER, THREAD } from '../config.js';
import { buildSeamPath, indexAtDistance, seamPointAt } from '../core/seamPath.js';
import { GARMENTS } from '../data/garments.js';
import { placeNeedleAtStart } from '../entities/needle.js';

const CENTER = { x: (CLOTH.left + CLOTH.right) / 2, y: (CLOTH.top + CLOTH.bottom) / 2 };

const TOPSTITCH_SCALE = 0.56;

export function layGarment(world, number) {
  const garment = GARMENTS[number - 1];
  const toCloth = ([x, y]) => [CENTER.x + x * garment.scale * 1.18, CENTER.y + y * garment.scale];
  // The seam runs the outline once, then turns inward for a second, smaller lap of topstitching.
  const topstitch = garment.outline.map(([x, y]) => [x * TOPSTITCH_SCALE, y * TOPSTITCH_SCALE]);
  const path = buildSeamPath([...garment.outline, ...topstitch].map(toCloth));
  const along = (share) => seamPointAt(path, indexAtDistance(path, share * path.total));
  const indexOf = (share) => indexAtDistance(path, share * path.total);

  world.garmentNumber = number;
  world.garment = garment;
  world.path = path;
  world.pins = garment.pins.map((share) => ({ ...along(share), index: indexOf(share), gone: false, hopped: false }));
  world.buttons = garment.buttons.map((share) => ({ ...along(share), index: indexOf(share), sewn: false, missed: false }));
  world.bobbins = garment.bobbins.map((share, order) => {
    const spot = along(share);
    const side = order % 2 === 0 ? 1 : -1;
    return { x: spot.x - Math.sin(spot.angle) * 30 * side, y: spot.y + Math.cos(spot.angle) * 30 * side, taken: false };
  });
  world.scissors = garment.scissors.map((share, order) => ({ ...along(share), index: indexOf(share), clock: order * 0.9 }));
  world.iron = garment.iron
    ? { from: toCloth(garment.iron.from), to: toCloth(garment.iron.to), seconds: garment.iron.seconds, clock: 0, x: 0, y: 0, radius: 30 }
    : null;

  world.stitches = [];
  world.tally = { perfect: 0, good: 0, sloppy: 0, off: 0 };
  world.thread = { capacity: path.total * THREAD.sparePerPattern * world.kit.threadScale, left: 0 };
  world.thread.left = world.thread.capacity;
  world.ripper = { at: 0, awake: false, dazed: 0, x: path.points[0].x, y: path.points[0].y, angle: 0, speed: (RIPPER.baseSpeed + number * RIPPER.speedPerGarment) * world.kit.ripperScale };
  world.kit.pinGuardsLeft = world.kit.pinGuards;
  world.garmentClock = 0;
  world.bannerClock = 2.6;
  placeNeedleAtStart(world);
  world.sounds.push('garmentStart');
}

export function garmentCount() {
  return GARMENTS.length;
}
