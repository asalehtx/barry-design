# Barry Design Studio — Phase B Hero Reel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stock hero photo with a pre-rendered, looping "drawing becomes space" reel (XO → OMG Burger → Haii Keii), plus a synced corner badge, responsive posters and a poster-only path for reduced motion and low-data visitors.

**Architecture:**
- **Shared timeline:** `src/data/heroReel.json` is the one source for timing, images, crop focus and trace settings. It's read by Remotion, by the Python tools, and by the site (through `src/data/heroReel.js`).
- **Linework:** a one-off OpenCV tool (`reel/tools/trace.py`) turns each image into curated straight-line linework (`reel/traces/*.json`).
- **Rendering:** a separate Remotion project in `reel/` renders 16:9 and 9:16 compositions to MP4 and WebM in `public/video/`. Pillow writes the WebP posters, and `reel/tools/check_renders.py` verifies seam, contrast, format and file sizes.
- **Site:** the hero shows a `<picture>` poster and a `<video>` whose sources are chosen once at mount. A badge follows `timeupdate`.

**Tech Stack:** React 19.2 + Vite 8 (site), Remotion 4.0.529 + React 19.2.6 (`reel/`), Python 3.14 with OpenCV 4.14.0.94, numpy 2.5.3 and Pillow 12.2.0 (dev-only tools), Vitest 5 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-12-hero-reel-phase-b-design.md`

**Preconditions** (each checked on 2026-10-12):
- **Node and npm:** Node `v24.14.1`, npm `11.11.0`.
- **Python:** 3.14.3 with `venv` (`python3 -m venv --help` works), on an arm64 Mac.
- **Network access** for:
  - **npm:** `remotion@4.0.529`, `@remotion/cli@4.0.529`, `react@19.2.6`, `react-dom@19.2.6`.
  - **PyPI:** `opencv-python-headless==4.14.0.94` (abi3 wheel), `numpy==2.5.3`, `pillow==12.2.0`.
  - **Remotion's Chrome Headless Shell:** downloaded automatically on the first `remotion still` or `render`.
- **No system ffmpeg needed:** Remotion bundles `ffmpeg`/`ffprobe` (`npx remotion ffprobe`). Its bundled ffmpeg has **no WebP encoder**, which is why posters go through Pillow. A system ffmpeg is not on this machine's PATH and is not required.
- **Remotion licence:** free tier. Hear Hear Agency has 3 people or fewer (confirmed by the user).
- **Browser pane** (or Chrome) for Task 6. The pane may report `visibilityState: hidden`, which defers autoplay. Task 6 starts playback by hand.

## Global Constraints

- **Timing:** 30 fps, 150-frame (5.0s) segments, 450 frames (15.0s) total. Order: `xo-juice-and-studio` (`xo-2.jpg`), `omg-burger` (`omg-burger-1.jpg`), `haii-keii` (`haii-keii-3.jpg`).
- **Colours:** ground `#121212`; lines `#f4f0ea` at 1.5px (16:9) / 1.25px (9:16); photo brightness 0.75. Push-in capped at 1.06 (1.04 for OMG Burger).
- **Loop seam:** frame 449 and frame 0 both pure ground, mean per-pixel difference below 1%.
- **Files and budgets:** `hero-16x9.mp4` ≤ 2.5 MB, `hero-16x9.webm` ≤ 2.0 MB, `hero-9x16.mp4` ≤ 1.2 MB, `hero-9x16.webm` ≤ 1.2 MB, `hero-poster-16x9.webp` ≤ 150 KB, `hero-poster-9x16.webp` ≤ 80 KB. All 30fps, 15.0s, no audio, `yuv420p`.
- **Poster only** (no video requested) for: `prefers-reduced-motion: reduce`, `prefers-reduced-data: reduce`, `navigator.connection.saveData`, `effectiveType` of `slow-2g` or `2g`. If `play()` rejects, the poster stays.
- **Badge:** bottom-right on desktop, top-right at ≤ 768px. 400ms fade. A real link, but not `aria-live`.
- **Text contrast:** text at 85% opacity keeps ≥ 4.5:1 over every sampled frame, measured with the page gradient applied.
- **Dependencies:** pinned to exact versions at least two weeks old.
- **Unchanged:** Phase A guarantees (12px text floor, 44px targets, focus ring, no horizontal scroll at 375px).

## Review Focus

1. **Low-data visitors must not download video at all**, not merely be shown the poster on top. Test: Task 5, `requests no video for %s` (asserts no `<video>` element exists).
2. **The badge must follow the loop wrap** from Haii Keii back to XO, not stick on the last project. Test: Task 5, `follows the video through OMG Burger and Haii Keii, then back to XO`.
3. **Autoplay refused** (iOS Low Power Mode, browser policy) must leave a clean poster, not a black or half-faded video. Test: Task 5, `keeps the poster when autoplay is refused`.
4. **A trace regenerated after an image or focus change** must still fit its composition, with no lines outside the frame. Test: Task 2, the `curated traces` block (size, line count, coordinates in bounds). Writing this test during planning caught a real 3.5px overrun, now clamped in `trace.py`.
5. **Hero text over the reel's brightest frames** (pendant lights, Haii Keii's lightboxes) must stay readable. Tests: Task 4's `check_renders.py` contrast check, and Task 5's CSS guard that pins the gradient stops the check assumes.

## Plan-level decisions (beyond the spec, for the reviewer)

