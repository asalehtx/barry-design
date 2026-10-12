// Single source of project data for the site (and for the Phase B Remotion reel).
// A project with no photos has `gallery: []` and `img: null`.
// `procurement` stays false until Yousef confirms the studio handled procurement on that job.

export const ALL_PROJECTS = "All Projects";

export const CATEGORIES = [
  "Health & Wellness",
  "Restaurants & Bars",
  "Nightlife",
  "Hospitality",
  "Retail",
  "Institutional",
];

export const PROCUREMENT_COPY =
  "Beyond the initial spatial planning and concept generation, Barry Design Studio managed the complete procurement and installation process, ensuring every fixture, finish, and piece of furniture aligned perfectly with the design intent.";

const gallery = (folder, count) =>
  Array.from({ length: count }, (_, i) => `/images/projects/${folder}/${folder}-${i + 1}.jpg`);

export const PROJECTS = [
  {
    id: "xo-juice-and-studio",
    category: "Health & Wellness",
    title: "XO JUICE AND STUDIO",
    year: "2026",
    location: "3201 N Shepherd Dr. #109 Houston, TX 77018",
    area: "1,500 sf.",
    tags: ["Interior Design", "Custom Fixtures", "Space Planning"],
    img: "/images/projects/xo/xo-1.jpg",
    gallery: gallery("xo", 5),
    alt: "XO Juice Bar and Pilates Studio high-end interior rendering",
    desc: "A vibrant 1,500 sq. ft. health and wellness hub combining a premium juice bar with a dedicated pilates reformer studio. The design features a signature natural tree and custom light fixtures that embody the brand identity, establishing a fluid layout where circulation gracefully defines user interaction.",
    procurement: false,
  },
  {
    id: "omg-burger",
    category: "Restaurants & Bars",
    title: "OMG BURGER",
    year: "2026",
    location: "5333 Westheimer Rd, Houston, TX 77056",
    area: "3,500 sf.",
    tags: ["Renovation", "F&B Design", "Modernization"],
    img: "/images/projects/omg-burger/omg-burger-1.jpg",
    gallery: gallery("omg-burger", 5),
    alt: "OMG Burger restaurant interior on Westheimer Rd",
    desc: "A sweeping 3,500 sq. ft. renovation project on Westheimer Road in the Galleria area, repurposing an office building's ground floor into a restaurant and bar. The modernization features a striking, centrally placed rectangular communal table paired with an intuitive counter-service flow and a high-capacity commercial kitchen.",
    procurement: false,
  },
  {
    id: "greek-orthodox-cathedral",
    category: "Institutional",
    title: "GREEK ORTHODOX CATHEDRAL",
    year: "2026",
    location: "3511 Yoakum Blvd, Houston, TX 77006",
    area: "Pending Verification",
    tags: ["Architecture", "Cultural", "Houston"],
    img: null,
    gallery: [],
    alt: "Greek Orthodox Cathedral on Yoakum Blvd",
    desc: "Located on Yoakum Blvd in Houston, this landmark project focuses on preserving rich cultural heritage while enhancing structural functionality and spatial community integration. (Full text details pending verification).",
    procurement: false,
  },
  {
    id: "cyclone-anayas",
    category: "Restaurants & Bars",
    title: "CYCLONE ANAYAS",
    year: "2026",
    location: "3736 Westheimer Rd, Houston, TX 77027",
    area: "5,000 sf.",
    tags: ["High-End Design", "Tex-Mex", "River Oaks"],
    img: "/images/projects/cyclone-anayas/cyclone-anayas-1.jpg",
    gallery: gallery("cyclone-anayas", 4),
    alt: "Cyclone Anayas Restaurant interior",
    desc: "A sophisticated, new 5,000 sq. ft. Tex-Mex restaurant and bar situated in the exclusive River Oaks area. Built on the design ethos that 'every detail matters,' the space leans on custom luxury finishes to deliver an elevated, premium hospitality experience.",
    procurement: false,
  },
  {
    id: "haii-keii",
    category: "Restaurants & Bars",
    title: "HAII KEII",
    year: "2026",
    location: "3300 Kirby Dr Suite 9-A, Houston, TX 77098",
    area: "3,800 sf.",
    tags: ["Hospitality", "Sushi Restaurant", "Millwork"],
    img: "/images/projects/haii-keii/haii-keii-1.jpg",
    gallery: gallery("haii-keii", 5),
    alt: "Haii Keii Sushi Restaurant interior on Kirby Dr",
    desc: "A stunning 3,800 sq. ft. high-end sushi restaurant located on Kirby Drive. The architectural vision brings a complete reimagining of modern elements, relying heavily on seamless spatial curvatures, warm ambient light modeling, and sophisticated materiality.",
    procurement: false,
  },
  {
    id: "flying-saucer-draught",
    category: "Restaurants & Bars",
    title: "FLYING SAUCER DRAUGHT",
    year: "2026",
    location: "DFW International Airport",
    area: "6,000 sf.",
    tags: ["Airport Retail", "Commercial", "DFW"],
    img: null,
    gallery: [],
    alt: "Flying Saucer Draught DFW Airport interior",
    desc: "An expansive 6,000 sq. ft. commercial restaurant and bar layout designed specifically for the fast-paced environment of the Dallas-Fort Worth International Airport (DFW). Optimizes operational efficiency without compromising on aesthetics.",
    procurement: false,
  },
  {
    id: "bauhaus-houston",
    category: "Nightlife",
    title: "BAUHAUS HOUSTON",
    year: "2023",
    location: "1803 Pease St, Houston, TX 77003",
    area: "4,000 sf.",
    tags: ["Club Design", "Lighting", "Acoustics"],
    img: "/images/projects/bauhaus/bauhaus-1.jpg",
    gallery: gallery("bauhaus", 4),
    alt: "Bauhaus Houston Nightclub interior on Pease St",
    desc: "A bold exploration of mood and shadow located at 1803 Pease St. For this 4,000 sq. ft. venue, our design strategy prioritized cutting-edge lighting design integrations, acoustic engineering, and an intuitive layout optimized for crowd flow.",
    procurement: false,
  },
  {
    id: "doubletree-by-hilton",
    category: "Hospitality",
    title: "DOUBLETREE BY HILTON",
    year: "2026",
    location: "12801 Northwest Fwy, Houston, TX 77040",
    area: "7,800 sf.",
    tags: ["Hotel Design", "Commercial Lounge", "Lobby"],
    img: null,
    gallery: [],
    alt: "Doubletree by Hilton interior spaces",
    desc: "A comprehensive 7,800 sq. ft. hospitality design package executing a full spatial transformation. Focuses heavily on traffic routing, premium FF&E selections, and timeless aesthetic details that match standard brand benchmarks.",
    procurement: false,
  },
  {
    id: "airport-retail-spaces",
    category: "Retail",
    title: "AIRPORT RETAIL SPACES",
    year: "2026",
    location: "MSY - Louis Armstrong New Orleans International Airport",
    area: "Varies",
    tags: ["Commercial", "Retail Design", "Aviation"],
    img: null,
    gallery: [],
    alt: "Louis Armstrong New Orleans International Airport retail spaces",
    desc: "A dynamic suite of retail builds located throughout the Louis Armstrong New Orleans International Airport (MSY). Spaces vary in footprint but remain strictly unified through smart programmatic design, high durability finishes, and specialized point-of-sale layout structures.",
    procurement: false,
  },
];

