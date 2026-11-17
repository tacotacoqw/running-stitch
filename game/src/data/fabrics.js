// Six fabrics. Each has its own weave on screen, its own thread colour, and a trait that
// changes how a garment cut from it sews.

const PLAIN = { precision: 1, threadCost: 1, speed: 1, turn: 1, stitchScore: 1, chainRate: 1, buttons: 1, neatBonus: 1 };

export const FABRICS = [
  { id: 'gingham', name: 'Gingham', thread: '#274472', trait: 'Plain weave', text: 'no surprises', rules: { ...PLAIN } },
  { id: 'stripes', name: 'Jersey', thread: '#d9483b', trait: 'Stretchy', text: 'forgiving line, thread +15%', rules: { ...PLAIN, precision: 1.25, threadCost: 1.15 } },
  { id: 'tartan', name: 'Wool Tartan', thread: '#fff3c9', trait: 'Thick', text: 'sews 10% slower, stitches +25%', rules: { ...PLAIN, speed: 0.9, stitchScore: 1.25 } },
  { id: 'dots', name: 'Dotted Cotton', thread: '#7b4b94', trait: 'Crisp', text: 'the chain builds twice as fast', rules: { ...PLAIN, chainRate: 2 } },
  { id: 'denim', name: 'Denim', thread: '#e9b949', trait: 'Tough', text: 'turns 15% wider, buttons x2', rules: { ...PLAIN, turn: 0.85, buttons: 2 } },
  { id: 'velvet', name: 'Velvet', thread: '#ffd7a8', trait: 'Slippery', text: 'runs 12% faster, neat bonus x1.5', rules: { ...PLAIN, speed: 1.12, neatBonus: 1.5 } },
];

export function fabricById(id) {
  return FABRICS.find((fabric) => fabric.id === id);
}