- **Hero gradient strengthened (spec conflict, resolved for contrast).** The spec said the gradient stays unchanged, but measured contrast over the reel was 2.5–2.7:1 in its brightest frames. The new stops are 0.95 / 0.65 / 0.35 on desktop and 0.95 / 0.75 / 0.45 at ≤ 768px, measured at 4.66:1 and 5.25:1. Keeping the reel at 0.75 brightness keeps the photos rich, as the treatment specifies. The hero reads somewhat darker, mostly at the top on phones.
- **`heroReel.json` is the source of truth**, wrapped by `heroReel.js` (the file the spec names) so that Python can read it too. Trace settings are stored per format, because exclusion zones are relative to each crop.
- **Traces committed as JSON** (read by Remotion) plus SVG (the spec's viewable artefact).
- **Posters** are rendered as PNG stills and converted to WebP with Pillow, stepping quality down until each fits its budget. `remotion still` can't output WebP and the bundled ffmpeg lacks `libwebp`.
- **Render flags** `--pixel-format=yuv420p --color-space=bt709`. Without them, H.264 comes out full-range `yuvj420p`. CRF values: H.264 30 (`--x264-preset=slow`), VP9 46 for 16:9 and 44 for 9:16. These were tuned to the budgets: the 16:9 WebM was 3.04 MB at CRF 40.
- **Segment overlap vs seam:** segments 2 and 3 start drawing 9 frames early, as the spec describes. Segment 1 starts exactly at frame 0, and every photo is gone by local frame 147, so frames 147–149 and frame 0 are identical ground.
- **XO's phone crop** uses focus 0.8 (shelves, pendants, counter). At 0.5 it centred on the tree and traced sparsely.
- **Retired hero pieces:** the vertical "scroll" label is removed, and `public/images/bg-hero-img.jpg` is deleted (still in git history).
- **Test setup:** `src/test/setup.js` stubs `matchMedia` and `HTMLMediaElement.play` and resets them after every test. Calling `vi.spyOn` on an existing `vi.fn` returns the same mock, so `restoreAllMocks` would leak overrides between tests.
- **Setup order:** `reel/` has its own `node_modules`, and the root `npm test` imports `remotion` through `reel/src/beats.test.js`. Run `npm --prefix reel install` before the root suite.

## File map

| File | Responsibility | Task |
|---|---|---|
| `src/data/heroReel.json`, `src/data/heroReel.js`, `src/data/heroReel.test.js` | shared timeline and `segmentIndexAt` | 1 (test extended in 2) |
| `.gitignore`, `reel/tools/requirements.txt`, `reel/tools/trace.py`, `reel/traces/*` | linework detection and curated traces | 2 |
| `reel/package.json`, `reel/package-lock.json`, `reel/remotion.config.js`, `reel/src/*` | Remotion compositions and beat maths | 3 |
| `reel/tools/posters.py`, `reel/tools/check_renders.py`, `reel/README.md`, `public/video/*` | renders, posters, automated checks | 4 |
| `src/lib/heroMedia.js` (+ test), `src/test/setup.js`, `src/App.jsx`, `src/App.hero.test.jsx`, `src/styles/home.css`, `src/styles/base.css`, `src/styles/layout.test.js` | site integration | 5 |
| `public/images/bg-hero-img.jpg` | deleted | 5 |
| (no files) | browser verification | 6 |

---

### Task 1: Shared reel timeline

**Files:**
- Create: `src/data/heroReel.json`, `src/data/heroReel.js`, `src/data/heroReel.test.js`

**Interfaces:**
- Produces:
  - `REEL`: the parsed JSON. `{ fps, segmentFrames, formats: { '16x9': {width,height}, '9x16': {...} }, segments: [{ projectId, image, maxScale, focus: { [format]: [fx, fy] }, trace: { [format]: { maxLines, minLength, exclude: [[x0,y0,x1,y1]] } } }] }`
  - `REEL_FRAMES` (450) and `REEL_SECONDS` (15)
  - `segmentIndexAt(seconds) -> 0|1|2`, which wraps at 15s and treats negative times as wrapped.

- [ ] **Step 1: Write the failing tests** `src/data/heroReel.test.js`

```js
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { REEL, REEL_FRAMES, REEL_SECONDS, segmentIndexAt } from './heroReel'
import { findProject } from './projects'

describe('hero reel timeline', () => {
  it('is three 5-second segments at 30 fps', () => {
    expect(REEL.fps).toBe(30)
    expect(REEL.segmentFrames).toBe(150)
    expect(REEL_FRAMES).toBe(450)
    expect(REEL_SECONDS).toBe(15)
  })

  it('runs XO, then OMG Burger, then Haii Keii', () => {
    expect(REEL.segments.map((s) => s.projectId)).toEqual(['xo-juice-and-studio', 'omg-burger', 'haii-keii'])
  })

  it('points at real projects and images', () => {
    for (const s of REEL.segments) {
      expect(findProject(s.projectId)).not.toBeNull()
      expect(existsSync(join(process.cwd(), 'public', s.image))).toBe(true)
    }
  })

  it('caps the OMG Burger push-in at 1.04 and the others at 1.06', () => {
    expect(REEL.segments.map((s) => s.maxScale)).toEqual([1.06, 1.04, 1.06])
  })
})

describe('segmentIndexAt', () => {
  it.each([
    [0, 0],
    [4.99, 0],
    [5, 1],
    [9.99, 1],
    [10, 2],
    [14.99, 2],
  ])('at %ss shows segment %i', (seconds, index) => {
    expect(segmentIndexAt(seconds)).toBe(index)
  })

  it('wraps at the loop point', () => {
    expect(segmentIndexAt(15)).toBe(0)
    expect(segmentIndexAt(20.5)).toBe(1)
  })

  it('treats negative times as wrapped', () => {
    expect(segmentIndexAt(-0.5)).toBe(2)
  })
})
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `npx vitest run src/data/heroReel.test.js`
Expected: FAIL with `Failed to resolve import "./heroReel"`.

- [ ] **Step 3: Create `src/data/heroReel.json`**

```json
{
  "fps": 30,
  "segmentFrames": 150,
  "formats": {
    "16x9": {
      "width": 1920,
      "height": 1080
    },
    "9x16": {
      "width": 720,
      "height": 1280
    }
  },
  "segments": [
    {
      "projectId": "xo-juice-and-studio",
      "image": "/images/projects/xo/xo-2.jpg",
      "maxScale": 1.06,
      "focus": {
        "16x9": [
          0.5,
          0.5
        ],
        "9x16": [
          0.8,
          0.5
        ]
      },
      "trace": {
        "16x9": {
          "maxLines": 60,
          "minLength": 0.05,
          "exclude": [
            [
              0,
              0,
              0.17,
              1
            ],
            [
              0.72,
              0.66,
              0.93,
              1
            ]
          ]
        },
        "9x16": {
          "maxLines": 50,
          "minLength": 0.05,
          "exclude": [
            [
              0.35,
              0.62,
              1,
              1
            ]
          ]
        }
      }
    },
    {
      "projectId": "omg-burger",
      "image": "/images/projects/omg-burger/omg-burger-1.jpg",
      "maxScale": 1.04,
      "focus": {
        "16x9": [
          0.5,
          0.5
        ],
        "9x16": [
          0.5,
          0.5
        ]
      },
      "trace": {
        "16x9": {
          "maxLines": 60,
          "minLength": 0.05,
          "exclude": []
        },
        "9x16": {
          "maxLines": 50,
          "minLength": 0.05,
          "exclude": []
        }
      }
    },
    {
      "projectId": "haii-keii",
      "image": "/images/projects/haii-keii/haii-keii-3.jpg",
      "maxScale": 1.06,
      "focus": {
        "16x9": [
          0.5,
          0.5
        ],
        "9x16": [
          0.5,
          0.5
        ]
      },
      "trace": {
        "16x9": {
          "maxLines": 60,
          "minLength": 0.05,
          "exclude": [
            [
              0,
              0.72,
              0.13,
              1
            ]
          ]
        },
        "9x16": {
          "maxLines": 50,
          "minLength": 0.05,
          "exclude": []
        }
      }
    }
  ]
}
```

- [ ] **Step 4: Create `src/data/heroReel.js`**

```js
// Hero reel timeline, shared by the Remotion compositions (reel/) and the site's hero badge.
// The JSON is also read by reel/tools/trace.py, so it stays the single source of truth.
import reel from "./heroReel.json";

export const REEL = reel;
export const REEL_FRAMES = reel.segments.length * reel.segmentFrames;
export const REEL_SECONDS = REEL_FRAMES / reel.fps;

// Index of the segment showing at `seconds` into the video, wrapping at the loop point.
export const segmentIndexAt = (seconds) => {
  const t = ((seconds % REEL_SECONDS) + REEL_SECONDS) % REEL_SECONDS;
  return Math.min(Math.floor((t * reel.fps) / reel.segmentFrames), reel.segments.length - 1);
};
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/data/heroReel.test.js`
Expected: `Tests  12 passed (12)`.

- [ ] **Step 6: Commit**

```bash
git add src/data/heroReel.json src/data/heroReel.js src/data/heroReel.test.js
git commit -m "feat: shared hero reel timeline" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Line tracer and curated traces

**Files:**
- Modify: `.gitignore`, `src/data/heroReel.test.js` (add the `curated traces` block)
- Create: `reel/tools/requirements.txt`, `reel/tools/trace.py`, `reel/traces/<projectId>-<format>.json` and `.svg` (six of each)

**Interfaces:**
- Consumes: `src/data/heroReel.json` (Task 1).
- Produces: `reel/traces/<projectId>-<format>.json` = `{ width, height, lines: [[x1, y1, x2, y2], ...] }`, with lines in drafting order (longest first) and coordinates clamped inside the frame.

- [ ] **Step 1: Ignore tool output and the virtualenv**

Append to `.gitignore`:

```
# Hero reel tooling
reel/.venv/
reel/out/
```

- [ ] **Step 2: Add the failing trace tests** to the end of `src/data/heroReel.test.js`, and change its first import line to `import { existsSync, readFileSync } from 'node:fs'`

```js
describe('curated traces', () => {
  it.each(REEL.segments.flatMap((s) => Object.keys(REEL.formats).map((f) => [s.projectId, f])))(
    '%s %s exists, matches the composition size and has 30-70 lines',
    (projectId, format) => {
      const path = join(process.cwd(), 'reel', 'traces', `${projectId}-${format}.json`)
      expect(existsSync(path)).toBe(true)
      const trace = JSON.parse(readFileSync(path, 'utf8'))
      expect([trace.width, trace.height]).toEqual([REEL.formats[format].width, REEL.formats[format].height])
      expect(trace.lines.length).toBeGreaterThanOrEqual(30)
      expect(trace.lines.length).toBeLessThanOrEqual(70)
      for (const [x1, y1, x2, y2] of trace.lines) {
        for (const [v, max] of [[x1, trace.width], [y1, trace.height], [x2, trace.width], [y2, trace.height]]) {
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(max)
        }
      }
    },
  )
})
```

- [ ] **Step 3: Run them to confirm they fail**

Run: `npx vitest run src/data/heroReel.test.js`
Expected: FAIL, 6 failing (`curated traces` — no trace files yet), 12 passing.

- [ ] **Step 4: Create `reel/tools/requirements.txt` and the virtualenv**

```text
# Dev-only tools for the hero reel (tracing, posters, render checks). Never shipped with the site.
numpy==2.5.3
opencv-python-headless==4.14.0.94
pillow==12.2.0
```

```bash
python3 -m venv reel/.venv
reel/.venv/bin/pip install --disable-pip-version-check -r reel/tools/requirements.txt
reel/.venv/bin/python -I -c "import cv2, numpy; print(cv2.__version__, numpy.__version__, hasattr(cv2, 'createLineSegmentDetector'))"
```

Expected: `4.14.0 2.5.3 True`.

- [ ] **Step 5: Create `reel/tools/trace.py`**

```python
"""Detect straight architectural lines in each hero-reel image and write curated traces.

Run from the repo root with the trace virtualenv:
    reel/.venv/bin/python -I reel/tools/trace.py [--preview]

Reads src/data/heroReel.json. For every segment and format it crops the image exactly as the
reel does (cover + focus), detects line segments, merges collinear pieces, drops excluded
regions, keeps the longest `maxLines`, and writes:
    reel/traces/<projectId>-<format>.json   consumed by the Remotion composition
    reel/traces/<projectId>-<format>.svg    for viewing the linework on its own
With --preview it also writes reel/out/trace-<projectId>-<format>.png (lines over the photo).
"""
import json
import math
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
CONFIG = ROOT / "src" / "data" / "heroReel.json"
TRACES = ROOT / "reel" / "traces"
OUT = ROOT / "reel" / "out"


def cover_crop(img, width, height, focus):
    """Scale to cover width x height, then crop with the focus point, like CSS object-position."""
    ih, iw = img.shape[:2]
    scale = max(width / iw, height / ih)
    sw, sh = round(iw * scale), round(ih * scale)
    interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC
    scaled = cv2.resize(img, (sw, sh), interpolation=interp)
    left = round((sw - width) * focus[0])
    top = round((sh - height) * focus[1])
    return scaled[top:top + height, left:left + width]


def detect(gray):
    lsd = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD)
    found = lsd.detect(cv2.GaussianBlur(gray, (3, 3), 0))[0]
    return [] if found is None else [tuple(map(float, s[0])) for s in found]


def angle_of(seg):
    x1, y1, x2, y2 = seg
    return math.atan2(y2 - y1, x2 - x1) % math.pi


def length_of(seg):
    x1, y1, x2, y2 = seg
    return math.hypot(x2 - x1, y2 - y1)


def merge_collinear(segments, angle_tol=math.radians(2), dist_tol=4.0, gap_tol=30.0):
    """Greedily join segments that lie on (almost) the same line and overlap or nearly touch."""
    segs = sorted(segments, key=length_of, reverse=True)
    merged = []
    for seg in segs:
        a = angle_of(seg)
        for i, m in enumerate(merged):
            ma = angle_of(m)
            if min(abs(a - ma), math.pi - abs(a - ma)) > angle_tol:
                continue
            # Unit direction and normal of the existing line.
            dx, dy = math.cos(ma), math.sin(ma)
            nx, ny = -dy, dx
            mx, my = m[0], m[1]
            d1 = abs((seg[0] - mx) * nx + (seg[1] - my) * ny)
            d2 = abs((seg[2] - mx) * nx + (seg[3] - my) * ny)
            if max(d1, d2) > dist_tol:
                continue
            ts = sorted([0.0, (m[2] - mx) * dx + (m[3] - my) * dy])
            t1 = (seg[0] - mx) * dx + (seg[1] - my) * dy
            t2 = (seg[2] - mx) * dx + (seg[3] - my) * dy
            lo, hi = sorted([t1, t2])
            if lo > ts[1] + gap_tol or hi < ts[0] - gap_tol:
                continue
            t_lo, t_hi = min(ts[0], lo), max(ts[1], hi)
            merged[i] = (mx + dx * t_lo, my + dy * t_lo, mx + dx * t_hi, my + dy * t_hi)
            break
        else:
            merged.append(seg)
    return merged


def drop_near_duplicates(segments, angle_tol=math.radians(3), dist_tol=10.0):
    """Keep only the longest of near-parallel lines that sit within `dist_tol` px and overlap,
    e.g. the two edges of one window frame."""
    kept = []
    for seg in sorted(segments, key=length_of, reverse=True):
        a = angle_of(seg)
        dx, dy = math.cos(a), math.sin(a)
        nx, ny = -dy, dx
        duplicate = False
        for k in kept:
            ka = angle_of(k)
            if min(abs(a - ka), math.pi - abs(a - ka)) > angle_tol:
                continue
            d = abs(((k[0] + k[2]) / 2 - seg[0]) * nx + ((k[1] + k[3]) / 2 - seg[1]) * ny)
            if d > dist_tol:
                continue
            t = sorted([(k[0] - seg[0]) * dx + (k[1] - seg[1]) * dy, (k[2] - seg[0]) * dx + (k[3] - seg[1]) * dy])
            if t[1] < 0 or t[0] > length_of(seg):
                continue
            duplicate = True
            break
        if not duplicate:
            kept.append(seg)
    return kept


def inside(seg, rect, width, height):
    """True when the segment's midpoint falls inside a normalised [x0, y0, x1, y1] rect."""
    cx, cy = (seg[0] + seg[2]) / 2 / width, (seg[1] + seg[3]) / 2 / height
    return rect[0] <= cx <= rect[2] and rect[1] <= cy <= rect[3]


def curate(segments, width, height, trace):
    diag = math.hypot(width, height)
    kept = [s for s in segments if length_of(s) >= trace["minLength"] * diag]
    kept = [s for s in kept if not any(inside(s, r, width, height) for r in trace["exclude"])]
    kept = drop_near_duplicates(kept)  # sorted longest first: structure first, detail last  # drafting order: structure first, detail last
    return kept[: trace["maxLines"]]


def write_outputs(seg_id, fmt, width, height, lines, photo, preview):
    # Merging can push an end a few px past the frame edge; clamp back inside it.
    rounded = [
        [round(min(max(v, 0), width if i % 2 == 0 else height), 1) for i, v in enumerate(line)]
        for line in lines
    ]
    TRACES.mkdir(parents=True, exist_ok=True)
    (TRACES / f"{seg_id}-{fmt}.json").write_text(
        json.dumps({"width": width, "height": height, "lines": rounded}, separators=(",", ":")) + "\n"
    )
    paths = "\n".join(
        f'  <line x1="{l[0]}" y1="{l[1]}" x2="{l[2]}" y2="{l[3]}"/>' for l in rounded
    )
    (TRACES / f"{seg_id}-{fmt}.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'stroke="#f4f0ea" stroke-width="1.5" stroke-linecap="round">\n'
        f'  <rect width="{width}" height="{height}" fill="#121212"/>\n{paths}\n</svg>\n'
    )
    if preview:
        OUT.mkdir(parents=True, exist_ok=True)
        canvas = (photo * 0.45).astype(np.uint8)
        for x1, y1, x2, y2 in rounded:
            cv2.line(canvas, (round(x1), round(y1)), (round(x2), round(y2)), (234, 240, 244), 2, cv2.LINE_AA)
        cv2.imwrite(str(OUT / f"trace-{seg_id}-{fmt}.png"), canvas)
        ink = np.full_like(photo, (18, 18, 18))
        for x1, y1, x2, y2 in rounded:
            cv2.line(ink, (round(x1), round(y1)), (round(x2), round(y2)), (234, 240, 244), 2, cv2.LINE_AA)
        cv2.imwrite(str(OUT / f"lines-{seg_id}-{fmt}.png"), ink)


def main(preview):
    config = json.loads(CONFIG.read_text())
    for seg in config["segments"]:
        img = cv2.imread(str(ROOT / "public" / seg["image"].lstrip("/")))
        if img is None:
            sys.exit(f"Cannot read {seg['image']}")
        for fmt, size in config["formats"].items():
            w, h = size["width"], size["height"]
            photo = cover_crop(img, w, h, seg["focus"][fmt])
            gray = cv2.cvtColor(photo, cv2.COLOR_BGR2GRAY)
            lines = curate(merge_collinear(detect(gray)), w, h, seg["trace"][fmt])
            write_outputs(seg["projectId"], fmt, w, h, lines, photo, preview)
            print(f"{seg['projectId']} {fmt}: {len(lines)} lines")


if __name__ == "__main__":
    main(preview="--preview" in sys.argv)
```

- [ ] **Step 6: Run the tracer with previews**

Run: `reel/.venv/bin/python -I reel/tools/trace.py --preview`
Expected line counts, one per format: XO 58 / 32, OMG Burger 60 / 50, Haii Keii 60 / 50 (16:9 / 9:16). The output is deterministic for the pinned OpenCV version. If a count differs, check the venv's OpenCV version before changing any settings.

- [ ] **Step 7: Look at the previews**

Open `reel/out/lines-*.png` and `reel/out/trace-*.png`. Check that:
- The lines follow architecture: ceiling grids, wall junctions, shelving, counters, stairs.
- XO's glass door strip and textured counter front aren't traced on 16:9.
- XO's 9:16 crop shows the shelves, pendants and counter rather than the tree.

- [ ] **Step 8: Run the tests**

Run: `npx vitest run src/data/heroReel.test.js`
Expected: `Tests  18 passed (18)`.

- [ ] **Step 9: Commit**

```bash
git add .gitignore reel/tools/requirements.txt reel/tools/trace.py reel/traces src/data/heroReel.test.js
git commit -m "feat: trace curated architectural linework for the hero reel" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Remotion compositions

**Files:**
- Create: `reel/package.json`, `reel/package-lock.json` (generated), `reel/remotion.config.js`, `reel/src/index.js`, `reel/src/Root.jsx`, `reel/src/traces.js`, `reel/src/beats.js`, `reel/src/beats.test.js`, `reel/src/HeroReel.jsx`

**Interfaces:**
- Consumes: `REEL`, `REEL_FRAMES` from `src/data/heroReel.js` (Task 1); `reel/traces/*.json` (Task 2); images from `public/` (the public dir is set to `../public`).
- Produces: compositions `HeroReel16x9` (1920×1080) and `HeroReel9x16` (720×1280), 450 frames at 30 fps, with prop `{ format }`. `beats.js` exports `DRAW_END = 48`, `LINE_FRAMES = 18`, `EARLY_START = -9`, `linesOpacity(f)`, `photoOpacity(f)`, `cameraScale(f, maxScale)` and `lineProgress(f, k, n, start)`.

**Rendering model:** each segment renders only while its local frame `f = frame − index × 150` is in `[drawStart, 150)`. `drawStart` is 0 for segment 1 and −9 for the others. Nothing registers listeners or timers. Remotion renders each frame as a pure function of `useCurrentFrame()`.

- [ ] **Step 1: Create `reel/package.json`** (render scripts are added in Task 4)

```json
{
  "name": "barry-hero-reel",
  "private": true,
  "type": "module",
  "scripts": {
    "studio": "remotion studio"
  }
}
```

- [ ] **Step 2: Install the pinned packages**

```bash
npm --prefix reel install --save-exact remotion@4.0.529 @remotion/cli@4.0.529 react@19.2.6 react-dom@19.2.6
```

- [ ] **Step 3: Write the failing beat tests** `reel/src/beats.test.js`

```js
import { describe, it, expect } from 'vitest'
import { DRAW_END, EARLY_START, cameraScale, lineProgress, linesOpacity, photoOpacity } from './beats.js'

describe('segment beats (spec §2)', () => {
  it('starts on pure ground: no photo and no drawn line at frame 0', () => {
    expect(photoOpacity(0)).toBe(0)
    expect(lineProgress(0, 0, 60, 0)).toBe(0)
  })

  it('finishes drawing every line by 1.6s, including segments that start early', () => {
    for (const start of [0, EARLY_START]) {
      expect(lineProgress(DRAW_END, 0, 60, start)).toBe(1)
      expect(lineProgress(DRAW_END, 59, 60, start)).toBe(1)
    }
  })

  it('draws in order: the first line leads the last', () => {
    expect(lineProgress(12, 0, 60, 0)).toBeGreaterThan(lineProgress(12, 59, 60, 0))
  })

  it('raises the photo from 1.6s to 2.6s and holds it until 4.4s', () => {
    expect(photoOpacity(48)).toBe(0)
    expect(photoOpacity(78)).toBe(1)
    expect(photoOpacity(132)).toBe(1)
  })

  it('returns to pure ground by frame 147 so the loop seam is exact', () => {
    expect(photoOpacity(147)).toBe(0)
    expect(photoOpacity(149)).toBe(0)
    expect(linesOpacity(147)).toBe(0)
  })

  it('fades lines from 70% to 15% as the photo rises, then out by 4.4s', () => {
    expect(linesOpacity(0)).toBeCloseTo(0.7)
    expect(linesOpacity(78)).toBeCloseTo(0.15)
    expect(linesOpacity(132)).toBe(0)
  })

  it('pushes in to the segment cap and no further', () => {
    expect(cameraScale(0, 1.06)).toBe(1)
    expect(cameraScale(48, 1.06)).toBeCloseTo(1.02)
    expect(cameraScale(149, 1.04)).toBeCloseTo(1.04)
  })
})
```

- [ ] **Step 4: Run them to confirm they fail**

Run: `npx vitest run reel/src/beats.test.js`
Expected: FAIL with `Failed to resolve import "./beats.js"`.

- [ ] **Step 5: Create `reel/src/beats.js`**

```js
// Beat sheet for one 150-frame segment (spec §2). `f` is the frame relative to the segment start.
import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

export const DRAW_END = 48; // lines finish drawing at 1.6s
export const LINE_FRAMES = 18; // each line takes 0.6s to draw
export const EARLY_START = -9; // later segments begin drawing 0.3s before the previous ends

// Lines are 70% opaque while drawing, fade to 15% as the photo rises, then to 0 during the hold.
export const linesOpacity = (f) => interpolate(f, [48, 78, 132], [0.7, 0.15, 0], clamp);

// The photo rises under the lines, holds, then sinks back to the dark ground by frame 147,
// leaving frames 147–149 as pure ground so the loop seam is exact.
export const photoOpacity = (f) => interpolate(f, [48, 78, 132, 147], [0, 1, 1, 0], clamp);

export const cameraScale = (f, maxScale) =>
  interpolate(f, [0, 48, 132], [1, 1.02, maxScale], clamp);

// Drawing progress (0–1) of line `k` of `n`, staggered so all lines finish by DRAW_END.
export const lineProgress = (f, k, n, start) => {
  const span = DRAW_END - LINE_FRAMES - start;
  const lineStart = start + (n > 1 ? (k / (n - 1)) * span : 0);
  return interpolate(f, [lineStart, lineStart + LINE_FRAMES], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
};
```

- [ ] **Step 6: Run the beat tests**

Run: `npx vitest run reel/src/beats.test.js`
Expected: `Tests  7 passed (7)`.

- [ ] **Step 7: Create `reel/remotion.config.js`**

```js
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.js");
// Read project photos straight from the site's public folder.
Config.setPublicDir("../public");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
```

- [ ] **Step 8: Create `reel/src/index.js`, `reel/src/Root.jsx` and `reel/src/traces.js`**

Imports carry explicit extensions, because `"type": "module"` makes webpack require fully specified paths.

```js
import { registerRoot } from "remotion";
import { Root } from "./Root.jsx";

registerRoot(Root);
```

```jsx
import { Composition } from "remotion";
import { REEL, REEL_FRAMES } from "../../src/data/heroReel.js";
import { HeroReel } from "./HeroReel.jsx";

export const Root = () => (
  <>
    {Object.entries(REEL.formats).map(([format, size]) => (
      <Composition
        key={format}
        id={`HeroReel${format}`}
        component={HeroReel}
        width={size.width}
        height={size.height}
        fps={REEL.fps}
        durationInFrames={REEL_FRAMES}
        defaultProps={{ format }}
      />
    ))}
  </>
);
```

```js
import xo16 from "../traces/xo-juice-and-studio-16x9.json";
import xo9 from "../traces/xo-juice-and-studio-9x16.json";
import omg16 from "../traces/omg-burger-16x9.json";
import omg9 from "../traces/omg-burger-9x16.json";
import haii16 from "../traces/haii-keii-16x9.json";
import haii9 from "../traces/haii-keii-9x16.json";

// Curated linework from reel/tools/trace.py, keyed `${projectId}-${format}`.
export const TRACES = {
  "xo-juice-and-studio-16x9": xo16,
  "xo-juice-and-studio-9x16": xo9,
  "omg-burger-16x9": omg16,
  "omg-burger-9x16": omg9,
  "haii-keii-16x9": haii16,
  "haii-keii-9x16": haii9,
};
```

- [ ] **Step 9: Create `reel/src/HeroReel.jsx`**

```jsx
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { REEL } from "../../src/data/heroReel.js";
import { EARLY_START, cameraScale, lineProgress, linesOpacity, photoOpacity } from "./beats.js";
import { TRACES } from "./traces.js";

const GROUND = "#121212";
const LINE = "#f4f0ea";
const PHOTO_BRIGHTNESS = 0.75;

const Segment = ({ segment, index, format }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const f = frame - index * REEL.segmentFrames;
  // The first segment starts on the exact frame 0 so the loop seam is pure ground.
  const drawStart = index === 0 ? 0 : EARLY_START;
  if (f < drawStart || f >= REEL.segmentFrames) return null;

  const trace = TRACES[`${segment.projectId}-${format}`];
  const [fx, fy] = segment.focus[format];
  const strokeWidth = format === "16x9" ? 1.5 : 1.25;
  const n = trace.lines.length;

  return (
    <AbsoluteFill style={{ transform: `scale(${cameraScale(f, segment.maxScale)})` }}>
      <Img
        src={staticFile(segment.image.slice(1))}
        style={{
          width,
          height,
          objectFit: "cover",
          objectPosition: `${fx * 100}% ${fy * 100}%`,
          opacity: photoOpacity(f),
          filter: `brightness(${PHOTO_BRIGHTNESS})`,
        }}
      />
      <svg
        viewBox={`0 0 ${trace.width} ${trace.height}`}
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, opacity: linesOpacity(f) }}
      >
        {trace.lines.map(([x1, y1, x2, y2], k) => {
          const progress = lineProgress(f, k, n, drawStart);
          if (progress <= 0) return null;
          const length = Math.hypot(x2 - x1, y2 - y1);
          return (
            <line
              key={k}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={LINE}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={length}
              strokeDashoffset={length * (1 - progress)}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const HeroReel = ({ format }) => (
  <AbsoluteFill style={{ backgroundColor: GROUND }}>
    {REEL.segments.map((segment, index) => (
      <Segment key={segment.projectId} segment={segment} index={index} format={format} />
    ))}
  </AbsoluteFill>
);
```

- [ ] **Step 10: Render and look at key stills**

```bash
mkdir -p reel/out
for f in 0 24 63 100 145 175 263 449; do (cd reel && npx remotion still HeroReel16x9 out/s16-$f.png --frame=$f --log=error); done
```

Expected (the first run downloads Chrome Headless Shell):
- `s16-0` and `s16-449` are pure `#121212`.
- `s16-24`: lines are partly drawn.
- `s16-63`: the XO photo is half risen, with faint lines on its edges (view at full size).
- `s16-100`: the XO photo, held.
- `s16-145`: XO faded almost to ground, with OMG's first lines beginning.
- `s16-175`: OMG lines drawing.
- `s16-263`: the OMG photo.

- [ ] **Step 11: Full suite and lint**

Run: `npm test && npm run lint`
Expected: all pass (`Tests  123 passed`: Phase A's 98, plus 18 timeline/trace and 7 beat tests); lint 0 problems. `reel/node_modules` is ignored by ESLint's defaults.

- [ ] **Step 12: Commit**

```bash
git add reel/package.json reel/package-lock.json reel/remotion.config.js reel/src
git commit -m "feat: Remotion hero reel compositions" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Render, posters and automated checks

**Files:**
- Modify: `reel/package.json` (scripts)
- Create: `reel/tools/posters.py`, `reel/tools/check_renders.py`, `reel/README.md`, `public/video/hero-16x9.mp4`, `hero-16x9.webm`, `hero-9x16.mp4`, `hero-9x16.webm`, `hero-poster-16x9.webp`, `hero-poster-9x16.webp`

**Interfaces:**
- Consumes: the compositions from Task 3, and the venv from Task 2.
- Produces: the six media files under `public/video/` that Task 5 references by exact path.

- [ ] **Step 1: Write the check tool first** `reel/tools/check_renders.py`

Its `GRADIENT` constant mirrors the CSS that Task 5 adds, and Task 5's `layout.test.js` pins that CSS to the same values.

```python
"""Verify the rendered hero reel against the Phase B spec (§4 formats, §6 checks 2-5).

Run from the repo root after rendering:
    reel/.venv/bin/python -I reel/tools/check_renders.py

1. Renders sample stills of both compositions into reel/out/stills/ (PNG) for viewing.
2. Seam: frame 449 vs frame 0, mean absolute per-pixel difference < 1%.
3. Headline contrast: each still, composited with the page's hero gradient, keeps paper-coloured
   text at 85% opacity at >= 4.5:1 against the brightest 2% of the text region.
4. ffprobe: 15.0s +/- 1 frame, 30 fps, exact dimensions, no audio, yuv420p.
5. File sizes within budget, posters included.
Exits non-zero on any failure.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
REEL = ROOT / "reel"
VIDEO = ROOT / "public" / "video"
STILLS = REEL / "out" / "stills"

FRAMES = [0, 24, 48, 63, 78, 100, 132, 141, 147, 175, 263, 325, 413, 449]
FORMATS = {"16x9": (1920, 1080), "9x16": (720, 1280)}
# The page's hero gradient (bottom, middle, top opacity), mirrored from src/styles/home.css.
GRADIENT = {"16x9": (0.95, 0.65, 0.35), "9x16": (0.95, 0.75, 0.45)}
# Region behind the hero text, as fractions of the frame: x0, y0, x1, y1.
TEXT_REGION = {"16x9": (0.02, 0.30, 0.60, 0.95), "9x16": (0.04, 0.20, 0.96, 0.95)}
BUDGET = {
    "hero-16x9.mp4": 2.5e6, "hero-16x9.webm": 2.0e6,
    "hero-9x16.mp4": 1.2e6, "hero-9x16.webm": 1.2e6,
    "hero-poster-16x9.webp": 150e3, "hero-poster-9x16.webp": 80e3,
}
INK = np.array([18, 18, 18], dtype=float)
PAPER = np.array([244, 240, 234], dtype=float)

failures = []


def fail(msg):
    failures.append(msg)
    print("FAIL", msg)


def render_stills():
    STILLS.mkdir(parents=True, exist_ok=True)
    for fmt in FORMATS:
        for frame in FRAMES:
            out = STILLS / f"{fmt}-{frame:03d}.png"
            subprocess.run(
                ["npx", "remotion", "still", f"HeroReel{fmt}", str(out), f"--frame={frame}", "--log=error"],
                cwd=REEL, check=True,
            )


def luminance(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def hero_gradient_alpha(fmt, height):
    """Opacity of the page's `linear-gradient(to top, ...)` hero overlay for each row."""
    from_bottom = 1 - (np.arange(height) + 0.5) / height
    return np.interp(from_bottom, [0, 0.5, 1], GRADIENT[fmt])


def check_seam(fmt):
    a = np.asarray(Image.open(STILLS / f"{fmt}-449.png").convert("RGB"), dtype=float)
    b = np.asarray(Image.open(STILLS / f"{fmt}-000.png").convert("RGB"), dtype=float)
    diff = np.abs(a - b).mean() / 255
    print(f"seam {fmt}: {diff:.4%}")
    if diff >= 0.01:
        fail(f"seam {fmt} differs by {diff:.2%}")


def check_contrast(fmt):
    w, h = FORMATS[fmt]
    x0, y0, x1, y1 = TEXT_REGION[fmt]
    alpha = hero_gradient_alpha(fmt, h)[:, None, None]
    worst = None
    for frame in FRAMES:
        img = np.asarray(Image.open(STILLS / f"{fmt}-{frame:03d}.png").convert("RGB"), dtype=float)
        bg = img * (1 - alpha) + INK * alpha
        region = bg[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)].reshape(-1, 3)
        lum = luminance(region)
        bright = region[lum >= np.percentile(lum, 98)].mean(axis=0)
        text = 0.85 * PAPER + 0.15 * bright
        lt, lb = luminance(text), luminance(bright)
        ratio = (max(lt, lb) + 0.05) / (min(lt, lb) + 0.05)
        worst = ratio if worst is None else min(worst, ratio)
        if ratio < 4.5:
            fail(f"contrast {fmt} frame {frame}: {ratio:.2f}:1")
    print(f"contrast {fmt}: worst {worst:.2f}:1")


def probe(path):
    out = subprocess.run(
        ["npx", "remotion", "ffprobe", "-v", "error", "-print_format", "json",
         "-show_streams", "-show_format", str(path)],
        cwd=REEL, check=True, capture_output=True, text=True,
    ).stdout
    return json.loads(out[out.index("{"):])


def check_videos():
    for fmt, (w, h) in FORMATS.items():
        for ext in ("mp4", "webm"):
            path = VIDEO / f"hero-{fmt}.{ext}"
            info = probe(path)
            streams = info["streams"]
            video = [s for s in streams if s["codec_type"] == "video"]
            audio = [s for s in streams if s["codec_type"] == "audio"]
            duration = float(info["format"]["duration"])
            v = video[0]
            print(f"{path.name}: {v['codec_name']} {v['width']}x{v['height']} {v['r_frame_rate']} "
                  f"{v.get('pix_fmt')} {duration:.3f}s audio={len(audio)}")
            if (v["width"], v["height"]) != (w, h):
                fail(f"{path.name} is {v['width']}x{v['height']}")
            if v["r_frame_rate"] != "30/1":
                fail(f"{path.name} runs at {v['r_frame_rate']}")
            if abs(duration - 15.0) > 1 / 30:
                fail(f"{path.name} lasts {duration:.3f}s")
            if audio:
                fail(f"{path.name} has an audio stream")
            if v.get("pix_fmt") != "yuv420p":
                fail(f"{path.name} pixel format {v.get('pix_fmt')}")


def check_sizes():
    for name, budget in BUDGET.items():
        size = (VIDEO / name).stat().st_size
        print(f"{name}: {size / 1e6:.2f} MB (budget {budget / 1e6:.2f})")
        if size > budget:
            fail(f"{name} is {size} bytes, budget {int(budget)}")


if __name__ == "__main__":
    render_stills()
    for fmt in FORMATS:
        check_seam(fmt)
        check_contrast(fmt)
    check_videos()
    check_sizes()
    print("ALL CHECKS PASSED" if not failures else f"{len(failures)} CHECK(S) FAILED")
    sys.exit(1 if failures else 0)
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `reel/.venv/bin/python -I reel/tools/check_renders.py`
Expected: it renders the stills and prints the seam and contrast results. It then stops with `subprocess.CalledProcessError`, because the bundled `ffprobe` fails on the missing `public/video/hero-16x9.mp4`.

- [ ] **Step 3: Replace `reel/package.json` with the render scripts**

```json
{
  "name": "barry-hero-reel",
  "private": true,
  "type": "module",
  "scripts": {
    "studio": "remotion studio",
    "render:16x9:mp4": "remotion render HeroReel16x9 ../public/video/hero-16x9.mp4 --codec=h264 --crf=30 --x264-preset=slow --pixel-format=yuv420p --color-space=bt709 --muted",
    "render:16x9:webm": "remotion render HeroReel16x9 ../public/video/hero-16x9.webm --codec=vp9 --crf=46 --pixel-format=yuv420p --color-space=bt709 --muted",
    "render:9x16:mp4": "remotion render HeroReel9x16 ../public/video/hero-9x16.mp4 --codec=h264 --crf=30 --x264-preset=slow --pixel-format=yuv420p --color-space=bt709 --muted",
    "render:9x16:webm": "remotion render HeroReel9x16 ../public/video/hero-9x16.webm --codec=vp9 --crf=44 --pixel-format=yuv420p --color-space=bt709 --muted",
    "render": "npm run render:16x9:mp4 && npm run render:16x9:webm && npm run render:9x16:mp4 && npm run render:9x16:webm"
  },
  "dependencies": {
    "@remotion/cli": "4.0.529",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "remotion": "4.0.529"
  }
}
```

- [ ] **Step 4: Render all four videos**

Run: `npm --prefix reel run render`
Expected: four files in `public/video/`. This takes about 20s per H.264 file and a few minutes per VP9 file. If the command times out in a tool harness, run it in the background.

- [ ] **Step 5: Create `reel/tools/posters.py` and run it**

```python
"""Render the poster frame of each composition and save it as WebP within budget.

Run from the repo root:
    reel/.venv/bin/python -I reel/tools/posters.py
"""
import json
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
REEL = ROOT / "reel"
VIDEO = ROOT / "public" / "video"
POSTER_FRAME = 63
BUDGET = {"16x9": 150_000, "9x16": 80_000}


def main():
    formats = json.loads((ROOT / "src" / "data" / "heroReel.json").read_text())["formats"]
    VIDEO.mkdir(parents=True, exist_ok=True)
    (REEL / "out").mkdir(exist_ok=True)
    for fmt in formats:
        png = REEL / "out" / f"poster-{fmt}.png"
        subprocess.run(
            ["npx", "remotion", "still", f"HeroReel{fmt}", str(png), f"--frame={POSTER_FRAME}", "--log=error"],
            cwd=REEL, check=True,
        )
        out = VIDEO / f"hero-poster-{fmt}.webp"
        image = Image.open(png).convert("RGB")
        # Step quality down until the poster fits its budget.
        for quality in range(82, 39, -6):
            image.save(out, "WEBP", quality=quality, method=6)
            if out.stat().st_size <= BUDGET[fmt]:
                break
        print(f"{out.name}: {out.stat().st_size / 1000:.0f} KB at quality {quality}")


if __name__ == "__main__":
    main()
```

Run: `reel/.venv/bin/python -I reel/tools/posters.py`
Expected: `hero-poster-16x9.webp: ~100 KB at quality 82` and `hero-poster-9x16.webp: ~40 KB at quality 82`.

- [ ] **Step 6: Run the checks**

Run: `reel/.venv/bin/python -I reel/tools/check_renders.py`
Expected:
- **Seams:** `seam 16x9: 0.0000%` and `seam 9x16: 0.0000%`.
- **Contrast:** worst ≥ 4.5:1 for both formats (measured during planning: 4.66 and 5.25).
- **Videos:** all four files are `yuv420p`, 15.000s, 30/1, `audio=0`.
- **Sizes:** within budget (planning: 1.46 / 1.46 / 0.66 / 0.78 MB, posters 0.10 / 0.04 MB).
- **Last line:** `ALL CHECKS PASSED`.

- [ ] **Step 7: View the stills**

Open `reel/out/stills/16x9-*.png` and `9x16-*.png`. Check:
- Frame 0 and 449 are pure ground.
- 063: lines meet the photo.
- 100, 263 and 413: XO, OMG and Haii Keii held.
- 141: OMG's lines begin over XO's fade.
- On the 9:16 OMG frames (175–263), look for softness from the ~19% upscale. If it's clearly visible, note it in the ledger as the spec's offered follow-up (AI upscale). Don't change it here.

- [ ] **Step 8: Write `reel/README.md`**

```markdown
# Hero reel ("drawing becomes space")

Remotion project that renders the looping hero video for the Barry Design Studio site.
Spec: `docs/superpowers/specs/2026-10-12-hero-reel-phase-b-design.md`.

The timeline (projects, images, crop focus, trace settings) lives in `src/data/heroReel.json`,
shared with the site's hero badge.

## One-time setup

```bash
npm --prefix reel install
python3 -m venv reel/.venv
reel/.venv/bin/pip install -r reel/tools/requirements.txt
```

## Regenerate after changing the timeline or images

Run these from the repo root:

```bash
reel/.venv/bin/python -I reel/tools/trace.py --preview
npm --prefix reel run render
reel/.venv/bin/python -I reel/tools/posters.py
reel/.venv/bin/python -I reel/tools/check_renders.py
```

- `trace.py`: detects and curates the linework into `reel/traces/`. With `--preview`, it also writes overlays to `reel/out/`.
- `render`: writes the four videos to `public/video/`.
- `posters.py`: writes the two WebP posters to `public/video/`.
- `check_renders.py`: checks the loop seam, headline contrast, formats and file sizes.

Preview the reel in the browser with `npm --prefix reel run studio`.
```

- [ ] **Step 9: Commit**

```bash
git add reel/package.json reel/tools/posters.py reel/tools/check_renders.py reel/README.md public/video
git commit -m "feat: render hero reel videos and posters with automated checks" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Hero integration on the site

**Files:**
- Create: `src/lib/heroMedia.js`, `src/lib/heroMedia.test.js`, `src/App.hero.test.jsx`
- Modify: `src/test/setup.js`, `src/App.jsx` (imports; replace `Hero`), `src/styles/home.css`, `src/styles/base.css`, `src/styles/layout.test.js`
- Delete: `public/images/bg-hero-img.jpg`

**Interfaces:**
- Consumes: `REEL`, `segmentIndexAt` (Task 1); `findProject` (Phase A); the media files (Task 4).
- Produces:
  - `PHONE_QUERY = '(max-width: 768px)'`
  - `shouldShowPosterOnly({ matchMedia, connection }) -> boolean`
  - `heroSources(isPhone) -> [{ src, type }]` (WebM, then MP4)
  - Components `HeroMedia` and `HeroBadge({ segment })`
  - Classes `.bd-hero-poster`, `.bd-hero-video` (+ `.is-playing`), `.bd-hero-badge`, `.bd-hero-badge-label`, `.bd-hero-badge-title`

**Lifecycle:**
- **Sources:** chosen once in `useState`'s initializer at mount, so resizing doesn't swap files mid-play.
- **Playback:** `play()` is called once in a mount effect, and a rejection is swallowed (the poster stays).
- **Events:** `playing` and `timeupdate` are React props on the `<video>`, so React removes them on unmount. Nothing is registered on `window`.

- [ ] **Step 1: Replace `src/test/setup.js`** (adds the `matchMedia` and `play` stubs with a reset after each test)

```js
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// jsdom has no IntersectionObserver; ScrollReveal only needs observe/disconnect to exist.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = IntersectionObserverStub

// jsdom does not implement scrolling.
window.scrollTo = vi.fn()
Element.prototype.scrollIntoView = vi.fn()

// jsdom has neither matchMedia nor media playback. By default no media query matches and
// play() succeeds; tests override these with mockImplementation and they reset after each test.
const noQueryMatches = (query) => ({ matches: false, media: query })
const playSucceeds = () => Promise.resolve()
window.matchMedia = vi.fn(noQueryMatches)
window.HTMLMediaElement.prototype.play = vi.fn(playSucceeds)

afterEach(() => {
  cleanup()
  window.matchMedia.mockImplementation(noQueryMatches)
  window.HTMLMediaElement.prototype.play.mockImplementation(playSucceeds)
  delete navigator.connection
})
```

- [ ] **Step 2: Write the failing media-logic tests** `src/lib/heroMedia.test.js`

```js
import { describe, it, expect } from 'vitest'
import { heroSources, shouldShowPosterOnly } from './heroMedia'

// A matchMedia stand-in that matches only the queries listed.
const mediaMatching = (...queries) => (query) => ({ matches: queries.includes(query) })

describe('shouldShowPosterOnly', () => {
  it('plays the reel by default', () => {
    expect(shouldShowPosterOnly({ matchMedia: mediaMatching(), connection: undefined })).toBe(false)
  })

  it.each([
    ['reduced motion', { matchMedia: mediaMatching('(prefers-reduced-motion: reduce)') }],
    ['reduced data', { matchMedia: mediaMatching('(prefers-reduced-data: reduce)') }],
    ['Data Saver', { matchMedia: mediaMatching(), connection: { saveData: true } }],
    ['a 2g connection', { matchMedia: mediaMatching(), connection: { effectiveType: '2g' } }],
    ['a slow-2g connection', { matchMedia: mediaMatching(), connection: { effectiveType: 'slow-2g' } }],
  ])('shows only the poster for %s', (_, env) => {
    expect(shouldShowPosterOnly(env)).toBe(true)
  })

  it('still plays on a 3g or 4g connection without Data Saver', () => {
    expect(shouldShowPosterOnly({ matchMedia: mediaMatching(), connection: { effectiveType: '3g', saveData: false } })).toBe(false)
    expect(shouldShowPosterOnly({ matchMedia: mediaMatching(), connection: { effectiveType: '4g' } })).toBe(false)
  })
})

describe('heroSources', () => {
  it('serves the 16:9 cut, WebM first, on larger screens', () => {
    expect(heroSources(false)).toEqual([
      { src: '/video/hero-16x9.webm', type: 'video/webm' },
      { src: '/video/hero-16x9.mp4', type: 'video/mp4' },
    ])
  })

  it('serves the 9:16 cut on phones', () => {
    expect(heroSources(true).map((s) => s.src)).toEqual(['/video/hero-9x16.webm', '/video/hero-9x16.mp4'])
  })
})
```

- [ ] **Step 3: Run them to confirm they fail**

Run: `npx vitest run src/lib/heroMedia.test.js`
Expected: FAIL with `Failed to resolve import "./heroMedia"`.

- [ ] **Step 4: Create `src/lib/heroMedia.js`**

```js
// Which hero media a visitor gets: the looping reel, or only the still poster.

export const PHONE_QUERY = "(max-width: 768px)";

const SLOW_CONNECTIONS = ["slow-2g", "2g"];

// Poster only for reduced motion, reduced data (not yet shipped by browsers), Data Saver,
// or a very slow connection. In those cases no video file is requested at all.
export const shouldShowPosterOnly = ({ matchMedia, connection }) =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  matchMedia("(prefers-reduced-data: reduce)").matches ||
  connection?.saveData === true ||
  SLOW_CONNECTIONS.includes(connection?.effectiveType);

// WebM first (smaller), MP4 as the fallback. Phones get the vertical cut.
export const heroSources = (isPhone) => {
  const format = isPhone ? "9x16" : "16x9";
  return [
    { src: `/video/hero-${format}.webm`, type: "video/webm" },
    { src: `/video/hero-${format}.mp4`, type: "video/mp4" },
  ];
};
```

- [ ] **Step 5: Run them**

Run: `npx vitest run src/lib/heroMedia.test.js`
Expected: `Tests  9 passed (9)`.

- [ ] **Step 6: Write the failing hero tests** `src/App.hero.test.jsx`

```jsx
import { describe, it, expect } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import BarryDesignStudio from './App'

const renderHome = () => {
  window.history.pushState({}, '', '/')
  return render(<BarryDesignStudio />)
}

const heroVideo = () => document.querySelector('.bd-hero-video')
const badge = () => screen.getByRole('link', { name: /Now showing/ })

// Make window.matchMedia match only the given queries; the shared setup resets it after each test.
const matchOnly = (...queries) =>
  window.matchMedia.mockImplementation((query) => ({ matches: queries.includes(query), media: query }))

describe('hero media', () => {
  it('always renders the responsive poster', () => {
    renderHome()
    const picture = document.querySelector('.bd-hero-poster')
    expect(picture.querySelector('source')).toHaveAttribute('srcset', '/video/hero-poster-9x16.webp')
    expect(picture.querySelector('source')).toHaveAttribute('media', '(max-width: 768px)')
    expect(picture.querySelector('img')).toHaveAttribute('src', '/video/hero-poster-16x9.webp')
  })

  it('plays the muted 16:9 reel, WebM first, on larger screens', () => {
    renderHome()
    const video = heroVideo()
    expect(video.muted).toBe(true)
    expect(video.loop).toBe(true)
    expect([...video.querySelectorAll('source')].map((s) => s.getAttribute('src'))).toEqual([
      '/video/hero-16x9.webm',
      '/video/hero-16x9.mp4',
    ])
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('plays the 9:16 cut on phones', () => {
    matchOnly('(max-width: 768px)')
    renderHome()
    expect(heroVideo().querySelector('source')).toHaveAttribute('src', '/video/hero-9x16.webm')
  })

  it.each([
    ['reduced motion', () => matchOnly('(prefers-reduced-motion: reduce)')],
    ['Data Saver', () => { navigator.connection = { saveData: true } }],
    ['a 2g connection', () => { navigator.connection = { effectiveType: '2g' } }],
  ])('requests no video for %s', (_, arrange) => {
    arrange()
    renderHome()
    expect(heroVideo()).toBeNull()
    expect(document.querySelector('.bd-hero-poster img')).toBeInTheDocument()
  })

  it('reveals the video only once it is actually playing', () => {
    renderHome()
    expect(heroVideo()).not.toHaveClass('is-playing')
    fireEvent.playing(heroVideo())
    expect(heroVideo()).toHaveClass('is-playing')
  })

  it('keeps the poster when autoplay is refused', async () => {
    window.HTMLMediaElement.prototype.play.mockImplementationOnce(() => Promise.reject(new Error('NotAllowedError')))
    renderHome()
    await act(async () => {})
    expect(heroVideo()).not.toHaveClass('is-playing')
  })
})

describe('hero badge', () => {
  const at = (seconds) => {
    Object.defineProperty(heroVideo(), 'currentTime', { value: seconds, configurable: true })
    fireEvent.timeUpdate(heroVideo())
  }

  it('names XO first and links to it', () => {
    renderHome()
    expect(badge()).toHaveTextContent('XO JUICE AND STUDIO')
    expect(badge()).toHaveAttribute('href', '/project/xo-juice-and-studio')
  })

  it('follows the video through OMG Burger and Haii Keii, then back to XO', () => {
    renderHome()
    at(5.1)
    expect(badge()).toHaveAttribute('href', '/project/omg-burger')
    at(10.2)
    expect(badge()).toHaveAttribute('href', '/project/haii-keii')
    at(0.1)
    expect(badge()).toHaveAttribute('href', '/project/xo-juice-and-studio')
  })

  it('stays on XO when only the poster shows', () => {
    matchOnly('(prefers-reduced-motion: reduce)')
    renderHome()
    expect(badge()).toHaveAttribute('href', '/project/xo-juice-and-studio')
  })
})

describe('retired hero pieces', () => {
  it('no longer renders the stock background or the scroll label', () => {
    renderHome()
    expect(document.querySelector('.bd-hero-bg')).toBeNull()
    expect(document.querySelector('.bd-hero-scroll')).toBeNull()
  })
})
```

- [ ] **Step 7: Add the failing CSS guards** to the end of `src/styles/layout.test.js`

```js
describe('hero reel', () => {
  it('darkens the hero enough for text over the reel (stops mirrored in reel/tools/check_renders.py)', () => {
    expect(value('.bd-hero-gradient', 'background')).toBe(
      'linear-gradient(to top, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.65) 50%, rgba(18, 18, 18, 0.35) 100%)',
    )
    expect(value('.bd-hero-gradient', 'background', 'max-width: 768px')).toBe(
      'linear-gradient(to top, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.75) 50%, rgba(18, 18, 18, 0.45) 100%)',
    )
  })

  it('keeps the video hidden until it plays, then fades it in', () => {
    expect(value('.bd-hero-video', 'opacity')).toBe('0')
    expect(value('.bd-hero-video.is-playing', 'opacity')).toBe('1')
  })

  it('puts the badge bottom-right on desktop and top-right on phones, with a 44px target', () => {
    expect(value('.bd-hero-badge', 'bottom')).toBe('5rem')
    expect(value('.bd-hero-badge', 'top', 'max-width: 768px')).toBe('1rem')
    expect(px(value('.bd-hero-badge', 'min-height'))).toBeGreaterThanOrEqual(44)
  })
})
```

- [ ] **Step 8: Run them to confirm they fail**

Run: `npx vitest run src/App.hero.test.jsx src/styles/layout.test.js`
Expected: FAIL. The hero tests fail on the missing poster, video and badge (the "retired hero pieces" test fails because `.bd-hero-bg` still renders). All three new `hero reel` CSS tests fail.

- [ ] **Step 9: Edit `src/App.jsx`**

Find (1):

```jsx
import { swipeStep, wrapIndex } from "./lib/carousel";
```

Replace with:

```jsx
import { swipeStep, wrapIndex } from "./lib/carousel";
import { REEL, segmentIndexAt } from "./data/heroReel";
import { PHONE_QUERY, heroSources, shouldShowPosterOnly } from "./lib/heroMedia";
```

Find (2):

```jsx
function Hero() {
  return (
    <section className="bd-hero" aria-label="Hero">
      <div className="bd-hero-bg" aria-hidden="true" />
      <div className="bd-hero-gradient" aria-hidden="true" />
      <div className="bd-hero-noise" aria-hidden="true" />
      <div className="bd-hero-rule-v" aria-hidden="true" />

      <p className="bd-hero-scroll" aria-hidden="true">scroll</p>

      <p className="bd-hero-eyebrow">Houston, TX · Architectural Design Studio</p>

      <h1 className="bd-hero-h1">
        <span>WE CREATE</span>
        <span>INNOVATIVE</span>
        <span>SPACES</span>
      </h1>

      <p className="bd-hero-sub">
        By combining spatial precision with artistic sensibility, we help
        clients align, structure and elevate their built environments.
      </p>

      <div className="bd-hero-btns">
        <Link to="/#work" className="bd-btn-fill">
          View Projects
        </Link>
        <Link to="/about" className="bd-btn-ghost">
          Our Process
        </Link>
      </div>
    </section>
  );
}
```

Replace with:

```jsx
// Chosen once per visit: video sources, or null when only the poster should show.
const pickHeroSources = () =>
  shouldShowPosterOnly({ matchMedia: (q) => window.matchMedia(q), connection: navigator.connection })
    ? null
    : heroSources(window.matchMedia(PHONE_QUERY).matches);

// Names the space currently on screen and links to it. Re-keyed per project so it fades in.
function HeroBadge({ segment }) {
  const project = findProject(REEL.segments[segment].projectId);
  return (
    <Link key={project.id} to={`/project/${project.id}`} className="bd-hero-badge">
      <span className="bd-hero-badge-label">Now showing</span>
      <span className="bd-hero-badge-title">{project.title}</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}

function HeroMedia() {
  const videoRef = useRef(null);
  const [sources] = useState(pickHeroSources);
  const [isPlaying, setIsPlaying] = useState(false);
  const [segment, setSegment] = useState(0);

  useEffect(() => {
    // Autoplay can be refused (e.g. iOS Low Power Mode); the poster then simply stays.
    videoRef.current?.play()?.catch(() => {});
  }, []);

  return (
    <>
      <picture className="bd-hero-poster" aria-hidden="true">
        <source media={PHONE_QUERY} srcSet="/video/hero-poster-9x16.webp" />
        <img src="/video/hero-poster-16x9.webp" alt="" fetchPriority="high" />
      </picture>
      {sources && (
        <video
          ref={videoRef}
          className={`bd-hero-video ${isPlaying ? "is-playing" : ""}`}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          onPlaying={() => setIsPlaying(true)}
          onTimeUpdate={(e) => setSegment(segmentIndexAt(e.currentTarget.currentTime))}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}
      <HeroBadge segment={segment} />
    </>
  );
}

function Hero() {
  return (
    <section className="bd-hero" aria-label="Hero">
      <HeroMedia />
      <div className="bd-hero-gradient" aria-hidden="true" />
      <div className="bd-hero-noise" aria-hidden="true" />
      <div className="bd-hero-rule-v" aria-hidden="true" />

      <p className="bd-hero-eyebrow">Houston, TX · Architectural Design Studio</p>

      <h1 className="bd-hero-h1">
        <span>WE CREATE</span>
        <span>INNOVATIVE</span>
        <span>SPACES</span>
      </h1>

      <p className="bd-hero-sub">
        By combining spatial precision with artistic sensibility, we help
        clients align, structure and elevate their built environments.
      </p>

      <div className="bd-hero-btns">
        <Link to="/#work" className="bd-btn-fill">
          View Projects
        </Link>
        <Link to="/about" className="bd-btn-ghost">
          Our Process
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 10: Edit `src/styles/home.css`**

Find (1):

```css
.bd-hero-bg {
  position: absolute; inset: 0;
  background-image: url("/images/bg-hero-img.jpg");
  background-size: cover; background-position: center 40%; background-repeat: no-repeat;
  transform: scale(1.02);
  filter: brightness(0.65) contrast(1.05) saturate(0.9);
}
.bd-hero-gradient {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to top, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.4) 50%, rgba(18, 18, 18, 0.1) 100%);
}
```

Replace with:

```css
/* Poster shows at once; the reel fades in over it once it is actually playing. */
.bd-hero-poster,
.bd-hero-poster img,
.bd-hero-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.bd-hero-video { opacity: 0; transition: opacity 0.6s ease; }
.bd-hero-video.is-playing { opacity: 1; }

/* Stops measured against the reel's brightest frames for >= 4.5:1 text contrast
   (reel/tools/check_renders.py mirrors these values). */
.bd-hero-gradient {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to top, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.65) 50%, rgba(18, 18, 18, 0.35) 100%);
}
```

Find (2):

```css
.bd-hero-scroll {
  position: absolute; bottom: 5rem; right: calc(var(--gutter) + 0.15rem);
  font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(244, 240, 234, 0.8); writing-mode: vertical-lr;
}
```

Replace with:

```css

