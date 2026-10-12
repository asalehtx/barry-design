// Keep an index inside [0, length). Returns 0 for an empty list.
export const wrapIndex = (index, length) =>
  length > 0 ? ((index % length) + length) % length : 0;

// Turn a horizontal swipe into a step: swipe left -> 1 (next), swipe right -> -1 (previous),
// anything shorter than `threshold` pixels -> 0.
export const swipeStep = (startX, endX, threshold = 50) => {
  const delta = endX - startX;
  if (Math.abs(delta) < threshold) return 0;
  return delta < 0 ? 1 : -1;
};
