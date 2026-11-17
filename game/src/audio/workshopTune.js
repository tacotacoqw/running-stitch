// A cheerful generated workshop tune: a bouncing bass and a plucked melody that speeds up
// when the pedal is flat out.

const MELODY = [392, 440, 494, 587, 494, 440, 392, 330, 392, 494, 587, 659, 587, 494, 440, 392];
const BASS = [98, 98, 123.5, 147];

export function createWorkshopTune(soundEffects) {
  let nextNoteAt = 0;
  let step = 0;

  function pluck(context, output, pitch, when, volume, wave, seconds) {
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + seconds);
    gain.connect(output);
    const voice = context.createOscillator();
    voice.type = wave;
    voice.frequency.value = pitch;
    voice.connect(gain);
    voice.start(when);
    voice.stop(when + seconds + 0.05);
  }

  // Call every frame. `hurry` runs 0 (title, cruising) to 1 (flat out).
  function update(hurry) {
    const context = soundEffects.audioContext();
    const output = soundEffects.output();
    if (!context || !output || context.state !== 'running') return;
    const beat = 0.26 - hurry * 0.07;
    if (nextNoteAt < context.currentTime) nextNoteAt = context.currentTime + 0.05;
    while (nextNoteAt < context.currentTime + 0.2) {
      if (step % 2 === 0) pluck(context, output, BASS[Math.floor(step / 4) % BASS.length], nextNoteAt, 0.07, 'triangle', 0.3);
      if (step % 4 !== 3) pluck(context, output, MELODY[step % MELODY.length], nextNoteAt, 0.035, 'triangle', 0.4);
      step += 1;
      nextNoteAt += beat;
    }
  }

  return { update };
}