/* Names the space on screen; re-keyed per project so each name fades in. */
.bd-hero-badge {
  position: absolute; right: var(--gutter); bottom: 5rem; z-index: 3;
  display: inline-flex; align-items: center; gap: 0.6rem;
  min-height: 44px; padding: 0 1rem;
  font-size: 0.8rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--paper); text-decoration: none;
  background: rgba(18, 18, 18, 0.6);
  border: 1px solid rgba(244, 240, 234, 0.3);
  animation: bdFadeIn 0.4s ease both;
  transition: border-color 0.2s;
}
.bd-hero-badge:hover { border-color: var(--paper); }
.bd-hero-badge-label { color: rgba(244, 240, 234, 0.8); }
```

Find (3):

```css
  .bd-hero-rule-v,
  .bd-hero-scroll { display: none; }
```

Replace with:

```css
  .bd-hero-rule-v { display: none; }
  .bd-hero-badge { top: 1rem; bottom: auto; }
  .bd-hero-gradient {
    background: linear-gradient(to top, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.75) 50%, rgba(18, 18, 18, 0.45) 100%);
  }
```

- [ ] **Step 11: Edit `src/styles/base.css`** (the reduced-motion block no longer needs the retired `.bd-hero-bg`)

Find:

```css
  .bd-proj-panel-bg,
  .bd-megamenu-preview-img,
  .bd-hero-bg {
    transform: none !important;
  }
