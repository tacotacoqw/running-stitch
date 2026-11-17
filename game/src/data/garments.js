// The six garments of a run. Each is an outline (in units of -1..1 around the cloth's centre, drawn
// as one open seam), a fabric, a thread colour and what lies on the cloth: pins, buttons, bobbins,
// snapping scissors and a sliding iron, each placed by how far along the seam it sits (0..1).

export const GARMENTS = [
  {
    name: 'Pocket Square', fabric: 'gingham', thread: '#274472', scale: 250,
    outline: [[-0.8, -0.62], [0, -0.7], [0.8, -0.62], [0.9, 0], [0.8, 0.62], [0, 0.7], [-0.8, 0.62], [-0.9, 0], [-0.86, -0.42]],
    pins: [0.3, 0.62], buttons: [0.18, 0.48, 0.8], bobbins: [0.55], scissors: [], iron: null,
  },
  {
    name: 'Wool Sock', fabric: 'stripes', thread: '#d9483b', scale: 262,
    outline: [[-0.42, -0.95], [0.2, -0.95], [0.26, -0.3], [0.34, 0.12], [0.86, 0.34], [0.98, 0.62], [0.74, 0.9], [0.2, 0.94], [-0.3, 0.8], [-0.5, 0.4], [-0.44, -0.2], [-0.44, -0.72]],
    pins: [0.2, 0.44, 0.7], buttons: [0.1, 0.56, 0.86], bobbins: [0.34, 0.78], scissors: [0.6], iron: null,
  },
  {
    name: 'Snow Mitten', fabric: 'tartan', thread: '#fff3c9', scale: 258,
    outline: [[-0.5, 0.95], [0.42, 0.95], [0.46, 0.4], [0.62, 0.2], [0.98, 0.06], [1.0, -0.26], [0.72, -0.34], [0.46, -0.2], [0.44, -0.62], [0.2, -0.96], [-0.24, -0.96], [-0.52, -0.6], [-0.54, 0], [-0.52, 0.7]],
    pins: [0.14, 0.38, 0.58, 0.82], buttons: [0.08, 0.3, 0.7], bobbins: [0.48, 0.9], scissors: [0.24, 0.66], iron: null,
  },
  {
    name: 'Heart Pillow', fabric: 'dots', thread: '#7b4b94', scale: 262,
    outline: [[0, -0.36], [0.3, -0.84], [0.76, -0.86], [1.0, -0.42], [0.86, 0.1], [0.44, 0.56], [0, 0.94], [-0.44, 0.56], [-0.86, 0.1], [-1.0, -0.42], [-0.76, -0.86], [-0.3, -0.84], [-0.06, -0.48]],
    pins: [0.12, 0.3, 0.52, 0.7, 0.88], buttons: [0.2, 0.46, 0.62, 0.8], bobbins: [0.38, 0.76], scissors: [0.42, 0.94],
    iron: { from: [-0.75, 0.74], to: [0.75, 0.74], seconds: 5.2 },
  },
  {
    name: 'Star Patch', fabric: 'denim', thread: '#e9b949', scale: 268,
    outline: [[0, -1], [0.26, -0.34], [0.96, -0.3], [0.42, 0.14], [0.6, 0.84], [0, 0.44], [-0.6, 0.84], [-0.42, 0.14], [-0.96, -0.3], [-0.26, -0.34], [-0.06, -0.86]],
    pins: [0.08, 0.26, 0.44, 0.62, 0.8, 0.94], buttons: [0.18, 0.36, 0.54, 0.72, 0.9], bobbins: [0.3, 0.66], scissors: [0.5, 0.84],
    iron: { from: [-0.9, 0.3], to: [0.9, 0.3], seconds: 4.6 },
  },
  {
    name: 'Teddy Bear', fabric: 'velvet', thread: '#ffd7a8', scale: 262,
    outline: [[-0.3, -0.5], [-0.52, -0.94], [-0.94, -0.8], [-0.86, -0.36], [-0.6, -0.2], [-0.84, 0.3], [-0.6, 0.78], [0, 0.96], [0.6, 0.78], [0.84, 0.3], [0.6, -0.2], [0.86, -0.36], [0.94, -0.8], [0.52, -0.94], [0.3, -0.5], [0, -0.62], [-0.22, -0.54]],
    pins: [0.06, 0.2, 0.34, 0.5, 0.64, 0.78, 0.92], buttons: [0.12, 0.28, 0.42, 0.58, 0.72, 0.86], bobbins: [0.24, 0.54, 0.82], scissors: [0.38, 0.68, 0.96],
    iron: { from: [-0.8, 0.02], to: [0.8, 0.02], seconds: 4 },
  },
];
