# running-stitch

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/tacotacoqw/running-stitch/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/tacotacoqw/running-stitch/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

**Running Stitch** is an original sewing-machine racing game for desktop browsers. You drive a needle along the chalk line of a pattern: every stitch is scored by how close it lands to the line, going flat out doubles the points but runs wide in the bends, and a seam ripper follows your own stitches, unpicking them, so braking for long is never safe. Pick six orders from the order book, sew them, beat the Grandmaster Ripper on the royal cape, and the quilt is done.

![Running Stitch in play](screenshots/1-play.jpg)

## Run it

```sh
node serve.ts   # then open http://localhost:8080 in desktop Chrome
```

## How to play

| Action | Keys |
| --- | --- |
| Steer | Mouse (the needle turns towards the cursor) or A / D |
| Flat out | Hold click or W: twice the points, wider turns |
| Brake | Hold right-click or S: wait out a hazard, while the ripper gains on you |
| Hop | Space: lift the needle over a pin |
| Lock stitch | E: spend a knot to hold the seam ripper back |
| Pause / restart / sound | P, R, M |

- **A run is six orders.** At each stop the order book offers two commissions drawn from a catalogue of twelve patterns: the harder garment pays more. The sixth is always the royal commission, sewn with the Grandmaster Ripper throwing pins ahead of you.
- **Three rival tailors** sew every order beside you on the same pattern. Live standings show the gaps, and your place on the podium pays a bonus.
- **The lock stitch** (E): every button you sew on earns a knot. Tie one off and the seam ripper has to gnaw through it before it can go on.
- **A career between runs**: every run pays thimbles for its score, podiums and wins. The workshop (W on the title screen) spends them on six permanent upgrades; ten badges mark feats; the daily run (D) gives everyone the same order book for the day.
- **Six fabrics** each change how a garment sews: jersey forgives a wobble but eats thread, denim turns wide, velvet runs fast, dotted cotton builds the chain twice as quickly.
- **Win** by sewing all six orders to their END marks. **Lose** when the last needle bends or the spool runs out of thread.
- **Stitches** are rated perfect, good, sloppy or off the line. Perfect and good ones build a chain worth up to four times the points.
- **On the cloth**: pins to hop, scissors that snap shut on a rhythm, a hot iron sliding across, buttons to sew dead centre, bobbins of spare thread just off the line.
- **The seam ripper** wakes once you have sewn a little and follows your seam. If it reaches the needle, it costs you one.
- **The haberdashery** offers one of three notions after each garment: fourteen in all, from a thimble to a racing pedal, so no two runs build the same kit.
- **Each garment ends with a ribbon** (S to D) for its neatness, and the results screen shows the quilt of everything you sewed, wobbles and all.

## How it is built

No build step and no dependencies: plain ES modules drawn on one canvas, every sound synthesised with Web Audio. Nothing loads from the network.

| Path | What it holds |
| --- | --- |
| `game/index.html`, `game/style.css` | the page |
| `game/src/main.js` | canvas set-up, the fixed-step loop, painting a frame |
| `game/src/gameFlow.js` | title, run, pause, haberdashery, game over, victory and restart |
| `game/src/world.js` | the state of a run and its simulation step |
| `game/src/core/` | the seam path geometry and the seeded random source |
| `game/src/data/` | the garment catalogue, the fabrics and the notions |
| `game/src/entities/` | needle, stitching, seam ripper and its Grandmaster, hazards |
| `game/src/systems/` | the order book, laying a garment on the cloth, scoring, standings, workshop, badges, daily run |
| `game/src/render/` | fabrics and table, scene, sprites, HUD, order book and menu screens |
| `game/src/audio/` | synthesised sound effects and the workshop tune |
| `game/src/autopilot.js` | the bot behind the title screen's demo |
| `game/src/screenshotScenes.js` | the `?shot=` scenes the screenshots are taken from |
| `main.ts` | hands game/ and screenshots/ in and writes the dossier |
| `tools/` | headless screenshot capture, a browser play-test, a balance simulator |

```sh
node tools/playtest.mjs            # drives the real game in headless Chrome and checks the whole loop
node tools/captureScreenshots.mjs  # re-takes screenshots/ from the scenes in shots.json
node tools/simulate.mjs 6          # lets the autopilot sew 6 runs and prints how each went
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The screenshots are unedited renders of the game in Chrome: each `?shot=` scene lets the autopilot sew a seeded run up to a moment and holds that frame.

---

<sub>Entered on [make.fun](https://make.fun/?ref=0p3ycm46&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
