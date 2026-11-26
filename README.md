# Second Life Passport

**Don't trust it. Tap it.** A tap-or-scan sticker for refurbished laptops that opens a verified passport. It shows measured battery health with a school-year forecast, repair history, proof the last owner's data was wiped, a note from the student who fixed it, and help for life.

Student prototype for the KnoPro × Lenovo *Second Life, Smarter Tech* Challenge. Not affiliated with or endorsed by Lenovo.

**Live demo:** https://mattjunior039.github.io/second-life-passport/

| Path | What |
|---|---|
| `docs/` | Static site (GitHub Pages): passport viewer `p/`, Repair Station `create/`, Health Check scripts `health-check/` |
| `docs/data/records.json` | Official passport records → `node tools/build-registry.js` writes `registry.json` (SHA-256 fingerprints) and `links.json` |
| `sticker/` | 2″ round sticker (SVG/PNG) + Avery 22807 print sheet (PDF) + on-screen version at `docs/sticker/` → `node tools/make-sticker.js [ID]` |
| `video/generated/` | Animated tap shot, phone demo, battery zoom, Repair Station clips (no filming needed) → `node tools/make-tap.js`, `node tools/make-demo-clips.js` |
| `tools/studio.py` | **Recording studio**: one question per scene, record → keep → build the final video → `python3 tools/studio.py` |
| `slides/` | Pitch slides from `slides/config.json` → `node tools/make-slides.js` → `slides/png/` |
| `video/` | `STORYBOARD.md` (recording guide), `scenes.json`, recordings → `python3 tools/assemble.py` → `video/build/final.mp4` |

Tools need `node` (+ `npm install` in `tools/`), `ffmpeg`, and Google Chrome (headless rendering).
