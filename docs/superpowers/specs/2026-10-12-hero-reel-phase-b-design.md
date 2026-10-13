# Barry Design Studio — Hero Reel, Phase B (treatment)

**Date:** 2026-10-12
**Client:** Yousef Elbarry, Barry Design Studio
**Prepared by:** Hear Hear Agency
**Status:** Approved treatment

## 1. Concept

Each space begins as an architect's line drawing on a dark ground. The lines draw themselves in, the finished room rises up beneath them, and the lines dissolve into it. The reel cycles through three of Yousef's interiors. The message, in under five seconds: he designs the space, not just the decor. The tone is quiet, precise and slow-breathing, closer to a drafting table than a showreel.

**Linework method: curated vector lines.** Detect the straight edges in each image automatically (offline, once), then hand-pick about 40–80 strong architectural lines per room: vanishing lines, wall junctions, ceiling grid and key fixtures. Save them as SVG paths that draw on stroke by stroke.

**Rejected:** a full automatic trace (too noisy behind the headline) and an edge-filter reveal (reads as a filter, not as drawing).

## 2. Beat sheet (15s loop, 30fps, 450 frames)

Each segment is 5.0s (150 frames). Times below are relative to the segment's start.

| Segment time | Frames | What the viewer sees |
|---|---|---|
| 0.0–1.6s | 0–48 | Dark ground (`#121212`). Paper-coloured lines (`#f4f0ea`, 1.5px at 1080p, 70% opacity) draw on in drafting order: floor and ceiling vanishing lines, then walls, then fixtures. Camera scale 1.00→1.02. |
| 1.6–2.6s | 48–78 | The photo fades in beneath the lines (0→1) while the lines fade from 70% to 15%. |
| 2.6–4.4s | 78–132 | The photo holds while the camera pushes in (1.02→1.06; capped at 1.04 for OMG Burger). Lines fade from 15% to 0. |
| 4.4–5.0s | 132–150 | The photo fades back to the dark ground. The next segment's first lines start 0.3s (9 frames) before this one ends. |

| Segment | Global time | Project | Image |
|---|---|---|---|
| 1 | 0.0–5.0s | XO Juice and Studio (`xo-juice-and-studio`) | `xo-2.jpg` |
| 2 | 5.0–10.0s | OMG Burger (`omg-burger`) | `omg-burger-1.jpg` |
| 3 | 10.0–15.0s | Haii Keii (`haii-keii`) | `haii-keii-3.jpg` |

**Seamless loop:** frame 449 and frame 0 are both the dark ground with no visible lines or photo. The mean absolute per-pixel difference between them must be below 1%. Because of this, XO's lines start at frame 0 rather than 0.3s early on the wrap from Haii Keii.

**Corner badge (HTML, not in the video):** "XO Juice and Studio →", linking to the project page.
- **Position:** bottom-right of the hero on desktop; top-right under the nav at ≤ 768px.
- **Timing:** switches at 0s, 5s and 10s with a 400ms fade, driven by the video's `timeupdate` events (accuracy about 250ms).
- **Accessibility:** it is a real link, but it is not an `aria-live` region, so changes aren't announced.
- **Static cases:** when only the poster shows, the badge names XO and doesn't change.
- **Layout:** the vertical "scroll" label is removed from the hero to free the corner. The badge moves to the top-right up to 1024px, and drops its "Now showing" label at ≤ 480px.
- **Pause control (WCAG 2.2.2):** a 44px pause/play button sits beside the badge whenever the video is used. It offers Play if autoplay was refused.

## 3. Sound

None. The background video must be muted to autoplay, so the files carry no audio track.

## 4. Formats and delivery

| File | Dimensions | Codec | Budget |
|---|---|---|---|
| `public/video/hero-16x9.mp4` | 1920×1080, 30fps, 15.0s | H.264 yuv420p, `+faststart`, no audio | ≤ 2.5 MB |
| `public/video/hero-16x9.webm` | 1920×1080, 30fps, 15.0s | VP9, no audio | ≤ 2.0 MB |
| `public/video/hero-9x16.mp4` | 720×1280, 30fps, 15.0s | H.264 yuv420p, `+faststart`, no audio | ≤ 1.2 MB |
| `public/video/hero-9x16.webm` | 720×1280, 30fps, 15.0s | VP9, no audio | ≤ 1.2 MB |
| `public/video/hero-poster-16x9.webp` | 1920×1080 | WebP | ≤ 150 KB |
| `public/video/hero-poster-9x16.webp` | 720×1280 | WebP | ≤ 80 KB |

