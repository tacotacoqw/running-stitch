// Screenshot scenes: `index.html?shot=<scene>&seed=<n>` lets the autopilot sew a seeded run up
// to a chosen moment and holds that frame, so every screenshot is a real, repeatable render.
//   title         the title screen over the demo
//   play          mid-seam on a later garment, hazards ahead and the ripper behind
//   haberdashery  a finished garment and the choice of notions
//   gameover      the game-over screen with the quilt so far
//   victory       the finished quilt

import { createAutopilot, steerAutopilot } from './autopilot.js';
import { STEP_SECONDS } from './config.js';
import { ripperGap } from './entities/seamRipper.js';
import { recordRunResult, returnToTitle, startNewRun, stepDemo } from './gameFlow.js';
import { chooseNotion, stepWorld } from './world.js';

const STEP_LIMIT = 120 * 60 * 10;
const CARELESS = { useAim: false, aimX: 0, aimY: 0, turn: 0.4, fast: true, brake: false, hop: false };

export function readShotRequest(search) {
  const params = new URLSearchParams(search);
  const scene = params.get('shot');
  if (!scene) return null;
  return { scene, seed: Number(params.get('seed')) || 1, garment: Number(params.get('garment')) || 0, at: Number(params.get('at')) || 0 };
}

const SCENE_GARMENT = { play: 4, haberdashery: 3, gameover: 5 };

const SCENE_REACHED = {
  play: (world, garment, at) =>
    world.phase === 'sewing' && world.garmentNumber >= garment && world.needle.progress / world.path.points.length >= (at || 0.58) && ripperGap(world) < 420,
  haberdashery: (world, garment) => world.phase === 'haberdashery' && world.garmentNumber >= garment,
  gameover: (world, garment) => world.phase === 'gameOver' && world.garmentNumber >= garment,
  victory: (world) => world.phase === 'victory',
};

export function stageScreenshotScene(game, request) {
  game.seed = request.seed - 1;
  if (request.scene === 'title') {
    returnToTitle(game);
    for (let step = 0; step < 120 * 16; step++) stepDemo(game);
  } else {
    // The autopilot does not survive every run: try the next seed until one reaches the scene.
    for (let attempt = 0; attempt < 40; attempt++) {
      if (sewRunToScene(game, request)) break;
    }
    if (game.world.phase === 'gameOver' || game.world.phase === 'victory') recordRunResult(game);
    document.documentElement.dataset.shotSeed = String(game.seed);
  }
  game.frozen = true;
}

function sewRunToScene(game, request) {
  startNewRun(game);
  const world = game.world;
  const pilot = createAutopilot(request.scene === 'play' ? 1.6 : 1);
  const reached = SCENE_REACHED[request.scene] ?? SCENE_REACHED.play;
  const garment = request.garment || SCENE_GARMENT[request.scene] || 1;
  for (let step = 0; step < STEP_LIMIT; step++) {
    if (reached(world, garment, request.at)) return true;
    if (world.phase === 'gameOver' || world.phase === 'victory') return false;
    if (world.phase === 'haberdashery') chooseNotion(world, world.rng.int(0, world.notionChoices.length - 1));
    // For the game-over scene the pilot turns careless once it reaches the wanted garment.
    const careless = request.scene === 'gameover' && world.garmentNumber >= garment && world.needle.progress > 120;
    stepWorld(world, careless ? CARELESS : steerAutopilot(pilot, world), STEP_SECONDS);
    world.sounds.length = 0;
  }
  return false;
}
