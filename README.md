# The Brick and Mortar Cafe — About & Visit

The café's **About & Visit** page, enhanced with a ~20‑second watercolor intro short,
**"A Little Coffee. A Brighter Day."** The story autoplays once on the first visit,
then dissolves into the page; visitors can replay it any time from the **"Our story"** pill.

Everything is plain HTML/CSS/JS (no build step, no framework). It runs straight from
disk or on any static host (e.g. GitHub Pages).

## View it

- Easiest: open **`index.html`** in a browser.
- Or serve the folder (better for some browsers) and open `http://localhost:8080/`:
  ```bash
  npm run serve          # python -m http.server 8080
  ```

## Project structure

```
index.html                     The page. Links the CSS/JS below (relative paths).
css/
  site.css                     The original site styles.
  story-overlay.css            Styles for the intro overlay + "Our story" launcher.
js/
  hatchmaps.js                 Map rendering engine (unchanged).
  maphelpers.js                Map mounting helper (unchanged).
  site.js                      Today's-hours highlight, map mount, inquiry form.
  story/                       The watercolor animation, in load order:
    harness.js                 H — seeded RNG, easing, color, canvas helpers.
    sound.js                   SOUND — synthesized audio kit (no audio files).
    watercolor-engine.js       Paper, washes, pooled edges, granulation, brush lettering.
    scenes.js                  The 9 scene "plates" + per-scene animated effects.
    player.js                  Player UI, timeline, entry logic, sound score.
assets/
  hero-storefront.jpg          The three page photos (extracted from the original).
  about-cafe.jpg
  contact.jpg
video/
  anim-render.html             Clean 1280×720 export page (records the animation).
  animation.mp4                The rendered video (committed; re-generate any time).
render.mjs                     Node script that renders the MP4 using your Chrome.
package.json                   Scripts + the one dev dependency (puppeteer-core).
README.md                      This file.
Brick and Mortar Cafe — ORIGINAL backup.html        Pristine original (no animation).
Brick and Mortar Cafe — About & Visit (animated).html  Self-contained single-file build.
```

## The animation

- **1280×720, ~20 s, 5 scenes** (bad morning → rainy discovery → warm welcome → the coffee → a brighter day), rendered live on a canvas in the watercolor style — cold-press paper, pigment pooling, wet-in-wet blooms, granulation, brush lettering.
- **Autoplays once per session** (muted), then dissolves into the site. **Skip** (or `Esc`) ends it; **space** / `k` toggles play/pause. Controls: play/pause, scrub, time, **sound toggle** (starts muted). The bar auto‑hides during playback.
- **Mobile:** scenes genuinely recompose to a 4:5 portrait — not a shrunk letterbox. Rebuilds on rotate/resize.
- **Reduced motion / repeat visits:** the site shows immediately; the **"Our story"** pill launches the short on demand. It never blocks the page.
- **Render‑ready:** `window.seek(t)`, `window.DURATION` and `window.scoreSound` are exposed and deterministic (same `t` → same frame).

## The video file (`video/animation.mp4`)

It's already committed. To regenerate it (e.g. after editing a scene):

```bash
npm install            # once — installs puppeteer-core (uses your installed Chrome; no Chromium download)
npm run render         # writes video/animation.mp4
```

- Needs **Google Chrome** installed (the script auto-detects it; override with the `CHROME` env var).
- No ffmpeg required — it records Chrome's own canvas + audio to H.264/AAC MP4.
- **Alternative (no Node):** open `video/anim-render.html` in Chrome and click **Download video**.
- The MP4 writes its index at the end (standard for in-browser recording). It plays and scrubs correctly once downloaded — which is how GitHub serves it. If you want a progressive/streaming‑optimized copy, run `ffmpeg -i video/animation.mp4 -c copy -movflags +faststart video/animation-web.mp4` (ffmpeg optional, not included).

## Reverting / removing the animation

The intro is self-contained. To remove it from `index.html`, delete:
1. the `css/story-overlay.css` link in `<head>`,
2. the `#bmc-story` markup and the `#bmc-launch` button in the body,
3. the five `js/story/*.js` script tags,
4. the Caveat font `<link>`.

Nothing else depends on it. Or just use **`Brick and Mortar Cafe — ORIGINAL backup.html`**, the untouched original.

## Deploy

Any static host works. For **GitHub Pages**: push the folder, enable Pages on the branch,
and the site is live at `https://<user>.github.io/<repo>/`. (`node_modules/` is git-ignored;
`video/animation.mp4` is committed so the video is available without rendering.)