```

Replace with:

```css
  .bd-proj-panel-bg,
  .bd-megamenu-preview-img {
    transform: none !important;
  }
```

- [ ] **Step 12: Delete the retired stock image**

```bash
git rm public/images/bg-hero-img.jpg
grep -rn "bg-hero-img\|bd-hero-bg\|bd-hero-scroll" src index.html --include=*.js --include=*.jsx --include=*.css --include=*.html | grep -v backup-
```

Expected: no output from the grep.

- [ ] **Step 13: Full suite, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: `Tests  147 passed`, lint 0 problems, and the build succeeds with `dist/video/` holding the six media files.

- [ ] **Step 14: Commit**

```bash
git add -A src public/images/bg-hero-img.jpg
git commit -m "feat: hero reel with responsive poster, low-data fallback and synced project badge" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Browser verification

**Files:** none (verification only).

- [ ] **Step 1: Serve the production build**

Run: `npm run build`, then start the `preview` entry in `.claude/launch.json` (or run `npm run preview`). Open http://localhost:4173.

- [ ] **Step 2: Desktop playback and badge (1440×900)**

Run in the page:

```js
const v = document.querySelector('.bd-hero-video');
await v.play().catch(() => {});
await new Promise((r) => setTimeout(r, 1500));
const seen = [];
for (const t of [4.8, 5.4, 9.8, 10.4, 14.8]) {
  v.currentTime = t;
  await new Promise((r) => v.addEventListener('seeked', r, { once: true }));
  await new Promise((r) => setTimeout(r, 350));
  seen.push(`${t}s -> ${document.querySelector('.bd-hero-badge').getAttribute('href')}`);
}
({ src: v.currentSrc, playing: v.classList.contains('is-playing'), duration: v.duration, seen });
```

