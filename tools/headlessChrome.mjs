// Shared by the screenshot and play-test tools: a static server for game/, a headless Chrome,
// and a minimal DevTools-protocol client over Node's built-in WebSocket. Standard library only.

import { spawn } from 'node:child_process';
import { createReadStream, existsSync, mkdtempSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const VIEWPORT = { width: 1280, height: 800 };

const gameDir = join(repoDir, 'game');
const CONTENT_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

export const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

export function serveGame() {
  const server = createServer((request, response) => {
    const path = normalize(decodeURIComponent(new URL(request.url, 'http://x').pathname));
    const file = join(gameDir, path === '/' ? 'index.html' : path);
    if (!file.startsWith(gameDir) || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, { 'content-type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(response);
  });
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)));
}

export async function launchChrome() {
  const binary = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!binary) throw new Error('Chrome not found: set CHROME_PATH');
  const profile = mkdtempSync(join(tmpdir(), 'running-stitch-chrome-'));
  const chrome = spawn(binary, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars',
    '--mute-audio', '--no-first-run', `--window-size=${VIEWPORT.width},${VIEWPORT.height}`, 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  const debugUrl = await new Promise((found, failed) => {
    let log = '';
    chrome.stderr.on('data', (chunk) => {
      log += chunk;
      const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) found(match[1]);
    });
    chrome.on('exit', () => failed(new Error(`Chrome exited early:\n${log}`)));
  });
  return { chrome, port: new URL(debugUrl).port };
}

// Opens the first page target and returns { send, evaluate, problems, close }.
export async function connectToPage(port) {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find((each) => each.type === 'page');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((opened) => socket.addEventListener('open', opened, { once: true }));
  const waiting = new Map();
  const problems = [];
  let nextId = 1;

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && waiting.has(message.id)) {
      waiting.get(message.id)(message);
      waiting.delete(message.id);
    } else if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      problems.push(`${details.exception?.description ?? details.text} (${details.url ?? ''}:${details.lineNumber})`);
    } else if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
      problems.push(`${message.params.entry.text} ${message.params.entry.url ?? ''}`);
    }
  });

  const send = (method, params = {}) =>
    new Promise((answered) => {
      const id = nextId++;
      waiting.set(id, answered);
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const answer = await send('Runtime.evaluate', { expression, returnByValue: true });
    return answer.result?.result?.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { ...VIEWPORT, deviceScaleFactor: 1, mobile: false });
  return { send, evaluate, problems, close: () => socket.close() };
}
