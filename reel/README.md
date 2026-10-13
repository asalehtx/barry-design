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
caffeinate -i npm --prefix reel run render
reel/.venv/bin/python -I reel/tools/posters.py
reel/.venv/bin/python -I reel/tools/check_renders.py
```

- `trace.py`: detects and curates the linework into `reel/traces/`. With `--preview`, it also writes overlays to `reel/out/`.
- `render`: writes the four videos to `public/video/`. `caffeinate -i` keeps the Mac awake: if it sleeps mid-render, headless Chrome loses its session and the render hangs, logging `Page.bringToFront: Session closed`.
- `posters.py`: writes the two WebP posters to `public/video/`.
- `check_renders.py`: checks the loop seam (in stills and in frames decoded from each shipped video), headline contrast, codecs, MP4 fast-start, formats and file sizes.

Each trace JSON records the image, focus and settings it was made from, so the site's test suite fails if `heroReel.json` changes without re-running `trace.py`. The tools' own unit tests run with `reel/.venv/bin/python -I reel/tools/test_tools.py`.

Preview the reel in the browser with `npm --prefix reel run studio`.
