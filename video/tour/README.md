# BCTLABS tour video pipeline

Deterministic Playwright-to-ffmpeg renderer for the two narrated product tours.
Scenes are HTML/CSS/JS; timing files are generated from the narration manifest so
animation stays in sync with the voice-over.

## Layout

- `v2/` scene bundles, shared engine, styles, timing files, renderer.
- `v2/assets/` application screenshots and logo used inside the scenes.
- `v2/fonts/` self-hosted variable fonts (no network needed at render time).
- `vo/` narration script, TTS and processing, music synthesis, mixdown.
- `capture/` Playwright scripts that refresh the checkout and payment screenshots.

## Prerequisites

- Node 20+ and the repo root `node_modules` (`playwright`, `ffmpeg` binary on PATH).
- Python 3 with `numpy` for the music score, `edge-tts` for narration.

## Build

```bash
# 1. Narration: synthesise, process, write vo/manifest.json
python3 vo/gen.py

# 2. Timing: manifest -> v2/timing-{marketing,admin}.js
python3 vo/make_timing.py

# 3. Music: reads the timing files so the score matches each cut
python3 vo/music.py

# 4. Mix: voice + music with sidechain ducking, -16 LUFS master
python3 vo/mix2.py

# 5. Render: 3 workers, 30 fps, 1080p, H.264 + AAC
node v2/render2.cjs full marketing 3 vo/marketing-mix.wav out-marketing.mp4
node v2/render2.cjs full admin 3 vo/admin-mix.wav out-admin.mp4
```

`node v2/render2.cjs preview marketing 2,8,16` writes PNG stills to `v2/prev/`
for quick iteration.

## Refreshing screenshots

The capture scripts read the store from a running dev server and need a demo
customer account. Credentials are not stored in the repo.

```bash
export TOUR_EMAIL="<demo customer email>"
export TOUR_PASSWORD="<demo customer password>"
node capture/capture-checkout2.mjs
node capture/capture-payment.mjs
```

Convert the PNGs to the JPG names the scenes expect, then copy into `v2/assets/`:

```bash
ffmpeg -i captures/a2/checkout2.png -q:v 2 v2/assets/checkout.jpg
ffmpeg -i captures/a2/checkout-lower2.png -q:v 2 v2/assets/checkout-lower.jpg
ffmpeg -i captures/a2/payment2.png -q:v 2 v2/assets/payment.jpg
```

## Publishing

Copy the two finals over the served files and commit:

```bash
cp out-marketing.mp4 ../bctlabs-store/public/media/bctlabs-tour-marketing.mp4
cp out-admin.mp4 ../bctlabs-store/public/media/bctlabs-tour-admin.mp4
```

## Notes

- Generated audio, frames and renders are gitignored; only source is tracked.
- Narration text lives in `vo/script.json`; voice, rate and pitch are configurable
  through `VO_RATE`, `VO_PITCH`, `VO_RAW` and `VO_PROC`.
- The renderer relies on `window.__render(frameIndex)` so output is frame-exact and
  independent of wall-clock timing.
