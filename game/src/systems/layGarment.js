// Lays a commission on the cloth: builds its seam path, threads the spool and scatters its pins,
// buttons, bobbins, scissors and iron along the seam (a different arrangement every run), then
// sets the needle at the seam's start.

import { CLOTH, RIPPER, THREAD } from '../config.js';
import { buildSeamPath, indexAtDistance, seamPointAt } from '../core/seamPath.js';
import { placeNeedleAtStart } from '../entities/needle.js';
import { seatRivals } from '../entities/rivals.js';

const CENTER = { x: (CLOTH.left + CLOTH.right) / 2, y: (CLOTH.top + CLOTH.bottom) / 2 };
const TOPSTITCH_SCALE = 0.56;

export function seamOutlineOnCloth(garment) {
  const toCloth = ([x, y]) => [CENTER.x + x * garment.scale * 1.18, CENTER.y + y * garment.scale];
  // The seam runs the outline once, then turns inward for a second, smaller lap of topstitching.
  const topstitch = garment.outline.map(([x, y]) => [x * TOPSTITCH_SCALE, y * TOPSTITCH_SCALE]);
  return [...garment.outline, ...topstitch].map(toCloth);
}

export function layGarment(world, commission) {
  const garment = commission.garment;
  const path = buildSeamPath(seamOutlineOnCloth(garment));
  const spots = scatterAlongSeam(world, commission.hazards);
  const along = (share) => seamPointAt(path, indexAtDistance(path, share * path.total));
  const indexOf = (share) => indexAtDistance(path, share * path.total);

  world.commission = commission;
  world.garment = { name: garment.name, fabric: commission.fabric.id, thread: commission.fabric.thread };
  world.rules = commission.fabric.rules;
  world.path = path;
  world.pins = spots.pins.map((share) => ({ ...along(share), index: indexOf(share), gone: false, hopped: false, fresh: 0 }));
  world.buttons = spots.buttons.map((share) => ({ ...along(share), index: indexOf(share), sewn: false, missed: false }));
  world.bobbins = spots.bobbins.map((share, order) => {
    const spot = along(share);
    const side = order % 2 === 0 ? 1 : -1;
    return { x: spot.x - Math.sin(spot.angle) * 30 * side, y: spot.y + Math.cos(spot.angle) * 30 * side, taken: false };
  });
  world.scissors = spots.scissors.map((share, order) => ({ ...along(share), index: indexOf(share), clock: order * 0.9 }));
  world.iron = commission.hazards.iron ? layIronRail(world, garment) : null;

  world.stitches = [];
  world.tally = { perfect: 0, good: 0, sloppy: 0, off: 0 };
  world.thread = { capacity: path.total * THREAD.sparePerPattern * world.kit.threadScale, left: 0 };
  world.thread.left = world.thread.capacity;
  const order = world.orderBook.stop + 1;
  world.ripper = {
    at: 0, awake: false, dazed: 0, x: path.points[0].x, y: path.points[0].y, angle: 0,
    grandmaster: commission.royal, pinClock: 3,
    speed: (RIPPER.baseSpeed + order * RIPPER.speedPerGarment) * world.kit.ripperScale * (commission.royal ? 1.12 : 1),
  };
  world.rivals = seatRivals(world, order);
  world.knots.tied = [];
  world.kit.pinGuardsLeft = world.kit.pinGuards;
  world.garmentClock = 0;
  world.bannerClock = 2.6;
  placeNeedleAtStart(world);
  world.sounds.push('garmentStart');
}

// Spreads every hazard and pickup along the seam in a shuffled order with a little jitter, so
// no two sit on top of each other and no garment plays the same twice.
function scatterAlongSeam(world, hazards) {
  const kinds = [];
  const pins = Math.max(0, hazards.pins - world.kit.fewerPins);
  for (let i = 0; i < pins; i++) kinds.push('pins');
  for (let i = 0; i < hazards.buttons; i++) kinds.push('buttons');
  for (let i = 0; i < hazards.bobbins; i++) kinds.push('bobbins');
  for (let i = 0; i < hazards.scissors; i++) kinds.push('scissors');
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = world.rng.int(0, i);
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  const spots = { pins: [], buttons: [], bobbins: [], scissors: [] };
  kinds.forEach((kind, order) => {
    const slot = 0.86 / kinds.length;
    spots[kind].push(0.08 + (order + 0.5 + world.rng.range(-0.28, 0.28)) * slot);
  });
  return spots;
}

function layIronRail(world, garment) {
  const height = world.rng.range(-0.1, 0.6);
  const toCloth = ([x, y]) => [CENTER.x + x * garment.scale * 1.18, CENTER.y + y * garment.scale];
  return { from: toCloth([-0.85, height]), to: toCloth([0.85, height]), seconds: world.rng.range(5, 6.4), clock: world.rng.range(0, 3), x: 0, y: 0, radius: 27 };
}
