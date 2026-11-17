// Takes the game's screenshots: serves game/, opens each scene of shots.json in headless Chrome,
// waits for the game to say the scene is staged, and saves what the browser rendered, untouched.
//   node tools/captureScreenshots.mjs [--out <dir>] [--only <name>]

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { connectToPage, launchChrome, repoDir, serveGame, sleep, VIEWPORT } from './headlessChrome.mjs';

const MAX_SCREENSHOT_BYTES = 262144;
const args = process.argv.slice(2);
const flag = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const outDir = resolve(flag('--out', join(repoDir, 'screenshots')));
const only = flag('--only', null);

async function captureScene(page, baseUrl, shot) {
  await page.send('Page.navigate', { url: `${baseUrl}/index.html${shot.query}` });
  let staged = false;
  for (let attempt = 0; attempt < 300 && !staged; attempt++) {
    await sleep(100);
    staged = (await page.evaluate('document.documentElement.dataset.shot === "ready"')) === true;
  }
  if (!staged) throw new Error(`${shot.name}: the scene was never staged. ${page.problems.join(' | ')}`);
  await sleep(400);
  shot.seedUsed = await page.evaluate('document.documentElement.dataset.shotSeed || ""');
  const format = shot.name.endsWith('.png') ? { format: 'png' } : { format: 'jpeg', quality: 80 };
  const capture = await page.send('Page.captureScreenshot', format);
  return Buffer.from(capture.result.data, 'base64');
}

async function main() {
  const shots = JSON.parse(readFileSync(join(repoDir, 'shots.json'), 'utf8')).filter((shot) => !only || shot.name === only);
  mkdirSync(outDir, { recursive: true });
  const server = await serveGame();
  const { chrome, port } = await launchChrome();
  let failed = false;
  try {
    const page = await connectToPage(port);
    for (const shot of shots) {
      const bytes = await captureScene(page, `http://127.0.0.1:${server.address().port}`, shot);
      writeFileSync(join(outDir, shot.name), bytes);
      const seedNote = shot.seedUsed ? `  (run seed ${shot.seedUsed})` : '';
      console.log(`${shot.name}  ${VIEWPORT.width}x${VIEWPORT.height}  ${bytes.length} bytes  ${shot.query}${seedNote}`);
      if (bytes.length > MAX_SCREENSHOT_BYTES) {
        console.error(`  too large: the limit is ${MAX_SCREENSHOT_BYTES} bytes`);
        failed = true;
      }
    }
    if (page.problems.length > 0) {
      console.error(`page errors:\n  ${page.problems.join('\n  ')}`);
      failed = true;
    }
    page.close();
  } finally {
    chrome.kill();
    server.close();
  }
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
