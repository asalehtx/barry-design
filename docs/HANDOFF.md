# Handoff — Barry Design Studio site

**Client:** Yousef Elbarry, Barry Design Studio (commercial interiors, Houston)
**Agency:** Hear Hear Agency
**Last updated:** 2026-10-12

## Where things stand

| Phase | Status | Branch | Docs |
|---|---|---|---|
| Foundations (contact form, assets, accent colour) | Done, on `main` | — | — |
| **A — Design polish** | **Done, merged to `main`** (98 tests, lint clean) | deleted after merge | [spec](superpowers/specs/2026-10-12-design-polish-phase-a-design.md), [plan](superpowers/plans/2026-10-12-design-polish-phase-a.md) |
| **B — Remotion hero reel** | **Done, merged to `main`** (153 tests, lint, build, render checks green) | deleted after merge | [spec](superpowers/specs/2026-10-12-hero-reel-phase-b-design.md), [plan](superpowers/plans/2026-10-12-hero-reel-phase-b.md) |

There is no git remote yet, so nothing has been pushed.

## Phase B: done, merged to `main`

Decided 2026-10-12: darker hero gradient (not a dimmed reel), executed natively with one final review.

**Final review fixes** (beyond the plan):
- **Laptop contrast.** The plan's contrast check only modelled a 1920×1080 layout. At 1280×720 the headline reaches the top of the hero, where it measured 3.45:1. The check now covers the shortest layouts, and the desktop gradient's top stop went from 0.35 to 0.55 (worst case now 4.98:1). Phones were already fine (5.15:1).
- **Pause control** (WCAG 2.2.2): a 44px pause/play button beside the badge. It offers Play if autoplay was refused.
- **Badge** keeps keyboard focus when the project changes. It moves top-right up to 1024px and drops its "Now showing" label at ≤ 480px.
- **Poster preload** in `index.html`, one per viewport.

**Still to do:**
- **Reduce motion:** a real check with macOS **Reduce motion** on (see below).
- **Deferred minors** from the review: all four fixed on 2026-10-12.
  - Each trace now records the image, focus and settings it was made from, and a test fails if any of them change without re-running `trace.py`.
  - `check_renders.py` now checks codecs, MP4 fast-start, and the loop seam in frames decoded from each shipped video.
  - `trace.py` cuts lines at the frame edge instead of bending them.
  - XO's 9:16 trace now has 46 lines, and the test enforces the spec's 40–80.

### What was built
- **Linework:** an offline OpenCV tracer (`reel/tools/trace.py`) curates straight architectural lines from three renders: XO 2, OMG Burger 1 and Haii Keii 3.
- **Reel:** a Remotion project in `reel/` renders a 15s, 30fps loop at 1920×1080 and 720×1280, as MP4 and WebM, plus WebP posters, all into `public/video/`.
- **Site:** the hero shows a `<picture>` poster plus a `<video>` with sources chosen once at mount. Reduced-motion, reduced-data, Data Saver and slow-2g visitors get the poster only and download no video. A corner badge links to the space on screen.
- **Single source of timing:** `src/data/heroReel.json`, read by the site, by Remotion and by the Python tools.

### Environment notes
- **Pinned versions:** Remotion 4.0.529; Python tools `opencv-python-headless==4.14.0.94`, `numpy==2.5.3`, `pillow==12.2.0`, installed in `reel/.venv`, which is git-ignored.
- **ffmpeg:** no system ffmpeg is needed, because Remotion bundles `ffmpeg`/`ffprobe`. The user installed ffmpeg on 2026-10-12, but it wasn't on this shell's PATH.
- **WebP posters:** made with Pillow. Remotion stills can't write WebP, and the bundled ffmpeg has no WebP encoder.
- **First render:** downloads Chrome Headless Shell, so it needs network access.
- **Install order:** run `npm --prefix reel install` before the root `npm test`. The reel's beat tests import `remotion`.
- **Licence:** Remotion is used under its free licence (Hear Hear has 3 people or fewer).

## Waiting on Yousef
- Which projects included procurement and installation (sets `procurement: true` in `src/data/projects.js`).
- Photos for Greek Orthodox Cathedral, Flying Saucer Draught DFW, DoubleTree by Hilton and MSY Airport Retail.
- Verified area for the Greek Orthodox Cathedral.
- Instagram, Facebook and LinkedIn URLs (`SOCIAL_LINKS` in `src/App.jsx`).

## Open items, not blocking
- **Real reduced-motion check:** turn on macOS **Reduce motion** and load `/`. Content should appear without animation. The browser pane couldn't emulate it.
- **Deploy:** the host must rewrite every path to `index.html`, or deep links like `/project/haii-keii` will 404.
- **Phase A's deferred items:** all fixed on 2026-10-12.
  - One not-found page now serves unknown paths, projects and categories, with ways back.
  - The work filter lives in the URL (`/?category=retail`). It survives Back (which lands on the list), reloads and shared links.
  - The compact list reads "In progress" when no photographed projects precede it.
  - The carousel test uses the app's own route component.
- **Possible Phase B follow-up:** an AI upscale of `omg-burger-1.jpg`. Its 9:16 cut is upscaled about 19%; at full size it looked only mildly soft, so this isn't needed now.

## How to run
```bash
npm install
npm run dev        # dev server
npm test           # Vitest suite
npm run lint
npm run build && npm run preview   # production preview on :4173
```
`scripts/verify-page.js` is a browser-console check for small text, overflow, broken images and tap targets. Usage is in Phase A's plan, Task 7.
