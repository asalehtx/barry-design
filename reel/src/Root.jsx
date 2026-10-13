import { Composition } from "remotion";
import { REEL, REEL_FRAMES } from "../../src/data/heroReel.js";
import { HeroReel } from "./HeroReel.jsx";

export const Root = () => (
  <>
    {Object.entries(REEL.formats).map(([format, size]) => (
      <Composition
        key={format}
        id={`HeroReel${format}`}
        component={HeroReel}
        width={size.width}
        height={size.height}
        fps={REEL.fps}
        durationInFrames={REEL_FRAMES}
        defaultProps={{ format }}
      />
    ))}
  </>
);
