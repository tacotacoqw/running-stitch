// Three stitches to switch between as you sew (keys 1, 2, 3). Each trades safety for points:
// `give` scales how far from the chalk line a stitch may land, `worth` its points, `thread`
// what it costs, `feed` how fast the cloth runs.

export const STITCH_STYLES = [
  { id: 'running', key: '1', name: 'RUNNING', text: 'the everyday stitch', give: 1, worth: 1, thread: 1, feed: 1 },
  { id: 'zigzag', key: '2', name: 'ZIGZAG', text: 'forgiving, but eats thread', give: 1.7, worth: 0.75, thread: 1.6, feed: 0.92 },
  { id: 'satin', key: '3', name: 'SATIN', text: 'double points, no room to wobble', give: 0.55, worth: 2, thread: 1.25, feed: 1 },
];

export function stitchStyleOf(world) {
  return STITCH_STYLES[world.stitchStyle];
}
