// The rival tailors of the Sewing Bee. Three of them sew every order beside you, on the same
// pattern: `pace` is their speed along the seam, `nerve` how rarely they fumble a stitch.

export const RIVAL_TAILORS = [
  { name: 'Madame Vex', color: '#c2185b', pace: 104, nerve: 0.9, boast: 'never drops a stitch' },
  { name: 'Old Hemlock', color: '#00796b', pace: 76, nerve: 0.95, boast: 'slow and flawless' },
  { name: 'Pip Quickfingers', color: '#f57c00', pace: 112, nerve: 0.55, boast: 'fast, and clumsy' },
  { name: 'The Duchess', color: '#5e35b1', pace: 92, nerve: 0.8, boast: 'sews in silk gloves' },
  { name: 'Bobbin Bill', color: '#3949ab', pace: 84, nerve: 0.7, boast: 'hums while he sews' },
];

// What a place on the podium pays, before the commission's own pay is applied.
export const PODIUM_PAY = [1500, 800, 300, 0];
export const PLACE_NAMES = ['1st', '2nd', '3rd', '4th'];
