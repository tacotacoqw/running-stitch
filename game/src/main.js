// Running Stitch entry point: sets up the canvas, runs the fixed-step loop and paints each frame.

import { createWorkshopTune } from './audio/workshopTune.js';
import { createSoundEffects } from './audio/soundEffects.js';
import { createAutopilot, steerAutopilot } from './autopilot.js';
import { STEP_SECONDS, VIEW } from './config.js';
import { createGame, handleMenuInput, stepGame } from './gameFlow.js';
import { createInput } from './input.js';
import { paintTable } from './render/fabric.js';
import { paintHud } from './render/hud.js';
import { paintOrderBookScreen } from './render/orderBookScreen.js';
import { paintScene } from './render/scene.js';
import { paintGameOverScreen, paintHaberdasheryScreen, paintPauseScreen, paintTitleScreen, paintVictoryScreen } from './render/screens.js';
import { paintWorkshopScreen } from './render/workshopScreen.js';
import { readShotRequest, stageScreenshotScene } from './screenshotScenes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const soundEffects = createSoundEffects();
const workshopTune = createWorkshopTune(soundEffects);
const game = createGame(Math.floor(Date.now() % 100000));

// For the browser console and tools/playtest.mjs: inspect the game, or set
// `runningStitch.autopilotEnabled = true` to watch the autopilot sew your run.
const playtestPilot = createAutopilot();
window.runningStitch = game;

let pixelScale = 1;
let lastFrameAt = 0;
let unspentSeconds = 0;
let clock = 0;

function fitCanvasToWindow() {
  const fit = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  const density = Math.min(window.devicePixelRatio || 1, 2);
  canvas.style.width = `${Math.round(VIEW.width * fit)}px`;
  canvas.style.height = `${Math.round(VIEW.height * fit)}px`;
  canvas.width = Math.round(VIEW.width * fit * density);
  canvas.height = Math.round(VIEW.height * fit * density);
  pixelScale = canvas.width / VIEW.width;
}

function isSewing() {
  return game.screen === 'run' && game.world.phase === 'sewing' && !game.paused;
}

function runFrame(now) {
  const elapsed = Math.min(0.1, (now - lastFrameAt) / 1000 || 0);
  lastFrameAt = now;

  if (input.pointer.clicked || input.anyPressed('Enter', 'Space', 'KeyR', 'KeyW')) soundEffects.unlock();
  if (input.wasPressed('KeyM')) soundEffects.toggleMute();
  const wasSewing = isSewing();
  handleMenuInput(game, input);

  if (!game.frozen) {
    clock += elapsed;
    unspentSeconds += elapsed;
    let controls = input.readSewingControls();
    // The click that closed a menu must not also floor the pedal or hop.
    if (!wasSewing) controls = { ...controls, hop: false, knot: false };
    while (unspentSeconds >= STEP_SECONDS) {
      const sewnByPilot = game.autopilotEnabled && game.screen === 'run' && game.world.phase === 'sewing';
      stepGame(game, sewnByPilot ? steerAutopilot(playtestPilot, game.world) : controls);
      // A hop or a knot is one press: it must not repeat on every step of the frame.
      controls = { ...controls, hop: false, knot: false };
      unspentSeconds -= STEP_SECONDS;
    }
  }
  if (game.world) soundEffects.playQueued(game.world.sounds);
  workshopTune.update(isSewing() && game.world.needle.pedal === 'fast' ? 1 : 0);

  paintFrame();
  input.endFrame();
  requestAnimationFrame(runFrame);
}

function paintFrame() {
  ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
  if (game.screen === 'title') {
    paintScene(ctx, game.demoWorld, clock);
    paintTitleScreen(ctx, game.save, clock);
    return;
  }
  if (game.screen === 'workshop') {
    paintWorkshopScreen(ctx, game.save, input.pointer);
    return;
  }
  const world = game.world;
  if (world.path) {
    paintScene(ctx, world, clock);
    paintHud(ctx, world, { bestScore: game.save.bestScore, muted: soundEffects.isMuted() }, clock);
  } else {
    // Before the first commission is taken there is nothing on the table yet.
    paintTable(ctx);
  }
  if (world.phase === 'orderBook') paintOrderBookScreen(ctx, world, input.pointer);
  else if (world.phase === 'haberdashery') paintHaberdasheryScreen(ctx, world, input.pointer, clock);
  else if (world.phase === 'gameOver') paintGameOverScreen(ctx, world, game, clock);
  else if (world.phase === 'victory') paintVictoryScreen(ctx, world, game, clock);
  else if (game.paused) paintPauseScreen(ctx);
}

window.addEventListener('resize', fitCanvasToWindow);
fitCanvasToWindow();

const shotRequest = readShotRequest(window.location.search);
if (shotRequest) {
  stageScreenshotScene(game, shotRequest);
  clock = 2.75;
  document.documentElement.dataset.shot = 'ready';
}
requestAnimationFrame(runFrame);
