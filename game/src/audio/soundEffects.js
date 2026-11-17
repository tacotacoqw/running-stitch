// Every sound is synthesised with Web Audio, no files: the tick of each stitch, snips, snaps,
// buttons and fanfares. The world queues sound names; this plays them once audio is unlocked.

const RECIPES = {
  stitch: { wave: 'square', from: 900, to: 520, seconds: 0.03, volume: 0.05 },
  stitchOff: { wave: 'square', from: 240, to: 160, seconds: 0.04, volume: 0.05 },
  hop: { wave: 'sine', from: 380, to: 880, seconds: 0.16, volume: 0.14 },
  button: { wave: 'triangle', from: 660, to: 1320, seconds: 0.22, volume: 0.2 },
  bobbin: { wave: 'sine', from: 520, to: 1040, seconds: 0.2, volume: 0.16 },
  snip: { wave: 'square', from: 1800, to: 700, seconds: 0.06, volume: 0.07, noise: 0.08 },
  snap: { wave: 'sawtooth', from: 260, to: 60, seconds: 0.4, volume: 0.3, noise: 0.3 },
  ripperWakes: { wave: 'sawtooth', from: 110, to: 220, seconds: 0.5, volume: 0.16 },
  garmentStart: { wave: 'triangle', from: 330, to: 495, seconds: 0.4, volume: 0.18 },
  garmentDone: { wave: 'triangle', from: 523, to: 1046, seconds: 0.7, volume: 0.24 },
  knot: { wave: 'triangle', from: 300, to: 760, seconds: 0.18, volume: 0.2 },
  rivalDone: { wave: 'square', from: 520, to: 390, seconds: 0.3, volume: 0.07 },
  notion: { wave: 'triangle', from: 440, to: 880, seconds: 0.3, volume: 0.2 },
};

export function createSoundEffects() {
  let context = null;
  let master = null;
  let noise = null;
  let muted = false;
  const lastPlayed = {};

  function unlock() {
    if (context) {
      if (context.state === 'suspended') context.resume();
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = muted ? 0 : 0.8;
    master.connect(context.destination);
    noise = context.createBuffer(1, context.sampleRate * 0.5, context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  }

  function play(name) {
    const recipe = RECIPES[name];
    if (!context || !recipe || muted) return;
    const now = context.currentTime;
    if (now - (lastPlayed[name] ?? -1) < 0.025) return;
    lastPlayed[name] = now;
    const gain = context.createGain();
    gain.gain.setValueAtTime(recipe.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + recipe.seconds);
    gain.connect(master);
    const tone = context.createOscillator();
    tone.type = recipe.wave;
    tone.frequency.setValueAtTime(recipe.from, now);
    tone.frequency.exponentialRampToValueAtTime(recipe.to, now + recipe.seconds);
    tone.connect(gain);
    tone.start(now);
    tone.stop(now + recipe.seconds + 0.02);
    if (recipe.noise) {
      const hiss = context.createBufferSource();
      const hissGain = context.createGain();
      hiss.buffer = noise;
      hissGain.gain.setValueAtTime(recipe.noise, now);
      hissGain.gain.exponentialRampToValueAtTime(0.001, now + recipe.seconds);
      hiss.connect(hissGain);
      hissGain.connect(master);
      hiss.start(now);
      hiss.stop(now + recipe.seconds);
    }
  }

  return {
    unlock,
    playQueued(names) {
      for (const name of names) play(name);
      names.length = 0;
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.8;
    },
    isMuted: () => muted,
    audioContext: () => context,
    output: () => master,
  };
}
