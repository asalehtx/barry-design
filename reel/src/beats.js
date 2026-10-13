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
