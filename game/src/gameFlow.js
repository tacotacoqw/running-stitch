// The flow between screens: the title with its demo, a run, pause, the haberdashery between
// garments, and the game-over and victory screens with their restart.

import { createAutopilot, steerAutopilot } from './autopilot.js';
import { STEP_SECONDS } from './config.js';
import { notionCardAt } from './render/screens.js';
import { loadBestScore, saveBestScore } from './storage.js';
import { summarizeRun } from './systems/scoring.js';
import { commissionCardAt } from './render/orderBookScreen.js';
import { chooseNotion, createWorld, stepWorld, takeCommission } from './world.js';

export function createGame(seed) {
  const game = {
    screen: 'title', // 'title' | 'run'
    paused: false,
    frozen: false,
    autopilotEnabled: false,
    seed,
    world: null,
    demoWorld: null,
    demoPilot: createAutopilot(),
    bestScore: loadBestScore(),
    isNewBest: false,
    summary: null,
  };
  restartDemo(game);
  return game;
}

function restartDemo(game) {
  game.seed += 1;
  game.demoWorld = createWorld(game.seed);
  takeCommission(game.demoWorld, 0);
}

export function startNewRun(game) {
  game.seed += 1;
  game.world = createWorld(game.seed);
  game.screen = 'run';
  game.paused = false;
  game.summary = null;
  game.isNewBest = false;
}

export function returnToTitle(game) {
  game.screen = 'title';
  game.paused = false;
  restartDemo(game);
}

// Menu keys and clicks, read once a frame before the simulation steps.
export function handleMenuInput(game, input) {
  const confirm = input.pointer.clicked || input.anyPressed('Enter', 'NumpadEnter');
  if (game.screen === 'title') {
    if (confirm) startNewRun(game);
    return;
  }
  const world = game.world;
  if (world.phase === 'gameOver' || world.phase === 'victory') {
    if (input.wasPressed('Escape')) returnToTitle(game);
    else if (confirm || input.wasPressed('KeyR')) startNewRun(game);
    return;
  }
  if (world.phase === 'orderBook') {
    let pick = -1;
    if (input.anyPressed('Digit1', 'Numpad1')) pick = 0;
    if (input.anyPressed('Digit2', 'Numpad2')) pick = 1;
    if (input.pointer.clicked) pick = commissionCardAt(world, input.pointer.x, input.pointer.y);
    if (pick >= 0) takeCommission(world, pick);
    return;
  }
  if (world.phase === 'haberdashery') {
    let pick = -1;
    if (input.anyPressed('Digit1', 'Numpad1')) pick = 0;
    if (input.anyPressed('Digit2', 'Numpad2')) pick = 1;
    if (input.anyPressed('Digit3', 'Numpad3')) pick = 2;
    if (input.pointer.clicked) pick = notionCardAt(input.pointer.x, input.pointer.y);
    if (pick >= 0) chooseNotion(world, pick);
    return;
  }
  if (input.anyPressed('KeyP', 'Escape')) game.paused = !game.paused;
  if (game.paused && input.wasPressed('KeyR')) startNewRun(game);
}

// Advances whichever world is on screen by one fixed step.
export function stepGame(game, sewingControls) {
  if (game.frozen) return;
  if (game.screen === 'title') {
    stepDemo(game);
    return;
  }
  if (game.paused) return;
  stepWorld(game.world, sewingControls, STEP_SECONDS);
  if (!game.summary && (game.world.phase === 'gameOver' || game.world.phase === 'victory')) recordRunResult(game);
}

export function stepDemo(game) {
  const demo = game.demoWorld;
  if (demo.phase === 'orderBook') takeCommission(demo, 0);
  if (demo.phase === 'haberdashery') chooseNotion(demo, 0);
  if (demo.phase !== 'sewing' && demo.phase !== 'orderBook') {
    restartDemo(game);
    return;
  }
  stepWorld(demo, steerAutopilot(game.demoPilot, demo), STEP_SECONDS);
  demo.sounds.length = 0;
}

export function recordRunResult(game) {
  game.summary = summarizeRun(game.world);
  game.isNewBest = game.summary.score > game.bestScore;
  if (game.isNewBest) {
    game.bestScore = game.summary.score;
    saveBestScore(game.bestScore);
  }
}
