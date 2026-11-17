// Lint, sparks and floating words: small feedback for every stitch, hop, snip and button.

export function spawnBurst(world, x, y, color, count, speed) {
  for (let i = 0; i < count && world.particles.length < 320; i++) {
    const angle = world.rng.range(0, Math.PI * 2);
    const pace = speed * world.rng.range(0.25, 1);
    world.particles.push({ x, y, vx: Math.cos(angle) * pace, vy: Math.sin(angle) * pace, age: 0, life: world.rng.range(0.25, 0.6), size: world.rng.range(2, 4.5), color });
  }
}

export function spawnFloatingWord(world, x, y, text, color, size = 18) {
  world.floaters.push({ x, y, text, color, size, age: 0, life: 0.95 });
  if (world.floaters.length > 30) world.floaters.shift();
}

export function updateParticles(world, dt) {
  for (const particle of world.particles) {
    particle.age += dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 1 - 3.5 * dt;
    particle.vy *= 1 - 3.5 * dt;
  }
  world.particles = world.particles.filter((particle) => particle.age < particle.life);
  for (const floater of world.floaters) {
    floater.age += dt;
    floater.y -= 38 * dt;
  }
  world.floaters = world.floaters.filter((floater) => floater.age < floater.life);
}
