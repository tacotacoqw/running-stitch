// The save file, kept in the browser's local storage where it is allowed: best score, the
// thimbles earned across runs, the workshop upgrades bought with them, and the badges won.

const SAVE_KEY = 'runningStitch.save.v2';

export function loadSave() {
  const fresh = { bestScore: 0, thimbles: 0, bench: {}, badges: {}, runs: 0 };
  try {
    const stored = JSON.parse(window.localStorage.getItem(SAVE_KEY) || 'null');
    return stored && typeof stored === 'object' ? { ...fresh, ...stored } : fresh;
  } catch {
    return fresh;
  }
}

export function storeSave(save) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // A private window may refuse storage: the game plays on without it.
  }
}
