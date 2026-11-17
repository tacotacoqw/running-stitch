// Running Stitch's entry for make.fun's best-game-01 bounty (Node 22, standard library only).
//
// The game is the static site under game/ (serve it with `node serve.ts`). This program hands it
// in: it copies game/ and screenshots/ to the output directory and writes dossier.json there
// with make.fun's own library, so the judge reads exactly the files of this repository.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The caps the bounty's scorer publishes in its rules.
const SCORER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

const repository = dirname(fileURLToPath(import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const isDotFile = (path: string) => basename(path).startsWith('.');

// Copies one directory of the repository to the output in sorted order, leaving dot files
// behind, so two runs write the same bytes. Returns how many top-level entries it copied.
function handInDirectory(name: string): number {
  const from = join(repository, name);
  if (!existsSync(from) || !statSync(from).isDirectory()) {
    throw new Error(`Running Stitch hand-in: the repository has no ${name}/ directory`);
  }
  const to = join(output, name);
  mkdirSync(to, { recursive: true });
  const entries = readdirSync(from).filter((entry) => !isDotFile(entry)).sort();
  for (const entry of entries) {
    cpSync(join(from, entry), join(to, entry), { recursive: true, filter: (source) => !isDotFile(source) });
  }
  return entries.length;
}

mkdirSync(output, { recursive: true });
const gameEntries = handInDirectory('game');
const screenshots = handInDirectory('screenshots');
if (screenshots < 3 || screenshots > SCORER_CAPS.screenshots.max) {
  throw new Error(`Running Stitch hand-in: screenshots/ holds ${screenshots} images, the bounty takes 3 or 4`);
}

const dossier = buildDossier(output, SCORER_CAPS);
writeFileSync(join(output, 'dossier.json'), dossier);
console.log(`Running Stitch handed in: ${gameEntries} entries of game/, ${screenshots} screenshots, a ${dossier.length} byte dossier`);