export const SERVICES = [
  {
    num: "01",
    title: "CONCEPT & STRATEGY",
    desc: "Space programming, mood development, material direction — the full creative brief before a single line is drawn.",
  },
  {
    num: "02",
    title: "DESIGN & DOCUMENTATION",
    desc: "Construction documents, FF&E specifications, finish schedules, and permit-ready drawing sets.",
  },
  {
    num: "03",
    title: "PROCUREMENT",
    desc: "Vendor sourcing, trade pricing, and project management through delivery and installation.",
  },
  {
    num: "04",
    title: "BRAND ALIGNMENT",
    desc: "Ensuring every spatial decision reinforces your brand identity — from signage to materiality to lighting mood.",
  },
];

export const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const hasPhotos = (project) => project.gallery.length > 0;

// Zero-based list position -> "01", "02", ...
export const formatNum = (index) => String(index + 1).padStart(2, "0");

export const filterByCategory = (projects, category) =>
  category === ALL_PROJECTS ? projects : projects.filter((p) => p.category === category);

export const splitByPhotos = (projects) => ({
  photographed: projects.filter(hasPhotos),
  inProgress: projects.filter((p) => !hasPhotos(p)),
});

export const findProject = (id) => PROJECTS.find((p) => p.id === id) ?? null;

export const findCategoryBySlug = (slug) =>
  CATEGORIES.find((c) => slugify(c) === slug) ?? null;

// The project after `id` in list order, wrapping to the first.
// Returns null when `id` is unknown or the list has no other project.
export const nextProject = (projects, id) => {
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1 || projects.length < 2) return null;
  return projects[(i + 1) % projects.length];
};