Expected:
- `src` ends in `/video/hero-16x9.webm`, `playing: true`, `duration: 15`.
- `seen` maps to XO, OMG, OMG, Haii Keii, Haii Keii in order.

Then seek to 14.6, call `play()`, and sample `currentTime` every 300ms. It should wrap to about 0, with the badge back on XO. A hidden pane may stall playback afterwards; that's expected.

- [ ] **Step 3: Phone (mobile preset, 375×812)**

Reload `/`, call `play()`, then check:
- `currentSrc` ends in `/video/hero-9x16.webm`.
- The poster `img.currentSrc` ends in `hero-poster-9x16.webp`.
- The badge's top is about 87px, its right inset about 19px, and its height 44px.
- `document.documentElement.scrollWidth <= innerWidth`.

Take a screenshot. You should see the vertical linework and the badge above the eyebrow.

- [ ] **Step 4: Poster-only paths in a real browser**

On `/about`, run:

```js
Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true });
history.pushState({}, '', '/'); dispatchEvent(new PopStateEvent('popstate'));
await new Promise((r) => setTimeout(r, 500));
({ video: !!document.querySelector('.bd-hero-video'), poster: document.querySelector('.bd-hero-poster img').currentSrc });
```

Expected: `video: false` and the poster URL. Repeat with `window.matchMedia = (q) => ({ matches: q === '(prefers-reduced-motion: reduce)', media: q })` in place of the connection override. Expected again: `video: false`.

