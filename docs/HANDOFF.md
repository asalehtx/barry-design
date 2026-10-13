# Handoff — Barry Design Studio site

**Client:** Yousef Elbarry, Barry Design Studio (commercial interiors, Houston)
**Agency:** Hear Hear Agency
**Live site:** https://barry-design.adam-04d.workers.dev
**Last updated:** 2026-10-12

## Where things stand

Everything is merged to `main`, which is the only branch.
- **Checks:** 197 site tests and 6 reel-tool tests pass, and lint, build and the reel's render checks are green.
- **Not pushed:** there is no git remote yet.

| Work | Status | Docs |
|---|---|---|
| Foundations (contact form, assets, accent colour) | Done | — |
| **A — Design polish** | Done, plus its four deferred review items | [spec](superpowers/specs/2026-10-12-design-polish-phase-a-design.md), [plan](superpowers/plans/2026-10-12-design-polish-phase-a.md) |
| **B — Remotion hero reel** | Done, plus final-review fixes and four deferred minors | [spec](superpowers/specs/2026-10-12-hero-reel-phase-b-design.md), [plan](superpowers/plans/2026-10-12-hero-reel-phase-b.md) |
| **Hosting** | Live on Cloudflare since 2026-10-12 | [Live site](#live-site) |

## Open items

1. **Check iPhone playback.** Open the live site in Safari on an iPhone; the hero reel should play. The server side is verified (206 range responses), but no real iPhone has tried it yet.
2. **Check Reduce Motion.** Turn on macOS **Reduce motion** and load `/`. You should see the still poster and no video, and content should appear without animation. The browser pane can't emulate this setting.
3. **Decide where the site lives long-term.** It's on Hear Hear's Cloudflare account at a `workers.dev` address. If it should move to Yousef's account or a custom domain, deploy there and update [Live site](#live-site).
4. **Waiting on Yousef:**
   - Which projects included procurement and installation. This sets `procurement: true` in `src/data/projects.js`.
   - Photos for Greek Orthodox Cathedral, Flying Saucer Draught DFW, DoubleTree by Hilton and MSY Airport Retail.
   - Verified area for the Greek Orthodox Cathedral.
   - Instagram, Facebook and LinkedIn URLs (`SOCIAL_LINKS` in `src/App.jsx`).
5. **Optional:**
   - An AI upscale of `omg-burger-1.jpg`. Its 9:16 cut is upscaled about 19%. At full size it looked only mildly soft, so this isn't needed now.
   - `npm audit` lists 14 warnings. All are in dev tooling (Vite, Babel, Wrangler's local runtime), and none ship to visitors.
   - Wrangler 4.149 is out; this project pins 4.142.0. If you upgrade, the compatibility date can move up too (see [Environment](#environment)).

## Live site

- **Where:** https://barry-design.adam-04d.workers.dev, a Cloudflare Worker named `barry-design` in Hear Hear's account (adam@hearhear.agency).
- **Deploy:** run `npx wrangler login` once, then `npm run deploy` (it builds, then runs `wrangler deploy`).
- **Pages:** `wrangler.jsonc` serves `dist/` as static assets. Any path that isn't a file gets `index.html` with a 200, so `/project/<id>`, `/category/<slug>`, `/?category=<slug>` and unknown paths all load the app. Unknown paths then show the app's own not-found page.
- **Videos:** Cloudflare's static assets ignore byte-range requests; in production they always returned 200 and the whole file. iPhone Safari won't play video without 206 responses. So `worker/index.js` runs only for `/video/*`:
  - a range request gets 206 with exactly the requested bytes;
  - an unsatisfiable range gets 416;
  - a request without a range gets 200, marked as supporting ranges;
  - a missing video gets 404.
- **Excluded files:** `public/.assetsignore` keeps macOS `.DS_Store` files out of the upload.
- **After each deploy,** run this check. It should return `206` with `content-range: bytes 0-1/…`. Use a GET as written: `-I` sends HEAD, which always returns 200.

  ```bash
  curl -s -D - -o /dev/null -H "Range: bytes=0-1" https://barry-design.adam-04d.workers.dev/video/hero-9x16.mp4
  ```

## What was built

### Phase A — design polish
- **Work list:** photographed projects show as numbered rows. Projects without photos show in a compact list, headed "Also in progress", or "In progress" when nothing photographed comes before it.
- **Filter:** it lives in the URL (`/?category=retail`), so it survives Back, reloads and shared links. Back from a project lands on the list. Changing the filter doesn't scroll or add history entries. "All Projects" in the menu (`/#work`) clears it.
- **Project pages** have a carousel and a next-project link.
- **One not-found page** serves unknown paths, projects and categories. It has a back link and a link to all projects.
- **Accessibility:** a 12px text floor, 44px touch targets, a focus ring, a skip link on every page, reduced-motion support, and no horizontal scroll at 375px.

### Phase B — "drawing becomes space" hero reel
- **Linework:** an offline OpenCV tracer (`reel/tools/trace.py`) curates straight architectural lines from XO 2, OMG Burger 1 and Haii Keii 3.
  - Lines are cut at the frame edge.
  - Each trace records the image, focus and settings it was made from, so a test fails if `heroReel.json` changes without re-tracing.
- **Reel:** a Remotion project in `reel/` renders a 15s, 30fps loop at 1920×1080 and 720×1280, as MP4 and WebM, plus WebP posters, all into `public/video/`.
- **Render checks:** `reel/tools/check_renders.py` checks:
  - the loop seam, in stills and in frames decoded from each shipped video;
  - headline contrast at the shortest layouts (1280×720 and 375×667);
  - codecs, MP4 fast-start, formats and file sizes.
- **Hero:**
  - A `<picture>` poster, preloaded once per screen size, sits under a `<video>` whose sources are chosen once at page load.
  - Reduced-motion, reduced-data, Data Saver and 2G visitors get the poster only and download no video.
  - A corner badge names the space on screen and keeps keyboard focus as it changes.
  - A 44px pause/play button sits beside the badge (WCAG 2.2.2). It offers Play if autoplay is refused.
- **Gradient:** the hero gradient was darkened for 4.5:1 headline contrast over the reel's brightest frames (approved 2026-10-12).
  - Desktop stops are 0.95 / 0.65 / 0.55; the top was raised from 0.35 so 1280×720 laptops pass.
  - Phone stops are 0.95 / 0.75 / 0.45.
- **Single source of timing:** `src/data/heroReel.json`, read by the site, by Remotion and by the Python tools.

## Environment

- **Node:** Node 24 and npm 11. The reel has its own `node_modules`; run `npm --prefix reel install` before the root `npm test`, because the reel's beat tests import `remotion`.
- **Pinned versions:**
  - Remotion 4.0.529 and Wrangler 4.142.0.
  - The Python tools use `opencv-python-headless==4.14.0.94`, `numpy==2.5.3` and `pillow==12.2.0`, in `reel/.venv` (git-ignored). Create it with `python3 -m venv reel/.venv && reel/.venv/bin/pip install -r reel/tools/requirements.txt`.
- **Compatibility date:** `2026-10-03` in `wrangler.jsonc`, the newest date the pinned Wrangler's local runtime supports, so `wrangler dev` matches production.
- **ffmpeg:**
  - No system ffmpeg is needed, because Remotion bundles `ffmpeg` and `ffprobe` (`npx remotion ffmpeg`).
  - Its build has no WebP encoder, no `rawvideo` muxer and no `select` filter. That's why posters go through Pillow and the seam check seeks by time.
- **Network:** the first Remotion render downloads Chrome Headless Shell.
- **Licence:** Remotion is used under its free licence (Hear Hear has 3 people or fewer).

## How to run

```bash
npm install && npm --prefix reel install
npm run dev                                   # dev server
npm test                                      # Vitest suite (site, reel beats, deploy config, video Worker)
npm run lint
npm run build && npm run preview              # production preview on :4173
npm run build && npx wrangler dev             # the build on Cloudflare's runtime, with the video Worker, on :8787
npm run deploy                                # build and deploy to Cloudflare (after `npx wrangler login`)
reel/.venv/bin/python -I reel/tools/test_tools.py   # reel-tool unit tests
```

`scripts/verify-page.js` is a browser-console check for small text, overflow, broken images and tap targets. Usage is in Phase A's plan, Task 7.

To regenerate the reel after changing the timeline or images, follow `reel/README.md`: trace, render, posters, checks. Then commit and redeploy.
