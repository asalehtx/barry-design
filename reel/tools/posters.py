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
