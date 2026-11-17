// The workshop: the career between runs. Every run pays thimbles for its score, podiums and
// wins; thimbles buy permanent upgrades at the bench, which are fitted to every new run.

import { WORKSHOP_BENCH } from '../data/workshopBench.js';

export function thimblesEarned(summary, wonTheRun) {
  return Math.floor(summary.score / 4000) + summary.podiums + summary.wins * 2 + (wonTheRun ? 10 : 0);
}

export function benchLevel(save, upgrade) {
  return save.bench[upgrade.id] || 0;
}

// What the next level costs, or null when the upgrade is at its top level.
export function nextCost(save, upgrade) {
  const level = benchLevel(save, upgrade);
  return level < upgrade.costs.length ? upgrade.costs[level] : null;
}

export function buyBenchUpgrade(save, index) {
  const upgrade = WORKSHOP_BENCH[index];
  const cost = upgrade ? nextCost(save, upgrade) : null;
  if (cost === null || save.thimbles < cost) return false;
  save.thimbles -= cost;
  save.bench[upgrade.id] = benchLevel(save, upgrade) + 1;
  return true;
}

// Fits every upgrade bought so far to a freshly made world.
export function fitWorkshopUpgrades(world, save) {
  for (const upgrade of WORKSHOP_BENCH) {
    const level = benchLevel(save, upgrade);
    if (level > 0) upgrade.fit(world, level);
  }
}

export function benchLevelsBought(save) {
  return WORKSHOP_BENCH.reduce((sum, upgrade) => sum + benchLevel(save, upgrade), 0);
}
