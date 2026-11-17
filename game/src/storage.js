// Keeps the best score between visits, where the browser allows local storage.

const BEST_SCORE_KEY = 'runningStitch.bestScore';

export function loadBestScore() {
  try {
    return Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(Math.round(score)));
  } catch {
    // A private window may refuse storage: the game plays on without it.
  }
}
