// The flow between screens: the title with its demo, the workshop, a run (order book, sewing,
// pause, haberdashery) and the game-over and victory screens with their restart. It also keeps
// the save: best score, thimbles, workshop upgrades and badges.

import { chooseNotion, createWorld, stepWorld, takeCommission } from './world.js';
import { buyBenchUpgrade, fitWorkshopUpgrades, thimblesEarned } from './systems/workshop.js';
import { awardBadges } from './systems/badges.js';
import { dailySeed } from './systems/dailyRun.js';
import { summarizeRun } from './systems/scoring.js';
import { createAutopilot, steerAutopilot } from './autopilot.js';
import { STEP_SECONDS } from './config.js';
import { loadSave, storeSave } from './storage.js';
import { commissionCardAt } from './render/orderBookScreen.js';
import { notionCardAt } from './render/screens.js';
import { benchCardAt } from './render/workshopScreen.js';

export function createGame(seed) {
  const game = {
    screen: 'title', // 'title' | 'workshop' | 'run'
    paused: false,
    frozen: false,
    autopilotEnabled: false,
    seed,
    daily: false,
    world: null,
    demoWorld: null,
    demoPilot: createAutopilot(),
    save: loadSave(),
    isNewBest: false,
    summary: null,
    thimblesWon: 0,
    newBadges: [],
  };
  restartDemo(game);
  return game;
}

function restartDemo(game) {
  game.seed += 1;
  game.demoWorld = createWorld(game.seed);
  takeCommission(game.demoWorld, 0);
}

// Starts a run with the workshop's upgrades fitted. A daily run is seeded from the date.
export function startNewRun(game, daily = false) {
  game.seed += 1;
  game.daily = daily;
  game.world = createWorld(daily ? dailySeed() : game.seed);
  fitWorkshopUpgrades(game.world, game.save);
  game.screen = 'run';
  game.paused = false;
  game.summary = null;
  game.isNewBest = false;
  game.thimblesWon = 0;
  game.newBadges = [];
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
    if (input.wasPressed('KeyW')) game.screen = 'workshop';
    else if (input.wasPressed('KeyD')) startNewRun(game, true);
    else if (confirm) startNewRun(game);
    return;
  }
  if (game.screen === 'workshop') {
    handleWorkshopInput(game, input);
    return;
  }
  const world = game.world;
  if (world.phase === 'gameOver' || world.phase === 'victory') {
    if (input.wasPressed('Escape')) returnToTitle(game);
    else if (confirm || input.wasPressed('KeyR')) startNewRun(game, game.daily);
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
  if (game.paused && input.wasPressed('KeyR')) startNewRun(game, game.daily);
}

function handleWorkshopInput(game, input) {
  if (input.anyPressed('Escape', 'Enter', 'KeyW')) {
    game.screen = 'title';
    return;
  }
  let pick = -1;
  for (let digit = 1; digit <= 6; digit++) {
    if (input.anyPressed(`Digit${digit}`, `Numpad${digit}`)) pick = digit - 1;
  }
  if (input.pointer.clicked) pick = benchCardAt(input.pointer.x, input.pointer.y);
  if (pick >= 0 && buyBenchUpgrade(game.save, pick)) storeSave(game.save);
}

// Advances whichever world is on screen by one fixed step.
export function stepGame(game, sewingControls) {
  if (game.frozen) return;
  if (game.screen !== 'run') {
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

// The end of a run: its summary, the thimbles it pays, any new badges, and the best score.
export function recordRunResult(game) {
  const save = game.save;
  game.summary = summarizeRun(game.world);
  game.thimblesWon = thimblesEarned(game.summary, game.world.phase === 'victory');
  game.newBadges = awardBadges(save, game.summary, game.world);
  game.isNewBest = game.summary.score > save.bestScore;
  save.thimbles += game.thimblesWon;
  save.runs += 1;
  if (game.isNewBest) save.bestScore = game.summary.score;
  storeSave(save);
}
