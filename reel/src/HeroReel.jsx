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
