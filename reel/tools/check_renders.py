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
