// A seeded random source, so a run and the screenshots of it can be replayed.

export function createRng(seed) {
  let state = (seed >>> 0) || 1;
  const next = () => {
    state = (state + 0x9e3779b9) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 16), 0x85ebca6b);
    mixed = Math.imul(mixed ^ (mixed >>> 13), 0xc2b2ae35);
    return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (low, high) => low + (high - low) * next(),
    int: (low, high) => Math.floor(low + (high - low + 1) * next()),
    pick: (list) => list[Math.floor(next() * list.length)],
    chance: (odds) => next() < odds,
  };
}
