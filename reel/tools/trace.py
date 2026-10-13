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
    kept = drop_near_duplicates(kept)  # drafting order: structure first, detail last
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
