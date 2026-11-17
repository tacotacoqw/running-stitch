// The pattern line of a garment as a path: a smooth curve through its outline points, resampled
// into evenly spaced points so "how far along the seam" is simply an index.

export const PATH_SPACING = 4;

// outline: [[x, y], ...] in cloth pixels. Returns { points, total }.
export function buildSeamPath(outline) {
  const dense = [];
  for (let i = 0; i < outline.length - 1; i++) {
    const before = outline[Math.max(0, i - 1)];
    const from = outline[i];
    const to = outline[i + 1];
    const after = outline[Math.min(outline.length - 1, i + 2)];
    for (let step = 0; step < 24; step++) {
      const t = step / 24;
      dense.push({ x: catmullRom(before[0], from[0], to[0], after[0], t), y: catmullRom(before[1], from[1], to[1], after[1], t) });
    }
  }
  const last = outline[outline.length - 1];
  dense.push({ x: last[0], y: last[1] });

  const points = [dense[0]];
  let carried = 0;
  for (let i = 1; i < dense.length; i++) {
    let from = dense[i - 1];
    const to = dense[i];
    let gap = Math.hypot(to.x - from.x, to.y - from.y);
    while (carried + gap >= PATH_SPACING) {
      const t = (PATH_SPACING - carried) / gap;
      from = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
      points.push(from);
      gap = Math.hypot(to.x - from.x, to.y - from.y);
      carried = 0;
    }
    carried += gap;
  }
  return { points, total: (points.length - 1) * PATH_SPACING };
}

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (3 * p1 - p0 - 3 * p2 + p3) * t3);
}

export function indexAtDistance(path, distance) {
  return Math.max(0, Math.min(path.points.length - 1, Math.round(distance / PATH_SPACING)));
}

// The point of the path at an index, with the direction the seam runs there.
export function seamPointAt(path, index) {
  const at = Math.max(0, Math.min(path.points.length - 1, index));
  const from = path.points[Math.max(0, at - 1)];
  const to = path.points[Math.min(path.points.length - 1, at + 1)];
  return { x: path.points[at].x, y: path.points[at].y, angle: Math.atan2(to.y - from.y, to.x - from.x) };
}

// The nearest path point to (x, y) among indices [fromIndex, toIndex].
export function nearestOnSeam(path, x, y, fromIndex, toIndex) {
  let best = Math.max(0, fromIndex);
  let bestGap = Infinity;
  const end = Math.min(path.points.length - 1, toIndex);
  for (let i = Math.max(0, fromIndex); i <= end; i++) {
    const gap = Math.hypot(path.points[i].x - x, path.points[i].y - y);
    if (gap < bestGap) {
      bestGap = gap;
      best = i;
    }
  }
  return { index: best, gap: bestGap };
}

// How sharply the seam bends over the next `span` points from an index, in radians.
export function bendAhead(path, index, span) {
  const here = seamPointAt(path, index).angle;
  const there = seamPointAt(path, index + span).angle;
  let turn = Math.abs(there - here) % (Math.PI * 2);
  if (turn > Math.PI) turn = Math.PI * 2 - turn;
  return turn;
}
