// Awards badges at the end of a run and counts the ones held.

import { BADGES } from '../data/badges.js';

// Marks every badge this run earned for the first time in the save; returns their names.
export function awardBadges(save, summary, world) {
  const fresh = [];
  for (const badge of BADGES) {
    if (save.badges[badge.id] || !badge.earned(summary, world)) continue;
    save.badges[badge.id] = true;
    fresh.push(badge.name);
  }
  return fresh;
}

export function badgesHeld(save) {
  return BADGES.filter((badge) => save.badges[badge.id]).length;
}
