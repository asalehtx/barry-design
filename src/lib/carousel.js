// Keep an index inside [0, length). Returns 0 for an empty list.
export const wrapIndex = (index, length) =>
  length > 0 ? ((index % length) + length) % length : 0;

// Turn a touch gesture between two {x, y} points into a step: swipe left -> 1 (next),
// swipe right -> -1 (previous). Returns 0 when the horizontal travel is under `threshold`
// pixels or not clearly greater than the vertical travel (a page scroll that drifts sideways).
export const swipeStep = (start, end, threshold = 50) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
};
