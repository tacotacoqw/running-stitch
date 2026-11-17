// Badges: ten feats to earn across runs. `earned` reads a finished run's summary and world.

export const BADGES = [
  { id: 'firstQuilt', name: 'First Quilt', text: 'finish all six orders', earned: (summary, world) => world.phase === 'victory' },
  { id: 'blueRibbon', name: 'Blue Ribbon', text: 'end a run with an S ribbon', earned: (summary) => summary.ribbon === 'S' && summary.garmentsDone >= 3 },
  { id: 'beeQueen', name: 'Queen Bee', text: 'win three Sewing Bees in a run', earned: (summary) => summary.wins >= 3 },
  { id: 'podiumRegular', name: 'Podium Regular', text: 'five podiums in a run', earned: (summary) => summary.podiums >= 5 },
  { id: 'chainGang', name: 'Chain Gang', text: 'a chain of 200 neat stitches', earned: (summary) => summary.bestChain >= 200 },
  { id: 'buttonBox', name: 'Button Box', text: 'sew on 15 buttons in a run', earned: (summary) => summary.buttons >= 15 },
  { id: 'knotMaster', name: 'Knot Master', text: 'tie five lock stitches in a run', earned: (summary, world) => world.stats.knots >= 5 },
  { id: 'hopscotch', name: 'Hopscotch', text: 'ten clean hops in a run', earned: (summary, world) => world.stats.hops >= 10 },
  { id: 'highRoller', name: 'High Roller', text: 'score 100,000 in a run', earned: (summary) => summary.score >= 100000 },
  { id: 'unbent', name: 'Unbent', text: 'win a run without bending a needle', earned: (summary, world) => world.phase === 'victory' && world.stats.bent === 0 },
];
