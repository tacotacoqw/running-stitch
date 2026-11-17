// Keyboard and mouse: turns browser events into the needle's controls and menu presses.

import { VIEW } from './config.js';

const STEER_KEYS = { KeyA: -1, ArrowLeft: -1, KeyD: 1, ArrowRight: 1 };
const FAST_KEYS = ['KeyW', 'ArrowUp'];
const BRAKE_KEYS = ['KeyS', 'ArrowDown'];

export function createInput(canvas) {
  const held = new Set();
  const pressed = new Set();
  const pointer = { x: VIEW.width / 2, y: VIEW.height / 2, clicked: false, leftHeld: false, rightHeld: false, steering: true };

  function locate(event) {
    const box = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - box.left) / box.width) * VIEW.width;
    pointer.y = ((event.clientY - box.top) / box.height) * VIEW.height;
  }

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code.startsWith('Arrow')) event.preventDefault();
    if (!event.repeat) pressed.add(event.code);
    held.add(event.code);
    if (event.code in STEER_KEYS) pointer.steering = false;
  });
  window.addEventListener('keyup', (event) => held.delete(event.code));
  window.addEventListener('blur', () => {
    held.clear();
    pointer.leftHeld = false;
    pointer.rightHeld = false;
  });
  window.addEventListener('mousemove', (event) => {
    locate(event);
    pointer.steering = true;
  });
  window.addEventListener('mousedown', (event) => {
    locate(event);
    if (event.button === 0) {
      pointer.clicked = true;
      pointer.leftHeld = true;
    }
    if (event.button === 2) pointer.rightHeld = true;
  });
  window.addEventListener('mouseup', (event) => {
    if (event.button === 0) pointer.leftHeld = false;
    if (event.button === 2) pointer.rightHeld = false;
  });
  window.addEventListener('contextmenu', (event) => event.preventDefault());

  return {
    pointer,
    wasPressed: (code) => pressed.has(code),
    anyPressed: (...codes) => codes.some((code) => pressed.has(code)),

    // The controls for one step, in the shape the autopilot also returns.
    readSewingControls() {
      let turn = 0;
      for (const code of held) turn += STEER_KEYS[code] || 0;
      return {
        useAim: pointer.steering,
        aimX: pointer.x,
        aimY: pointer.y,
        turn,
        fast: pointer.leftHeld || FAST_KEYS.some((code) => held.has(code)),
        brake: pointer.rightHeld || BRAKE_KEYS.some((code) => held.has(code)),
        hop: pressed.has('Space'),
      };
    },

    endFrame() {
      pressed.clear();
      pointer.clicked = false;
    },
  };
}