The pane can't truly emulate reduced motion. Ask the user to confirm once with macOS **Reduce motion** turned on.

- [ ] **Step 5: Phase A regression check**

Run `scripts/verify-page.js`, then `await window.verifyPage()` on `/` at 1440, 768 and 375 widths.
Expected:
- `overflow: false`, `placeholder: false`.
- `smallText`, `smallTargets` and `brokenImages` all empty.
- `brokenImages` covers the poster too, so it must be served.

- [ ] **Step 6: Final checks**

Run: `npm test && npm run lint && npm run build`
Expected: all green. Reset the viewport and stop the preview.

---

## Spec coverage

| Spec section | Task |
|---|---|
| §1 Concept, curated vector linework | 2, 3 |
| §2 Beat sheet, seam, segment order | 1 (timing), 3 (beats + tests), 4 (seam check) |
| §2 Badge | 5 (component, CSS, tests), 6 (browser) |
| §3 Sound (none) | 3/4 (`--muted`), 4 (`audio=0` check) |
| §4 Formats, budgets, poster frame 63 | 4 |
| §4 Page behaviour (poster, sources, fallbacks, retired image) | 5, 6 |
| §4 Project structure (`reel/`, shared timeline, traces) | 1, 2, 3 |
| §5 Assumptions (line style, brightness, upscale note, venv, licence, pins) | 2, 3, 4 |
| §6 Verification 1–6 | 1, 3, 5 (unit), 4 (stills, seam, contrast, ffprobe, sizes), 6 (browser) |
