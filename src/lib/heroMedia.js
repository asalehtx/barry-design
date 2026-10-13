// Which hero media a visitor gets: the looping reel, or only the still poster.

export const PHONE_QUERY = "(max-width: 768px)";

const SLOW_CONNECTIONS = ["slow-2g", "2g"];

// Poster only for reduced motion, reduced data (not yet shipped by browsers), Data Saver,
// or a very slow connection. In those cases no video file is requested at all.
export const shouldShowPosterOnly = ({ matchMedia, connection }) =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  matchMedia("(prefers-reduced-data: reduce)").matches ||
  connection?.saveData === true ||
  SLOW_CONNECTIONS.includes(connection?.effectiveType);

// WebM first (smaller), MP4 as the fallback. Phones get the vertical cut.
export const heroSources = (isPhone) => {
  const format = isPhone ? "9x16" : "16x9";
  return [
    { src: `/video/hero-${format}.webm`, type: "video/webm" },
    { src: `/video/hero-${format}.mp4`, type: "video/mp4" },
  ];
};