**Poster frame:** XO at the moment the lines meet the photo (segment 1, frame 63).

**Page behaviour**
- **Poster first:** a responsive `<picture>` poster (9:16 at ≤ 768px, 16:9 otherwise) renders immediately and is preloaded as the likely LCP element.
- **Video:** a muted, looping, `playsinline` `<video>` with no `poster` attribute is layered above the poster. It fades in on its first `playing` event.
- **Source choice:** JS picks the 9:16 or 16:9 sources at mount with `matchMedia('(max-width: 768px)')`, WebM first and MP4 second.
- **Poster only:** no video sources are attached, so no video bytes are requested, when any of these holds:
  - `prefers-reduced-motion: reduce`
  - `prefers-reduced-data: reduce` (not yet shipped in browsers; kept so it works when it is)
  - `navigator.connection.saveData === true`
  - `navigator.connection.effectiveType` is `slow-2g` or `2g`
- **Autoplay refused:** if `play()` rejects (for example iOS Low Power Mode), the poster stays and the video stays invisible.
- **Retired:** the stock building image `public/images/bg-hero-img.jpg` is no longer used by the hero.
- **Hero gradient, darkened (approved 2026-10-12):** stops 0.95 / 0.65 / 0.55 on desktop and 0.95 / 0.75 / 0.45 at ≤ 768px, so headline text keeps 4.5:1 over the reel's brightest frames down to a 1280×720 laptop, where the text reaches the top of the hero (the old gradient measured 2.5–2.7:1).
- **Unchanged:** the noise overlay and all hero text and buttons.

**Project structure**
- **Remotion project:** lives in `reel/`, with its own `package.json`. No Remotion code ships in the site bundle.
- **Single source of timing:** `src/data/heroReel.js` defines the segments (project id, image, crop focus per format, trace file, start frame, push-in cap). The reel compositions and the site's badge both read it.
- **Linework files:** SVGs are committed at `reel/traces/<project-id>-16x9.svg` and `-9x16.svg`, each with a `viewBox` matching the composition size.

## 5. Assumptions

- **Line style:** `#f4f0ea` at 1.5px (1080p) / 1.25px (720p), on `#121212`, both site tokens.
- **Photo brightness:** about 75% in the reel. The page's hero gradient, darkened as in §4, stays on top for headline contrast.
- **OMG Burger image (measured 1920×1080):**
  - **Desktop:** the push-in is capped at 1.04, a 4% upscale.
  - **Phone cut:** it is upscaled about 19% to fill 1280px of height. If the stills show visible softness, an AI upscale of that one image is offered as a follow-up. It is not part of this spec.
- **Other images:** XO 2 (2146×1300) and Haii Keii 3 (2560×1920) cover both formats without upscaling.
- **Edge detection:** OpenCV in a scratch Python virtualenv, run once, offline and dev-only. The curated SVGs are the committed output.
- **Licence:** Remotion is used under its free licence (Hear Hear Agency has 3 people or fewer).
- **Dependency versions:** pinned to exact releases at least two weeks old.

## 6. Verification

1. **Unit tests:**
   - **Timeline:** segment for any time, including the loop wrap; badge project for any `currentTime`.
   - **Source selection:** each low-data and reduced-motion signal results in poster only; 9:16 vs 16:9 choice.
2. **Stills:** about 12 key frames per format (draw-on, meeting point, hold, each hand-off, frames 449 and 0), viewed and shared with the user.
3. **Seam:** frame 449 vs frame 0, mean absolute per-pixel difference below 1%.
4. **Headline contrast:** in the stills, the headline region composited with the page's hero gradient keeps text at 85% opacity at ≥ 4.5:1 in every sampled frame.
5. **`ffprobe`:** duration 15.0s ± 1 frame, 30fps, dimensions as specified, no audio stream, file sizes within budget.
6. **Browser:**
   - **Playback:** the video plays and loops; the badge changes within 300ms of 5s, 10s and 15s and links to the right project.
   - **Fallbacks:** poster only when reduced motion or Data Saver is simulated.
   - **Phone width:** no horizontal scroll at 375px.
   - **Existing checks:** `scripts/verify-page.js` still passes on `/`.

## Out of scope

Social-media cuts, music, AI upscaling, more than three projects, and any change to hero copy.
