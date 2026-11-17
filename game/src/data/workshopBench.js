// The workshop bench: permanent upgrades bought with thimbles between runs. Each has a cost
// per level and changes how every later run starts.

export const WORKSHOP_BENCH = [
  { id: 'spareNeedle', name: 'Spare Needle', text: 'Start every run with one more needle.', costs: [12, 30],
    fit: (world, level) => { world.needles.max += level; world.needles.left += level; } },
  { id: 'biggerSpool', name: 'Bigger Spool', text: 'Every spool holds 10% more thread.', costs: [8, 18, 36],
    fit: (world, level) => { world.kit.threadScale *= 1 + 0.1 * level; } },
  { id: 'steadyHand', name: 'Steady Hand', text: 'Stitches forgive 8% more wobble.', costs: [10, 22, 40],
    fit: (world, level) => { world.kit.precision *= 1 + 0.08 * level; } },
  { id: 'headStart', name: 'Head Start', text: 'The seam ripper wakes later on every seam.', costs: [8, 20],
    fit: (world, level) => { world.kit.ripperHeadStart += 90 * level; } },
  { id: 'knotBag', name: 'Knot Bag', text: 'Start every run with one more knot to tie.', costs: [10, 24],
    fit: (world, level) => { world.knots.held += level; } },
  { id: 'sharpChalk', name: 'Sharp Chalk', text: 'Every garment bonus pays 10% more.', costs: [14, 28, 50],
    fit: (world, level) => { world.kit.bonusScale *= 1 + 0.1 * level; } },
];
