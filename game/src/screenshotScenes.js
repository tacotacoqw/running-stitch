// Screenshot scenes: `index.html?shot=<scene>&seed=<n>` lets the autopilot play a seeded run up
// to a chosen moment and holds that frame, so every screenshot is a real, repeatable render.
//   title         the title screen over the demo
//   play          mid-seam on a later order, hazards ahead and the ripper behind
//   boss          the royal commission, with the Grandmaster Ripper on the seam
//   orderbook     the order book between orders: the route and the commissions on offer
//   haberdashery  a finished garment and the choice of notions
//   gameover      the game-over screen with the quilt so far
//   victory       the finished quilt
// `&order=<n>` asks for a scene at or after that order of the run.

import { createAutopilot, steerAutopilot } from './autopilot.js';
import { STEP_SECONDS } from './config.js';
import { ripperGap } from './entities/seamRipper.js';
import { recordRunResult, returnToTitle, startNewRun, stepDemo } from './gameFlow.js';
import { commissionsOnOffer, orderNumber } from './systems/orderBook.js';
import { chooseNotion, stepWorld, takeCommission } from './world.js';

const STEP_LIMIT = 120 * 60 * 10;
const CARELESS = { useAim: false, aimX: 0, aimY: 0, turn: 0.4, fast: true, brake: false, hop: false };

export function readShotRequest(search) {
  const params = new URLSearchParams(search);
  const scene = params.get('shot');
  if (!scene) return null;
  return { scene, seed: Number(params.get('seed')) || 1, order: Number(params.get('order')) || 0, at: Number(params.get('at')) || 0 };
}

const SCENE_ORDER = { play: 4, boss: 6, orderbook: 4, haberdashery: 3, gameover: 5 };
const seamShare = (world) => world.needle.progress / world.path.points.length;

const SCENE_REACHED = {
  play: (world, order, at) => world.phase === 'sewing' && orderNumber(world) >= order && seamShare(world) >= (at || 0.55) && ripperGap(world) < 420,
  boss: (world, order, at) => world.phase === 'sewing' && world.ripper.grandmaster && seamShare(world) >= (at || 0.45) && world.pins.some((pin) => pin.fresh > 0.3),
  orderbook: (world, order) => world.phase === 'orderBook' && orderNumber(world) >= order,
  haberdashery: (world, order) => world.phase === 'haberdashery' && orderNumber(world) >= order,
  gameover: (world, order) => world.phase === 'gameOver' && orderNumber(world) >= order,
  victory: (world) => world.phase === 'victory',
};

export function stageScreenshotScene(game, request) {
  game.seed = request.seed - 1;
  if (request.scene === 'title') {
    returnToTitle(game);
    for (let step = 0; step < 120 * 16; step++) stepDemo(game);
  } else {
    // The autopilot does not survive every run: try the next seed until one reaches the scene.
    for (let attempt = 0; attempt < 80; attempt++) {
      if (playRunToScene(game, request)) break;
    }
    if (game.world.phase === 'gameOver' || game.world.phase === 'victory') recordRunResult(game);
    document.documentElement.dataset.shotSeed = String(game.seed);
  }
  game.frozen = true;
}

function playRunToScene(game, request) {
  startNewRun(game);
  const world = game.world;
  const pilot = createAutopilot(request.scene === 'play' || request.scene === 'boss' ? 1.5 : 1);
  const reached = SCENE_REACHED[request.scene] ?? SCENE_REACHED.play;
  const order = request.order || SCENE_ORDER[request.scene] || 1;
  for (let step = 0; step < STEP_LIMIT; step++) {
    if (reached(world, order, request.at)) return true;
    if (world.phase === 'gameOver' || world.phase === 'victory') return false;
    if (world.phase === 'orderBook') takeCommission(world, world.rng.int(0, commissionsOnOffer(world).length - 1));
    if (world.phase === 'haberdashery') chooseNotion(world, world.rng.int(0, world.notionChoices.length - 1));
    // For the game-over scene the pilot turns careless once it reaches the wanted order.
    const careless = request.scene === 'gameover' && orderNumber(world) >= order && world.needle.progress > 120;
    stepWorld(world, careless ? CARELESS : steerAutopilot(pilot, world), STEP_SECONDS);
    world.sounds.length = 0;
  }
  return false;
}
