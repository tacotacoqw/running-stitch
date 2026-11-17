// Play-test in a real browser: drives Running Stitch in headless Chrome with real mouse and key
// events and checks the whole loop: title -> order book -> sew -> pause -> haberdashery ->
// order book -> game over -> restart.
//   node tools/playtest.mjs

import { connectToPage, launchChrome, serveGame, sleep } from './headlessChrome.mjs';

const checks = [];
function check(name, passed, detail = '') {
  checks.push(passed);
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

async function main() {
  const server = await serveGame();
  const { chrome, port } = await launchChrome();
  try {
    const page = await connectToPage(port);
    const state = () => page.evaluate(`(() => { const g = window.runningStitch; const w = g.world; const n = (w && w.needle) || {};
      return { screen: g.screen, paused: g.paused, phase: w && w.phase, order: w && w.orderBook.stop + 1, score: w && w.score,
      needles: w && w.needles.left, x: n.x, y: n.y, heading: n.heading, speed: n.speed, pedal: n.pedal, hop: n.hop,
      stitches: w && w.stitches ? w.stitches.length : 0, offers: w && w.orderBook.stops[w.orderBook.stop].length,
      garment: w && w.garment && w.garment.name, choices: w && w.notionChoices.length,
      owned: w && Object.values(w.kit.owned).reduce((sum, level) => sum + level, 0), summary: g.summary }; })()`);
    const mouse = (type, x, y, button = 'none') =>
      page.send('Input.dispatchMouseEvent', { type, x, y, button, clickCount: type === 'mouseMoved' ? 0 : 1 });
    const click = async (x, y) => {
      await mouse('mousePressed', x, y, 'left');
      await mouse('mouseReleased', x, y, 'left');
    };
    const keyDown = (code, key) => page.send('Input.dispatchKeyEvent', { type: 'keyDown', code, key });
    const keyUp = (code, key) => page.send('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
    const tap = async (code, key) => {
      await keyDown(code, key);
      await sleep(40);
      await keyUp(code, key);
    };
    const waitWhile = async (phase) => {
      for (let i = 0; i < 400 && (await state()).phase === phase; i++) await sleep(200);
      return state();
    };

    await page.send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/index.html` });
    await sleep(1200);
    check('opens on the title screen', (await state()).screen === 'title');

    await tap('Enter', 'Enter');
    await sleep(300);
    let now = await state();
    check('Enter opens the order book with two commissions', now.screen === 'run' && now.phase === 'orderBook' && now.offers === 2);

    await tap('Digit2', '2');
    await sleep(300);
    now = await state();
    check('pressing 2 takes the second commission and starts sewing', now.phase === 'sewing' && now.order === 1 && Boolean(now.garment), now.garment);

    await sleep(1500);
    now = await state();
    check('the needle sews by itself at cruising speed', now.stitches >= 5 && now.pedal === 'cruise', `${now.stitches} stitches`);

    await mouse('mouseMoved', now.x, now.y + 300);
    await sleep(900);
    const turned = await state();
    check('the needle steers towards the mouse', Math.abs(turned.heading - Math.PI / 2) < 0.5, `heading ${turned.heading.toFixed(2)}`);

    await keyDown('KeyW', 'w');
    await sleep(700);
    now = await state();
    await keyUp('KeyW', 'w');
    check('holding W goes flat out', now.pedal === 'fast' && now.speed > 110, `${Math.round(now.speed)} px/s`);

    await keyDown('KeyS', 's');
    await sleep(700);
    now = await state();
    await keyUp('KeyS', 's');
    check('holding S brakes', now.pedal === 'brake' && now.speed < 40, `${Math.round(now.speed)} px/s`);

    await mouse('mousePressed', 640, 400, 'left');
    await sleep(500);
    now = await state();
    await mouse('mouseReleased', 640, 400, 'left');
    check('holding the mouse button goes flat out', now.pedal === 'fast');

    const knotsBefore = await page.evaluate('window.runningStitch.world.knots.held');
    await tap('KeyE', 'e');
    await sleep(120);
    const knots = await page.evaluate('({ held: window.runningStitch.world.knots.held, tied: window.runningStitch.world.knots.tied.length, rivals: window.runningStitch.world.rivals.length })');
    check('E ties a lock stitch and spends a knot', knots.held === knotsBefore - 1 && knots.tied === 1, `${knotsBefore} -> ${knots.held} held, ${knots.tied} tied`);
    check('three rival tailors sew the same seam', knots.rivals === 3);

    await tap('Space', ' ');
    await sleep(80);
    check('Space hops the needle', (await state()).hop > 0);

    const before = await state();
    await keyDown('KeyD', 'd');
    await sleep(400);
    now = await state();
    await keyUp('KeyD', 'd');
    check('D steers by keyboard', now.heading > before.heading + 0.3, `${before.heading.toFixed(2)} -> ${now.heading.toFixed(2)}`);

    await tap('KeyP', 'p');
    await sleep(100);
    const pausedAt = await state();
    await sleep(300);
    now = await state();
    check('P pauses the run', now.paused && now.stitches === pausedAt.stitches);
    await tap('KeyR', 'r');
    await sleep(300);
    now = await state();
    check('R restarts from the pause screen, back at the order book', !now.paused && now.phase === 'orderBook' && now.order === 1);

    // Take the first commission by clicking its card, then let the game's own autopilot sew
    // it, lending it spare needles: this checks the flow, not the bot.
    await click(420, 520);
    await sleep(300);
    check('clicking a commission card takes it', (await state()).phase === 'sewing');
    const lend = 'window.runningStitch.world.needles.max = 5; window.runningStitch.world.needles.left = 5;';
    await page.evaluate(`${lend} window.runningStitch.autopilotEnabled = true`);
    now = await waitWhile('sewing');
    check('finishing a garment opens the haberdashery with three notions', now.phase === 'haberdashery' && now.choices === 3, `score ${now.score}`);
    await tap('Digit2', '2');
    await sleep(200);
    now = await state();
    check('pressing 2 buys a notion and opens the order book at order 2', now.phase === 'orderBook' && now.order === 2 && now.owned === 1);

    await tap('Digit1', '1');
    await sleep(200);
    await page.evaluate(lend);
    now = await waitWhile('sewing');
    if (now.phase === 'haberdashery') {
      await click(640, 560);
      await sleep(200);
      now = await state();
      check('clicking a notion card buys it', now.phase === 'orderBook' && now.order === 3 && now.owned === 2);
      await tap('Digit1', '1');
      await sleep(200);
    }

    // Drive in circles off the line until the needles or the thread are gone.
    await page.evaluate('window.runningStitch.autopilotEnabled = false; window.runningStitch.world.needles.left = 1; window.runningStitch.world.thread.left = 400;');
    await keyDown('KeyD', 'd');
    await keyDown('KeyW', 'w');
    now = await waitWhile('sewing');
    await keyUp('KeyD', 'd');
    await keyUp('KeyW', 'w');
    check('running out ends the run with a summary', now.phase === 'gameOver' && now.summary && now.summary.score === now.score, `score ${now.score}`);

    await tap('KeyR', 'r');
    await sleep(300);
    now = await state();
    check('R restarts at order 1 with a clean score', now.phase === 'orderBook' && now.order === 1 && now.score === 0 && now.needles === 3);

    check('no page errors', page.problems.length === 0, page.problems.join(' | '));
    page.close();
  } finally {
    chrome.kill();
    server.close();
  }
  process.exit(checks.every(Boolean) ? 0 : 1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
