"""Unit tests for the hero-reel tools. Run from the repo root:
    reel/.venv/bin/python -I reel/tools/test_tools.py
"""
import struct
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from check_renders import top_level_atoms  # noqa: E402
from trace import clip_to_frame  # noqa: E402


class ClipToFrame(unittest.TestCase):
    def test_leaves_a_line_inside_the_frame_alone(self):
        self.assertEqual(clip_to_frame((10, 20, 90, 80), 100, 100), (10, 20, 90, 80))

    def test_cuts_a_horizontal_overrun_at_both_edges(self):
        self.assertEqual(clip_to_frame((-10, 50, 110, 50), 100, 100), (0, 50, 100, 50))

    def test_keeps_the_slope_when_cutting(self):
        # Clamping each axis separately would give (0, 0, 80, 100) and bend the line.
        x1, y1, x2, y2 = clip_to_frame((-20, 0, 80, 100), 100, 100)
        self.assertAlmostEqual(x1, 0)
        self.assertAlmostEqual(y1, 20)
        self.assertEqual((x2, y2), (80, 100))

    def test_drops_a_line_entirely_outside_the_frame(self):
        self.assertIsNone(clip_to_frame((-30, -5, -10, 50), 100, 100))


def atom(kind, payload=b""):
    return struct.pack(">I", 8 + len(payload)) + kind + payload


class TopLevelAtoms(unittest.TestCase):
    def test_lists_atoms_in_file_order(self):
        data = atom(b"ftyp", b"isom") + atom(b"moov", b"x" * 10) + atom(b"mdat", b"y" * 20)
        self.assertEqual(top_level_atoms(data), ["ftyp", "moov", "mdat"])

    def test_follows_64_bit_sizes(self):
        big = struct.pack(">I", 1) + b"mdat" + struct.pack(">Q", 16 + 4) + b"zzzz"
        self.assertEqual(top_level_atoms(atom(b"ftyp") + big + atom(b"moov")), ["ftyp", "mdat", "moov"])


if __name__ == "__main__":
    unittest.main()
