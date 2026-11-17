// Notions: what the haberdashery sells between orders. Pick one of three after each garment;
// fourteen exist, so no two runs build the same sewing kit.

import { NEEDLE } from '../config.js';

export function createKit() {
  return {
    precision: 1, turnScale: 1, hopCooldownScale: 1, threadScale: 1, ripperScale: 1, buttonScale: 1,
    paceBonus: 0, pinGuards: 0, pinGuardsLeft: 0, bonusScale: 1, safeScale: 1, fewerPins: 0,
    chainFloor: 1, scissorsShutScale: 1, ripperHeadStart: 0, owned: {},
  };
}

export const NOTIONS = [
  { id: 'thimble', name: 'Thimble', icon: 'thimble', limit: 2, text: 'One more needle, and every bent one straightened.',
    apply: (world) => { world.needles.max = Math.min(NEEDLE.maxNeedles, world.needles.max + 1); world.needles.left = world.needles.max; } },
  { id: 'silkThread', name: 'Silk Thread', icon: 'spool', limit: 2, text: 'Perfect and good stitches forgive 30% more wobble.',
    apply: (world) => { world.kit.precision *= 1.3; } },
  { id: 'beeswax', name: 'Beeswax', icon: 'wax', limit: 2, text: 'A quarter more thread on every spool.',
    apply: (world) => { world.kit.threadScale *= 1.25; } },
  { id: 'sharpNeedle', name: 'Sharp Needle', icon: 'needle', limit: 2, text: 'Steers 20% tighter through every curve.',
    apply: (world) => { world.kit.turnScale *= 1.2; } },
  { id: 'walkingFoot', name: 'Walking Foot', icon: 'foot', limit: 1, text: 'The hop is ready again in half the time.',
    apply: (world) => { world.kit.hopCooldownScale *= 0.5; } },
  { id: 'pincushion', name: 'Magnet Pincushion', icon: 'cushion', limit: 2, text: 'The first pin you hit on each garment is pulled aside.',
    apply: (world) => { world.kit.pinGuards += 1; } },
  { id: 'goldButtons', name: 'Gilt Buttons', icon: 'button', limit: 2, text: 'Every button sewn is worth double.',
    apply: (world) => { world.kit.buttonScale *= 2; } },
  { id: 'bluntRipper', name: 'Blunt Ripper', icon: 'ripper', limit: 2, text: 'The seam ripper unpicks 15% slower.',
    apply: (world) => { world.kit.ripperScale *= 0.85; } },
  { id: 'racingPedal', name: 'Racing Pedal', icon: 'pedal', limit: 2, text: 'Flat-out stitches score half as much again.',
    apply: (world) => { world.kit.paceBonus += 0.5; } },
  { id: 'tapeMeasure', name: 'Tape Measure', icon: 'tape', limit: 2, text: 'Every garment bonus pays 25% more.',
    apply: (world) => { world.kit.bonusScale *= 1.25; } },
  { id: 'needleCase', name: 'Needle Case', icon: 'case', limit: 1, text: 'After a bent needle you are safe twice as long.',
    apply: (world) => { world.kit.safeScale *= 2; } },
  { id: 'patternWeights', name: 'Pattern Weights', icon: 'weights', limit: 2, text: 'One pin fewer on every garment.',
    apply: (world) => { world.kit.fewerPins += 1; } },
  { id: 'chalkWheel', name: 'Chalk Wheel', icon: 'wheel', limit: 1, text: 'A broken chain never falls below x1.5.',
    apply: (world) => { world.kit.chainFloor = 1.5; } },
  { id: 'threadSnips', name: 'Thread Snips', icon: 'snips', limit: 1, text: 'Scissors stay shut for a third less time.',
    apply: (world) => { world.kit.scissorsShutScale *= 0.66; } },
];

export function rollNotionChoices(world) {
  const open = NOTIONS.filter((notion) => (world.kit.owned[notion.id] || 0) < notion.limit);
  const choices = [];
  while (choices.length < 3 && open.length > 0) choices.push(open.splice(world.rng.int(0, open.length - 1), 1)[0]);
  return choices;
}

export function buyNotion(world, notion) {
  notion.apply(world);
  world.kit.owned[notion.id] = (world.kit.owned[notion.id] || 0) + 1;
  world.sounds.push('notion');
}

export function listOwnedNotions(world) {
  return NOTIONS.filter((notion) => world.kit.owned[notion.id]).map((notion) => ({ name: notion.name, level: world.kit.owned[notion.id], limit: notion.limit }));
}
