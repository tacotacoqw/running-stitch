// The daily run: everyone who plays on the same day gets the same order book, fabrics and
// hazards, because the run is seeded from the date.

export function dailySeed(date = new Date()) {
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}

export function dailyLabel(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
