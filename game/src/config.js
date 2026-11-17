// Tuning for Running Stitch: every number the sewing, the hazards and the scoring balance on.

export const VIEW = { width: 1280, height: 800 };

// The cloth on the table: the needle, the pattern and every hazard live inside it.
export const CLOTH = { left: 250, top: 106, right: 1030, bottom: 726 };

export const STEP_SECONDS = 1 / 120;

export const INK = {
  text: '#3a2a20',
  textSoft: '#7b6352',
  paper: '#fbf3e0',
  paperEdge: '#8a5d3b',
  red: '#d9483b',
  teal: '#2a9d8f',
  mustard: '#e9b949',
  navy: '#274472',
  plum: '#7b4b94',
  chalk: '#ffffff',
  steel: '#cfd6de',
  steelDark: '#6d7681',
  wood: '#b98a5e',
  woodDark: '#8f6541',
};

// The pedal: cruise by default, floor it for double points, brake to wait out a hazard.
export const PEDAL = {
  brake: { speed: 10, turn: 4.6, pace: 0.5, label: 'BRAKING' },
  cruise: { speed: 86, turn: 3.3, pace: 1, label: 'CRUISING' },
  fast: { speed: 164, turn: 2.2, pace: 2, label: 'FLAT OUT' },
  response: 6,
};

export const NEEDLE = { startNeedles: 3, maxNeedles: 5, hurtSafeSeconds: 1.3, hopSeconds: 0.42, hopCooldown: 0.9 };

export const STITCH = {
  length: 13,
  perfectWithin: 6,
  goodWithin: 13,
  sloppyWithin: 26,
  points: { perfect: 12, good: 6, sloppy: 2, off: 0 },
  neatness: { perfect: 1, good: 0.72, sloppy: 0.3, off: 0 },
};

export const CHAIN = { stitchesPerStep: 10, stepBonus: 0.25, maxMultiplier: 4 };

export const THREAD = { sparePerPattern: 1.5, bobbinRefill: 0.18, snipLoss: 0.12 };

export const RIPPER = { headStart: 150, baseSpeed: 50, speedPerGarment: 5, thrownBack: 240, dazedSeconds: 1.6 };

export const REWARD = { button: 150, cleanHop: 50, bobbin: 50, needleLeft: 100, neatnessPerPercent: 12 };

// Ribbons for one garment's neatness, and letter grades for a whole run's score.
export const RIBBONS = [
  { letter: 'S', neatness: 0.9 },
  { letter: 'A', neatness: 0.8 },
  { letter: 'B', neatness: 0.68 },
  { letter: 'C', neatness: 0.52 },
  { letter: 'D', neatness: 0 },
];
