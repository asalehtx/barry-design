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
