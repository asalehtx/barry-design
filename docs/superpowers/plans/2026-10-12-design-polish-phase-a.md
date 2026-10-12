# Barry Design Studio — Phase A Design Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Barry Design Studio site sharper, legible to WCAG AA, and properly usable on phones, without changing its identity, and leave one clean project-data source for the Phase B Remotion reel.

**Architecture:** Plain React 19 + Vite SPA. Project data moves out of `src/App.jsx` into `src/data/projects.js` (pure helpers, unit-tested). Components stay in `src/App.jsx`, with a few gaining named exports so they can be tested with Testing Library. `src/App.css` is replaced by per-area stylesheets under `src/styles/`, guarded by Vitest tests that parse the CSS and check tokens, contrast, minimum font sizes, tap targets and layout rules.

**Tech Stack:** React 19.2, react-router-dom 7.15, Vite 8, ESLint 10; adds Vitest 5.0.2, jsdom 29.1.1, Testing Library (react 16.3.3, dom 10.4.2, user-event 14.6.7, jest-dom 6.10.0).

**Spec:** `docs/superpowers/specs/2026-10-12-design-polish-phase-a-design.md`

**Preconditions** (each checked on 2026-10-12):
- Node `v24.14.1`, npm `11.11.0` (`node -v`, `npm -v`). jsdom 30.x needs Node ≥ 24.15, so this plan pins jsdom **29.1.1**.
- git `2.54.0` (`git --version`). The project is **not yet a git repository**; Task 1 creates it.
- Network access to the npm registry for the six dev packages in Task 1 (`npm view vitest@5.0.2 version` returns `5.0.2`).
- The Claude desktop **browser pane** (or any Chromium browser) for Task 7's visual and keyboard checks. Fallback: run `scripts/verify-page.js` from Chrome DevTools against `npm run preview`.
- No credentials, services or API keys are needed.

## Global Constraints

Copied from the spec; every task implicitly includes them.

- Keep Bebas Neue + DM Sans, the warm paper palette and the current page structure.
- Tokens, exact values: `--paper #f4f0ea`, `--paper-2 #ebe5dd`, `--ink #121212`, `--ink-2 #4a4a4a`, `--ink-3 #646464`, `--gold #a38757`, `--gold-text #735d30`, `--nav-h 88px` (72px ≤ 768px).
- `--gold` is never used for text under 24px; small gold text uses `--gold-text`.
- Minimum rendered text size 12px (0.8rem at the 15px root).
- Tap targets ≥ 44px on touch layouts; no horizontal scroll at 375px.
- Visible `:focus-visible` ring: 2px `--gold`, 3px offset.
- `prefers-reduced-motion: reduce` disables reveal/entrance animations and hover scale transforms.
- No "photos coming soon" placeholder anywhere. `procurement` defaults to `false` on all nine projects.
- Out of scope: hero image/concept (Phase B), Remotion/video, new fonts or palette, contact-form backend (stays mailto), social links (stay hidden).
- `npm run build` and `npm run lint` pass with zero errors at the end.

## Review Focus

Inputs and conditions the spec implies but does not spell out, most likely to bite first. Each has a test in the task that owns the code.

1. **Following "Next project" from a project where the carousel was advanced**: the new project must open on image 1, not carry over the old index. Test: Task 4, `resets the carousel to the first image when following the next-project link`.
2. **A filter that matches nothing**: shows a one-line empty state, not a blank gap. Test: Task 3, `shows an empty state when a filter matches nothing`.
3. **Unknown `/project/:id` or `/category/:slug`** (old links, typos): renders a not-found heading, no crash. Tests: Task 3 `shows a not-found heading for an unknown slug`, Task 4 `shows not-found for an unknown id`, Task 2 `findProject returns null for unknown ids`.
4. **Short, accidental horizontal movement while scrolling a phone**: must not change the image. Test: Task 4, `moves on a swipe of 50px or more and ignores shorter ones`, plus Task 4's `swipeStep` threshold tests.
5. **Keyboard users in the Work megamenu**: tabbing through category links must update the preview, as hovering does. Test: Task 5, `updates the preview when a category link gets keyboard focus`.

## Plan-level decisions (beyond the spec, for the reviewer)

- **CSS split into `src/styles/*.css`** (tokens, base, nav, home, project, about, contact) instead of editing the 1,100-line `App.css` in place. Same plain CSS, smaller files the tests can read.
- **Google Fonts move from a CSS `@import` to `<link>` tags in `index.html`.** The CSS `@import url(...)` must be first in the bundle, which per-area files can't guarantee; `<link>` with preconnect also loads faster.
- **ESLint ignores `src/backup-*.jsx`.** The backup file isn't imported anywhere; it stays in git history after Task 1.
- **Small fixes found while implementing:** hamburger "X" offsets corrected from 7px to 3.5px (the bars now actually cross); the skip link now targets `#main` instead of `#work`; the closed mobile menu is `visibility: hidden` so its links aren't tabbable; `bdFadeIn` keyframes (referenced but never defined) are added; every project row now gets its bottom border (the old `:last-child` selector matched every row); the vertical "scroll" label is hidden on phones, where it overlapped the hero buttons.

## File map

| File | Responsibility | Task |
|---|---|---|
| `package.json`, `vite.config.js`, `eslint.config.js` | test script, Vitest config, test-file lint globals | 1 |
| `src/test/setup.js`, `src/test/harness.test.js` | jsdom stubs, jest-dom matchers; harness sanity test | 1 |
| `src/data/projects.js` + `.test.js` | project/service data and pure helpers | 2 |
| `src/test/render.jsx` | `renderAt(ui, path)` router test helper | 3 |
| `src/App.work.test.jsx` | home work list, filters, category page | 3 |
| `src/lib/carousel.js` + `.test.js` | `wrapIndex`, `swipeStep` | 4 |
| `src/App.project.test.jsx` | project page: carousel, procurement, next project | 4 |
| `src/App.shell.test.jsx` | nav megamenu and About page | 5 |
| `src/App.jsx` | components (modified in 3, 4, 5, 6) | 3–6 |
| `src/test/css.js` | CSS rule parser, contrast and font-size helpers | 6 |
| `src/styles/*.css`, `src/styles/tokens.test.js`, `src/styles/layout.test.js` | stylesheets and their guards | 6 |
| `index.html` | font `<link>`s | 6 |
| `src/App.css` | deleted | 6 |
| `scripts/verify-page.js` | in-browser verification script | 7 |

**How to edit `src/App.jsx` in Tasks 3–5:** each step names a top-level block by its first line (for example `function Work() {`). Replace everything from that line through the next line that is exactly `}` (or `];` for an array constant) with the code given. Leave everything else untouched.

---

### Task 1: Git baseline and test harness

**Files:**
- Create: `src/test/setup.js`, `src/test/harness.test.js`
- Modify: `package.json` (scripts, devDependencies), `vite.config.js`, `eslint.config.js`

**Interfaces:**
- Produces: `npm test` (runs `vitest run` once); a jsdom test environment with `IntersectionObserver`, `window.scrollTo` and `Element.prototype.scrollIntoView` stubbed and jest-dom matchers (`toBeInTheDocument`, `toHaveTextContent`, `toHaveAttribute`) registered.

- [ ] **Step 1: Create the repository and commit the current site as a baseline**

```bash
cd /Users/asaleh/barry-design
git init
git add -A
git commit -m "chore: baseline before Phase A design polish" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: `git status` reports a clean tree. `node_modules/` and `dist/` are excluded by the existing `.gitignore`.

- [ ] **Step 2: Install the pinned test dependencies**

```bash
npm install --save-dev --save-exact vitest@5.0.2 jsdom@29.1.1 @testing-library/react@16.3.3 @testing-library/dom@10.4.2 @testing-library/user-event@14.6.7 @testing-library/jest-dom@6.10.0
```

Expected: no `EBADENGINE` warnings. (jsdom 30.x would warn on Node 24.14.)

- [ ] **Step 3: Add test scripts to `package.json`**

In `"scripts"`, add two entries after `"preview"`:

```json
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: Configure Vitest in `vite.config.js`** (replace the whole file)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 5: Create `src/test/setup.js`**

```js
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// jsdom has no IntersectionObserver; ScrollReveal only needs observe/disconnect to exist.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = IntersectionObserverStub

// jsdom does not implement scrolling.
window.scrollTo = vi.fn()
Element.prototype.scrollIntoView = vi.fn()

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 6: Give test files Node globals and ignore the old backup in `eslint.config.js`** (replace the whole file)

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'src/backup-*.jsx']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['src/test/**/*.js', '**/*.test.{js,jsx}', 'vite.config.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
])
```

- [ ] **Step 7: Write the harness sanity test** `src/test/harness.test.js`

```js
import { describe, it, expect } from 'vitest'

describe('test harness', () => {
  it('runs in jsdom with the stubs installed', () => {
    expect(typeof document.createElement).toBe('function')
    expect(typeof IntersectionObserver).toBe('function')
  })
})
```

- [ ] **Step 8: Run it**

Run: `npm test`
Expected: `Tests  1 passed (1)`.

- [ ] **Step 9: Check lint reports only the two known problems**

Run: `npm run lint`
Expected: exactly **1 error** (`react-hooks/set-state-in-effect` in `ProjectDetail`, fixed in Task 4) and **1 warning** (`react-hooks/exhaustive-deps` in `ScrollReveal`, fixed in Task 5). Anything else means a config mistake in Step 6.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json vite.config.js eslint.config.js src/test
git commit -m "test: add Vitest harness with jsdom and Testing Library" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Project data module

**Files:**
- Create: `src/data/projects.js`, `src/data/projects.test.js`

**Interfaces:**
- Produces (all named exports of `src/data/projects.js`):
  - `ALL_PROJECTS: "All Projects"`, `CATEGORIES: string[]` (6, in menu order), `PROCUREMENT_COPY: string`
  - `PROJECTS: Project[]` where `Project = { id, category, title, year, location, area, tags: string[], img: string|null, gallery: string[], alt, desc, procurement: boolean }`
  - `SERVICES: { num, title, desc }[]`
  - `slugify(text) -> string`, `hasPhotos(project) -> boolean`, `formatNum(index) -> "01"`
  - `filterByCategory(projects, category) -> Project[]` (returns the same array for `ALL_PROJECTS`)
  - `splitByPhotos(projects) -> { photographed, inProgress }` (order preserved)
  - `findProject(id) -> Project|null`, `findCategoryBySlug(slug) -> string|null`
  - `nextProject(projects, id) -> Project|null` (wraps; null for unknown id or a list shorter than 2)

`src/App.jsx` is not touched in this task; it still uses its own inline data until Task 3.

- [ ] **Step 1: Write the failing tests** `src/data/projects.test.js`

```js
import { describe, it, expect } from 'vitest'
import {
  ALL_PROJECTS,
  CATEGORIES,
  PROJECTS,
  filterByCategory,
  findCategoryBySlug,
  findProject,
  formatNum,
  hasPhotos,
  nextProject,
  slugify,
  splitByPhotos,
} from './projects'

describe('project data', () => {
  it('has nine projects with unique ids', () => {
    expect(PROJECTS).toHaveLength(9)
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(9)
  })

  it('never references the placeholder image', () => {
    const paths = PROJECTS.flatMap((p) => [p.img, ...p.gallery])
    expect(paths.some((src) => String(src).includes('photos-coming-soon'))).toBe(false)
  })

  it('keeps img and gallery consistent', () => {
    for (const p of PROJECTS) {
      if (p.gallery.length === 0) expect(p.img).toBeNull()
      else expect(p.gallery).toContain(p.img)
    }
  })

  it('defaults procurement to false on every project', () => {
    expect(PROJECTS.every((p) => p.procurement === false)).toBe(true)
  })

  it('only uses known categories', () => {
    for (const p of PROJECTS) expect(CATEGORIES).toContain(p.category)
  })
})

describe('helpers', () => {
  it('slugify makes url-safe slugs', () => {
    expect(slugify('Restaurants & Bars')).toBe('restaurants-bars')
    expect(slugify('Health & Wellness')).toBe('health-wellness')
  })

  it('formatNum pads to two digits', () => {
    expect(formatNum(0)).toBe('01')
    expect(formatNum(9)).toBe('10')
  })

  it('hasPhotos reflects the gallery', () => {
    expect(hasPhotos(findProject('haii-keii'))).toBe(true)
    expect(hasPhotos(findProject('doubletree-by-hilton'))).toBe(false)
  })

  it('splitByPhotos keeps order within each group', () => {
    const { photographed, inProgress } = splitByPhotos(PROJECTS)
    expect(photographed.map((p) => p.id)).toEqual([
      'xo-juice-and-studio',
      'omg-burger',
      'cyclone-anayas',
      'haii-keii',
      'bauhaus-houston',
    ])
    expect(inProgress.map((p) => p.id)).toEqual([
      'greek-orthodox-cathedral',
      'flying-saucer-draught',
      'doubletree-by-hilton',
      'airport-retail-spaces',
    ])
  })

  it('filterByCategory returns everything for All Projects', () => {
    expect(filterByCategory(PROJECTS, ALL_PROJECTS)).toBe(PROJECTS)
    expect(filterByCategory(PROJECTS, 'Nightlife').map((p) => p.id)).toEqual(['bauhaus-houston'])
  })

  it('findCategoryBySlug round-trips every category and rejects unknown slugs', () => {
    for (const c of CATEGORIES) expect(findCategoryBySlug(slugify(c))).toBe(c)
    expect(findCategoryBySlug('not-a-category')).toBeNull()
  })

  it('findProject returns null for unknown ids', () => {
    expect(findProject('nope')).toBeNull()
  })

  it('nextProject wraps from last to first', () => {
    expect(nextProject(PROJECTS, 'xo-juice-and-studio').id).toBe('omg-burger')
    expect(nextProject(PROJECTS, 'airport-retail-spaces').id).toBe('xo-juice-and-studio')
  })

  it('nextProject returns null for unknown ids and single-item lists', () => {
    expect(nextProject(PROJECTS, 'nope')).toBeNull()
    expect(nextProject([PROJECTS[0]], PROJECTS[0].id)).toBeNull()
  })
})
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `npx vitest run src/data`
Expected: FAIL with `Failed to resolve import "./projects"`.

- [ ] **Step 3: Create `src/data/projects.js`**

The `desc`, `alt`, `location`, `area` and `tags` text is copied verbatim from the current `PROJECTS` array in `src/App.jsx`. Only the shape changes: `num` is dropped, no-photo projects get `img: null, gallery: []`, and every project gains `procurement: false`.

```js
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
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/data`
Expected: `Tests  14 passed (14)`.

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "feat: extract project data and helpers into src/data/projects.js" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Home work list, filters and category page

**Files:**
- Create: `src/test/render.jsx`, `src/App.work.test.jsx`
- Modify: `src/App.jsx` (imports; delete the DATA section; replace `ProjectRow`, `Work`, `ProjectCategory`)

**Interfaces:**
- Consumes: from `src/data/projects.js`: `ALL_PROJECTS`, `CATEGORIES`, `PROJECTS`, `SERVICES`, `filterByCategory`, `findCategoryBySlug`, `formatNum`, `splitByPhotos`.
- Produces: `export function Work({ projects = PROJECTS })`, `export function ProjectCategory()`; internal `ProjectRow({ proj, num })`, `InProgressList({ projects })`, `ProjectLists({ projects })`. `renderAt(ui, path = '/')` in `src/test/render.jsx`, used by Tasks 4 and 5.
- New classes styled in Task 6: `.bd-work-lists`, `.bd-inprogress*`, `.bd-empty-state`, `.bd-eyebrow`, `.bd-page`.

- [ ] **Step 1: Create the router test helper** `src/test/render.jsx`

```jsx
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Render a component inside a router at `path`.
export const renderAt = (ui, path = '/') =>
  render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>)
```

- [ ] **Step 2: Write the failing tests** `src/App.work.test.jsx`

```jsx
import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { ProjectCategory, Work } from './App'
import { PROJECTS } from './data/projects'
import { renderAt } from './test/render'

const rowTitles = () =>
  screen.queryAllByRole('link', { name: /^View project:/ }).map((a) => a.getAttribute('aria-label').replace('View project: ', ''))

const inProgressTitles = () => {
  const section = screen.queryByRole('region', { name: 'Also in progress' })
  if (!section) return []
  return within(section).getAllByRole('link').map((a) => a.querySelector('.bd-inprogress-title').textContent)
}

describe('Work list', () => {
  it('shows photographed projects as numbered rows and the rest as a compact list', () => {
    renderAt(<Work />)
    expect(rowTitles()).toEqual(['XO JUICE AND STUDIO', 'OMG BURGER', 'CYCLONE ANAYAS', 'HAII KEII', 'BAUHAUS HOUSTON'])
    expect(document.querySelectorAll('.bd-proj-num')[4].textContent).toBe('05')
    expect(inProgressTitles()).toEqual([
      'GREEK ORTHODOX CATHEDRAL',
      'FLYING SAUCER DRAUGHT',
      'DOUBLETREE BY HILTON',
      'AIRPORT RETAIL SPACES',
    ])
  })

  it('never renders the placeholder image', () => {
    renderAt(<Work />)
    expect(document.body.innerHTML).not.toContain('photos-coming-soon')
  })

  it('filters both lists in place from the buttons', async () => {
    const user = userEvent.setup()
    renderAt(<Work />)

    await user.click(screen.getByRole('button', { name: 'Nightlife' }))
    expect(rowTitles()).toEqual(['BAUHAUS HOUSTON'])
    expect(inProgressTitles()).toEqual([])
    expect(screen.getByRole('button', { name: 'Nightlife' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Retail' }))
    expect(rowTitles()).toEqual([])
    expect(inProgressTitles()).toEqual(['AIRPORT RETAIL SPACES'])

    await user.click(screen.getByRole('button', { name: 'Restaurants & Bars' }))
    expect(rowTitles()).toEqual(['OMG BURGER', 'CYCLONE ANAYAS', 'HAII KEII'])
    expect(document.querySelectorAll('.bd-proj-num')[0].textContent).toBe('01')
    expect(inProgressTitles()).toEqual(['FLYING SAUCER DRAUGHT'])
  })

  it('filters in place from the phone dropdown', async () => {
    const user = userEvent.setup()
    renderAt(<Work />)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter projects by category' }), 'Hospitality')
    expect(rowTitles()).toEqual([])
    expect(inProgressTitles()).toEqual(['DOUBLETREE BY HILTON'])
  })

  it('shows an empty state when a filter matches nothing', async () => {
    const user = userEvent.setup()
    renderAt(<Work projects={PROJECTS.filter((p) => p.category !== 'Nightlife')} />)
    await user.click(screen.getByRole('button', { name: 'Nightlife' }))
    expect(screen.getByText('No projects in this category yet.')).toBeInTheDocument()
  })
})

describe('Category page', () => {
  const renderCategory = (slug) =>
    renderAt(
      <Routes>
        <Route path="/category/:slug" element={<ProjectCategory />} />
      </Routes>,
      `/category/${slug}`,
    )

  it('uses the same two-list layout', () => {
    renderCategory('restaurants-bars')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('RESTAURANTS & BARS')
    expect(rowTitles()).toEqual(['OMG BURGER', 'CYCLONE ANAYAS', 'HAII KEII'])
    expect(inProgressTitles()).toEqual(['FLYING SAUCER DRAUGHT'])
  })

  it('shows a not-found heading for an unknown slug', () => {
    renderCategory('nope')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Category Not Found')
  })
})
```

- [ ] **Step 3: Run them to confirm they fail**

Run: `npx vitest run src/App.work.test.jsx`
Expected: FAIL, 7 failing tests (`Work` and `ProjectCategory` are not exported yet, so they're `undefined`).

- [ ] **Step 4: Replace the first three lines of `src/App.jsx` (the imports)**

```jsx
import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import "./App.css";
import {
  ALL_PROJECTS,
  CATEGORIES,
  PROJECTS,
  SERVICES,
  filterByCategory,
  findCategoryBySlug,
  formatNum,
  splitByPhotos,
} from "./data/projects";
```

- [ ] **Step 5: Delete the inline data**

Delete everything from the line `// ─── DATA ───…` up to, but not including, the line `// ─── REUSABLE OBSERVATION COMPONENT ───…`. That removes `const PROJECTS`, `const SERVICES` and `const slugify`.

- [ ] **Step 6: Replace `function ProjectRow({ proj }) {` with these three components**

```jsx
function ProjectRow({ proj, num }) {
  return (
    <ScrollReveal>
      <Link className="bd-proj" to={`/project/${proj.id}`} aria-label={`View project: ${proj.title}`}>
        <div className="bd-proj-panel-content">
          <div className="bd-proj-info-block">
            <div className="bd-proj-num">{num}</div>
            <div className="bd-proj-title">{proj.title}</div>
            <div className="bd-proj-tags">
              {proj.tags.map((t) => (
                <span className="bd-proj-tag" key={t}>{t}</span>
              ))}
            </div>
          </div>

          <div className="bd-proj-right">
            <div className="bd-proj-panel-bg" style={{ backgroundImage: `url(${proj.img})` }} aria-hidden="true" />
            <div className="bd-proj-panel-overlay" aria-hidden="true" />

            <img className="bd-proj-img" src={proj.img} alt={proj.alt} loading="lazy" />

            <div className="bd-proj-meta-trigger">
              <span className="bd-proj-year">{proj.year}</span>
              <span className="bd-proj-arrow">
                View Project <span className="bd-proj-arrow-icon">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </ScrollReveal>
  );
}

function InProgressList({ projects }) {
  if (projects.length === 0) return null;

  return (
    <section className="bd-inprogress" aria-labelledby="inprogress-heading">
      <h3 className="bd-inprogress-label" id="inprogress-heading">Also in progress</h3>
      <ul className="bd-inprogress-list">
        {projects.map((p) => (
          <li key={p.id}>
            <Link className="bd-inprogress-row" to={`/project/${p.id}`}>
              <span className="bd-inprogress-title">{p.title}</span>
              <span className="bd-inprogress-meta">{p.category}</span>
              <span className="bd-inprogress-meta">{p.location}</span>
              <span className="bd-inprogress-meta">{p.area}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Photographed projects as image rows, the rest as a compact text list.
function ProjectLists({ projects }) {
  if (projects.length === 0) {
    return <p className="bd-empty-state">No projects in this category yet.</p>;
  }

  const { photographed, inProgress } = splitByPhotos(projects);

  return (
    <>
      {photographed.length > 0 && (
        <div className="bd-projects">
          {photographed.map((p, i) => (
            <ProjectRow key={p.id} proj={p} num={formatNum(i)} />
          ))}
        </div>
      )}
      <InProgressList projects={inProgress} />
    </>
  );
}
```

- [ ] **Step 7: Replace `function Work() {` with**

The buttons now all filter in place. The old version navigated to `/category/...` for every filter except "All", and the phone `<select>` did a full page reload via `window.location.href`.

```jsx
const FILTERS = [ALL_PROJECTS, ...CATEGORIES];

export function Work({ projects = PROJECTS }) {
  const [activeCat, setActiveCat] = useState(ALL_PROJECTS);
  const visible = filterByCategory(projects, activeCat);

  return (
    <section className="bd-work" id="work" aria-labelledby="work-heading">
      <div className="bd-work-section-padding">
        <ScrollReveal>
          <div className="bd-section-label" id="work-heading" role="heading" aria-level="2">
            Selected Work
          </div>
        </ScrollReveal>

        <ul className="bd-filter-bar" aria-label="Filter projects by category">
          {FILTERS.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                className={`bd-filter-btn ${activeCat === cat ? "active" : ""}`}
                aria-pressed={activeCat === cat}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>

        <div className="bd-mobile-filter-container">
          <select
            className="bd-mobile-select"
            value={activeCat}
            onChange={(e) => setActiveCat(e.target.value)}
            aria-label="Filter projects by category"
          >
            {FILTERS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bd-work-lists" key={activeCat}>
        <ProjectLists projects={visible} />
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Replace `function ProjectCategory() {` with**

```jsx
export function ProjectCategory() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const category = findCategoryBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!category) {
    return (
      <div className="bd-page">
        <header className="bd-detail-header">
          <Link to="/" className="bd-detail-back">← Back to Home</Link>
          <h1 className="bd-detail-title">Category Not Found</h1>
        </header>
      </div>
    );
  }

  return (
    <article className="bd-page">
      <header className="bd-detail-header">
        <Link to="/" className="bd-detail-back">← Back to Home</Link>
        <div className="bd-eyebrow">Project Typology</div>
        <h1 className="bd-detail-title">{category.toUpperCase()}</h1>
      </header>

      <ProjectLists projects={filterByCategory(PROJECTS, category)} />
    </article>
  );
}
```

- [ ] **Step 9: Run the full suite**

Run: `npm test`
Expected: all pass (`Tests  22 passed (22)`).

- [ ] **Step 10: Lint and build**

Run: `npm run lint && npm run build`
Expected: lint still shows only the two known problems from Task 1, Step 9 (so `npm run lint` exits 1; run `npm run build` on its own to confirm it succeeds).

- [ ] **Step 11: Commit**

```bash
git add src/App.jsx src/App.work.test.jsx src/test/render.jsx
git commit -m "feat: split work list into photographed rows and an in-progress list; filter in place" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Project page — carousel, procurement, next project

**Files:**
- Create: `src/lib/carousel.js`, `src/lib/carousel.test.js`, `src/App.project.test.jsx`
- Modify: `src/App.jsx` (imports; replace `ProjectDetail`; change the `/project/:id` route)

**Interfaces:**
- Consumes: `findProject`, `hasPhotos`, `nextProject`, `PROCUREMENT_COPY`, `PROJECTS` from Task 2; `renderAt` from Task 3.
- Produces: `wrapIndex(index, length) -> number` (0 for an empty list), `swipeStep(startX, endX, threshold = 50) -> -1|0|1`; `export function ProjectDetail({ id })`; internal `Carousel({ images, title })` and `ProjectDetailRoute()`, which renders `<ProjectDetail key={id} id={id} />` so the carousel remounts per project.
- New classes styled in Task 6: `.bd-carousel-wrap`, `.bd-carousel-count`, `.bd-next*`, `.bd-not-found*`.

**Event lifecycle:** the carousel's `keydown`, `touchstart` and `touchend` handlers are React props on the carousel element, so React removes them on unmount. Nothing is registered on `window`. `touchStartX` is a ref cleared after each `touchend`, so a `touchend` without a matching `touchstart` is ignored.

- [ ] **Step 1: Write the failing helper tests** `src/lib/carousel.test.js`

```js
import { describe, it, expect } from 'vitest'
import { swipeStep, wrapIndex } from './carousel'

describe('wrapIndex', () => {
  it('wraps forward and backward', () => {
    expect(wrapIndex(5, 5)).toBe(0)
    expect(wrapIndex(-1, 5)).toBe(4)
    expect(wrapIndex(2, 5)).toBe(2)
  })

  it('returns 0 for an empty list instead of NaN', () => {
    expect(wrapIndex(3, 0)).toBe(0)
  })
})

describe('swipeStep', () => {
  it('maps a left swipe to next and a right swipe to previous', () => {
    expect(swipeStep(300, 200)).toBe(1)
    expect(swipeStep(200, 300)).toBe(-1)
  })

  it('ignores movements shorter than the threshold', () => {
    expect(swipeStep(300, 260)).toBe(0)
    expect(swipeStep(300, 250)).toBe(1)
  })
})
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `npx vitest run src/lib`
Expected: FAIL with `Failed to resolve import "./carousel"`.

- [ ] **Step 3: Create `src/lib/carousel.js`**

```js
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
```

- [ ] **Step 4: Run the helper tests**

Run: `npx vitest run src/lib`
Expected: `Tests  4 passed (4)`.

- [ ] **Step 5: Write the failing page tests** `src/App.project.test.jsx`

```jsx
import { describe, it, expect } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useParams } from 'react-router-dom'
import { ProjectDetail } from './App'
import { PROCUREMENT_COPY, PROJECTS } from './data/projects'
import { renderAt } from './test/render'

// Mirrors the app's route wrapper so tests exercise the same remount-on-id behaviour.
function DetailRoute() {
  const { id } = useParams()
  return <ProjectDetail key={id} id={id} />
}

const renderProject = (id) =>
  renderAt(
    <Routes>
      <Route path="/project/:id" element={<DetailRoute />} />
    </Routes>,
    `/project/${id}`,
  )

describe('Project page', () => {
  it('shows an image counter and moves with the buttons, wrapping at the ends', async () => {
    const user = userEvent.setup()
    renderProject('haii-keii')
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Previous image' }))
    expect(screen.getByText('5 / 5')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next image' }))
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('moves with the arrow keys when the carousel has focus', async () => {
    const user = userEvent.setup()
    renderProject('haii-keii')
    screen.getByRole('region', { name: 'HAII KEII gallery' }).focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText('3 / 5')).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('moves on a swipe of 50px or more and ignores shorter ones', () => {
    renderProject('haii-keii')
    const carousel = screen.getByRole('region', { name: 'HAII KEII gallery' })
    fireEvent.touchStart(carousel, { touches: [{ clientX: 300 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 280 }] })
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    fireEvent.touchStart(carousel, { touches: [{ clientX: 300 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 200 }] })
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('has no carousel for a project without photos', () => {
    renderProject('doubletree-by-hilton')
    expect(screen.queryByRole('region', { name: /gallery/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('hides the procurement paragraph while procurement is false', () => {
    renderProject('haii-keii')
    expect(screen.queryByText(PROCUREMENT_COPY)).not.toBeInTheDocument()
  })

  it('shows the procurement paragraph when the project sets procurement', () => {
    const project = PROJECTS.find((p) => p.id === 'haii-keii')
    project.procurement = true
    try {
      renderProject('haii-keii')
      expect(screen.getByText(PROCUREMENT_COPY)).toBeInTheDocument()
    } finally {
      project.procurement = false
    }
  })

  it('links to the next project, wrapping from last to first', () => {
    renderProject('airport-retail-spaces')
    const next = screen.getByRole('navigation', { name: 'Next project' })
    expect(within(next).getByRole('link')).toHaveAttribute('href', '/project/xo-juice-and-studio')
    expect(next).toHaveTextContent('XO JUICE AND STUDIO')
  })

  it('resets the carousel to the first image when following the next-project link', async () => {
    const user = userEvent.setup()
    renderProject('xo-juice-and-studio')
    await user.click(screen.getByRole('button', { name: 'Next image' }))
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
    await user.click(within(screen.getByRole('navigation', { name: 'Next project' })).getByRole('link'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('OMG BURGER')
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('shows not-found for an unknown id', () => {
    renderProject('nope')
    expect(screen.getByRole('heading', { name: 'Project Not Found' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run them to confirm they fail**

Run: `npx vitest run src/App.project.test.jsx`
Expected: FAIL, 9 failing tests (`ProjectDetail` is not exported yet).

- [ ] **Step 7: Replace the import block at the top of `src/App.jsx`** (the block written in Task 3, Step 4)

```jsx
import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import "./App.css";
import {
  ALL_PROJECTS,
  CATEGORIES,
  PROCUREMENT_COPY,
  PROJECTS,
  SERVICES,
  filterByCategory,
  findCategoryBySlug,
  findProject,
  formatNum,
  hasPhotos,
  nextProject,
  splitByPhotos,
} from "./data/projects";
import { swipeStep, wrapIndex } from "./lib/carousel";
```

- [ ] **Step 8: Replace `function ProjectDetail() {` with**

This also fixes the existing `set-state-in-effect` lint error: the index resets by remounting (via `key`), not by calling `setState` inside an effect.

```jsx
function Carousel({ images, title }) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(null);
  const count = images.length;

  const go = (delta) => setIdx((i) => wrapIndex(i + delta, count));

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const step = swipeStep(touchStartX.current, e.changedTouches[0].clientX);
    touchStartX.current = null;
    if (step !== 0) go(step);
  };

  return (
    <div className="bd-carousel-wrap">
      <div
        className="bd-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} gallery`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${title} gallery image ${i + 1} of ${count}`}
            className={`bd-carousel-img ${i === idx ? "active" : ""}`}
            aria-hidden={i !== idx}
          />
        ))}

        {count > 1 && (
          <>
            <button type="button" className="bd-carousel-btn prev" onClick={() => go(-1)} aria-label="Previous image">←</button>
            <button type="button" className="bd-carousel-btn next" onClick={() => go(1)} aria-label="Next image">→</button>

            <div className="bd-carousel-count" aria-live="polite">
              {idx + 1} / {count}
            </div>

            <div className="bd-carousel-dots">
              {images.map((src, i) => (
                <button
                  type="button"
                  key={src}
                  className={`bd-carousel-dot ${i === idx ? "active" : ""}`}
                  onClick={() => setIdx(i)}
                  aria-label={`Go to image ${i + 1}`}
                  aria-current={i === idx}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Keyed by id so the carousel resets when moving between projects.
function ProjectDetailRoute() {
  const { id } = useParams();
  return <ProjectDetail key={id} id={id} />;
}

export function ProjectDetail({ id }) {
  const proj = findProject(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!proj) {
    return (
      <div className="bd-not-found">
        <h2 className="bd-not-found-title">Project Not Found</h2>
      </div>
    );
  }

  const next = nextProject(PROJECTS, proj.id);

  return (
    <article className="bd-page">
      <header className="bd-detail-header">
        <Link to="/" className="bd-detail-back">← Back to Home</Link>
        <h1 className="bd-detail-title">{proj.title}</h1>

        <div className="bd-detail-meta">
          <div>
            <div className="bd-detail-meta-label">Year Completed</div>
            <div className="bd-detail-meta-val">{proj.year}</div>
          </div>
          <div>
            <div className="bd-detail-meta-label">Location</div>
            <div className="bd-detail-meta-val">{proj.location}</div>
          </div>
          <div>
            <div className="bd-detail-meta-label">Area</div>
            <div className="bd-detail-meta-val">{proj.area}</div>
          </div>
          <div>
            <div className="bd-detail-meta-label">Services Provided</div>
            <div className="bd-detail-meta-val">{proj.tags.join(" • ")}</div>
          </div>
        </div>
      </header>

      {hasPhotos(proj) && <Carousel images={proj.gallery} title={proj.title} />}

      <div className="bd-detail-body">
        <p>{proj.desc}</p>
        {proj.procurement && <p>{PROCUREMENT_COPY}</p>}
      </div>

      {next && (
        <nav className="bd-next" aria-label="Next project">
          <Link to={`/project/${next.id}`} className="bd-next-link">
            <span className="bd-next-label">Next project</span>
            <span className="bd-next-title">{next.title}</span>
          </Link>
        </nav>
      )}
    </article>
  );
}
```

- [ ] **Step 9: Point the route at the wrapper**

In `export default function BarryDesignStudio()`, change

```jsx
        <Route path="/project/:id" element={<ProjectDetail />} />
```

to

```jsx
        <Route path="/project/:id" element={<ProjectDetailRoute />} />
```

- [ ] **Step 10: Run the full suite**

Run: `npm test`
Expected: `Tests  35 passed (35)`.

- [ ] **Step 11: Lint and build**

Run: `npm run lint && npm run build`
Expected: lint exits 0 with **1 warning** (`ScrollReveal`, fixed in Task 5); the build succeeds.

- [ ] **Step 12: Commit**

```bash
git add src/lib src/App.jsx src/App.project.test.jsx
git commit -m "feat: project page carousel counter, keys and swipe; per-project procurement; next-project link" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Nav, hero, About and inline-style cleanup

**Files:**
- Create: `src/App.shell.test.jsx`
- Modify: `src/App.jsx` (replace `ScrollReveal`, `Logo`, `Nav`, `Hero`, `Home`, `About`, and the default export)

**Interfaces:**
- Consumes: `renderAt` from Task 3.
- Produces: `export function Nav()`, `export function About()`; `MEGAMENU_ITEMS` (module constant; `img: null` for Hospitality, Retail and Institutional); `<main id="main">` as the skip-link target.
- New classes styled in Task 6: `.bd-reveal`, `.bd-mobile-menu-list`, `.bd-mobile-menu-link`, `.bd-skip-link`, `.bd-about-hero`, `.bd-about-hero-img`, `.bd-founder-name`.

**Timer lifecycle:** `Nav`'s megamenu close timeout is cleared on re-enter and on unmount (existing behaviour, kept). `ScrollReveal` now captures `elementRef.current` in a local before the effect returns, so cleanup always disconnects the observer it created, even if the ref changes after unmount.

- [ ] **Step 1: Write the failing tests** `src/App.shell.test.jsx`

```jsx
import { describe, it, expect } from 'vitest'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { About, Nav } from './App'
import { renderAt } from './test/render'

describe('About page', () => {
  it('leads with Yousef by name', () => {
    renderAt(<About />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('YOUSEF ELBARRY')
    expect(screen.getByText('Founder, Barry Design Studio')).toBeInTheDocument()
  })

  it('has no inline styles', () => {
    const { container } = renderAt(<About />)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })
})

describe('Navigation', () => {
  it('only renders preview images for categories that have photos', () => {
    renderAt(<Nav />)
    const previews = screen.getByTestId('megamenu-display').querySelectorAll('.bd-megamenu-preview-img')
    expect(previews).toHaveLength(4)
    expect(document.body.innerHTML).not.toContain('photos-coming-soon')
  })

  it('shows a text-only panel for a category without photos', async () => {
    const user = userEvent.setup()
    renderAt(<Nav />)
    await user.hover(screen.getByRole('link', { name: 'Retail' }))
    const display = screen.getByTestId('megamenu-display')
    expect(display).toHaveTextContent('RETAIL')
    expect(display.querySelector('.bd-megamenu-preview-img.active')).toBeNull()
  })

  it('updates the preview when a category link gets keyboard focus', () => {
    renderAt(<Nav />)
    act(() => screen.getByRole('link', { name: 'Nightlife' }).focus())
    expect(screen.getByTestId('megamenu-display')).toHaveTextContent('NIGHTLIFE')
  })

  it('has no inline styles outside the dynamic preview backgrounds', () => {
    const { container } = renderAt(<Nav />)
    const styled = [...container.querySelectorAll('[style]')]
    expect(styled.every((el) => el.classList.contains('bd-megamenu-preview-img'))).toBe(true)
  })
})
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `npx vitest run src/App.shell.test.jsx`
Expected: FAIL, all 6 tests (`Nav` and `About` are not exported yet).

- [ ] **Step 3: Replace `function ScrollReveal(` with**

```jsx
function ScrollReveal({ children, animationClass = "reveal-fade-up" }) {
  const elementRef = useRef(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node || hasRevealed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.disconnect();
        }
      },
      { root: null, threshold: 0.15, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasRevealed]);

  return (
    <div ref={elementRef} className={`bd-reveal ${animationClass} ${hasRevealed ? "visible" : ""}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Replace `function Logo() {` with**

```jsx
function Logo() {
  return (
    <div className="bd-logo-link">
      <img src="/images/logo.png" alt="Barry Design Studio" className="bd-logo-img" />
    </div>
  );
}
```

- [ ] **Step 5: Replace `function Nav() {` with**

The megamenu list moves out of the component into `MEGAMENU_ITEMS`. Preview `<div>`s render only for items with an image; links also update the preview on keyboard focus. Mobile-menu links use classes instead of inline styles.

```jsx
// Categories without photos show text only in the preview panel.
const MEGAMENU_ITEMS = [
  { name: "All Projects", path: "/#work", img: "/images/projects/haii-keii/haii-keii-1.jpg", sub: "Complete Studio Index" },
  { name: "Health & Wellness", path: "/category/health-wellness", img: "/images/projects/xo/xo-1.jpg", sub: "Studio & Spa Planning" },
  { name: "Restaurants & Bars", path: "/category/restaurants-bars", img: "/images/projects/cyclone-anayas/cyclone-anayas-1.jpg", sub: "Hospitality & Dining" },
  { name: "Nightlife", path: "/category/nightlife", img: "/images/projects/bauhaus/bauhaus-1.jpg", sub: "Clubs & Lounge Acoustics" },
  { name: "Hospitality", path: "/category/hospitality", img: null, sub: "Hotels & Commercial Lounges" },
  { name: "Retail", path: "/category/retail", img: null, sub: "Airport & Storefront Brand Builds" },
  { name: "Institutional", path: "/category/institutional", img: null, sub: "Cultural Landmark Structures" },
];

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegamenuVisible, setIsMegamenuVisible] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMegamenuVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMegamenuVisible(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const scrollToContact = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const closeMenu = () => setIsMenuOpen(false);
  const active = MEGAMENU_ITEMS[activePreview];

  return (
    <>
      <nav className="bd-nav" aria-label="Main navigation">
        <Link to="/" onClick={closeMenu} aria-label="Barry Design Studio Home">
          <Logo />
        </Link>

        <ul className="bd-nav-links">
          <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Link to="/#work">Work</Link>

            <div className={`bd-megamenu-canvas ${isMegamenuVisible ? "active" : ""}`}>
              <div className="bd-megamenu-list-block">
                <div className="bd-megamenu-label">Project Typologies</div>
                <div className="bd-megamenu-links-grid">
                  {MEGAMENU_ITEMS.map((item, idx) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="bd-megamenu-link"
                      onMouseEnter={() => setActivePreview(idx)}
                      onFocus={() => setActivePreview(idx)}
                      onClick={() => setIsMegamenuVisible(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bd-megamenu-display-canvas" data-testid="megamenu-display">
                {MEGAMENU_ITEMS.filter((item) => item.img).map((item) => (
                  <div
                    key={item.name}
                    className={`bd-megamenu-preview-img ${active.name === item.name ? "active" : ""}`}
                    style={{ backgroundImage: `url(${item.img})` }}
                    aria-hidden="true"
                  />
                ))}
                <div className="bd-megamenu-display-text">
                  <div className="bd-megamenu-display-h3">{active.name.toUpperCase()}</div>
                  <div className="bd-megamenu-display-sub">{active.sub}</div>
                </div>
              </div>
            </div>
          </li>

          <li><Link to="/about">About</Link></li>
          <li><Link to="/#services">Services</Link></li>
          <li><a href="#contact" onClick={scrollToContact}>Contact</a></li>
        </ul>

        <div className="bd-nav-actions">
          <a href="#contact" className="bd-nav-cta" onClick={scrollToContact}>
            Get in Touch
          </a>

          <button
            type="button"
            className={`bd-hamburger ${isMenuOpen ? "open" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div className={`bd-mobile-menu ${isMenuOpen ? "active" : ""}`}>
        <ul className="bd-mobile-menu-list">
          <li><Link to="/#work" onClick={closeMenu} className="bd-mobile-menu-link">Work</Link></li>
          <li><Link to="/about" onClick={closeMenu} className="bd-mobile-menu-link">About</Link></li>
          <li><Link to="/#services" onClick={closeMenu} className="bd-mobile-menu-link">Services</Link></li>
          <li><a href="#contact" onClick={scrollToContact} className="bd-mobile-menu-link">Contact</a></li>
        </ul>
      </div>
    </>
  );
}
```

- [ ] **Step 6: Replace `function Hero() {` with**

The `ScrollReveal` wrappers and their `style={{ animation: "none" }}` overrides are removed. The hero is above the fold, so the CSS `bdUp` entrance animation alone handles it.

```jsx
function Hero() {
  return (
    <section className="bd-hero" aria-label="Hero">
      <div className="bd-hero-bg" aria-hidden="true" />
      <div className="bd-hero-gradient" aria-hidden="true" />
      <div className="bd-hero-noise" aria-hidden="true" />
      <div className="bd-hero-rule-v" aria-hidden="true" />

      <p className="bd-hero-scroll" aria-hidden="true">scroll</p>

      <p className="bd-hero-eyebrow">Houston, TX · Architectural Design Studio</p>

      <h1 className="bd-hero-h1">
        <span>WE CREATE</span>
        <span>INNOVATIVE</span>
        <span>SPACES</span>
      </h1>

      <p className="bd-hero-sub">
        By combining spatial precision with artistic sensibility, we help
        clients align, structure and elevate their built environments.
      </p>

      <div className="bd-hero-btns">
        <Link to="/#work" className="bd-btn-fill">
          View Projects
        </Link>
        <Link to="/about" className="bd-btn-ghost">
          Our Process
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Replace `function Home() {` with** (only change: `<main id="main">`)

```jsx
function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <main id="main">
      <Hero />
      <Work />
      <Statement />
      <Services />
    </main>
  );
}
```

- [ ] **Step 8: Replace `function About() {` with**

```jsx
export function About() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <article className="bd-page">
      <header className="bd-detail-header">
        <Link to="/" className="bd-detail-back">← Back to Home</Link>
        <div className="bd-eyebrow">Founder, Barry Design Studio</div>
        <h1 className="bd-detail-title">YOUSEF ELBARRY</h1>
      </header>

      <div className="bd-about-hero">
        <img src="/images/about-studio.webp" alt="Barry Design Studio workspace" className="bd-about-hero-img" />
      </div>

      <div className="bd-about-grid">
        <div className="bd-about-text-block">
          <blockquote className="bd-founder-quote">
            “At the age of 4, I built my first Lego bridge to allow my toy cars to cross over a “river” on the carpet in my room. A Couple of years after that, I built my first house with cigarette packs glued together. At the time all the empty lots around my neighborhood were being built. I was captivated by the huge slabs of concrete and brick walls, workers and the noise of their machines. At the age of 10 I decided to be a Designer.”
          </blockquote>

          <p>Although born in the state of Tennessee, Cairo, Egypt is my hometown where I was raised and educated. There, I studied in the School of Engineering, Department of Architecture and Environmental Design at AAST University.</p>
          <p>I earned my bachelor's degree, which was accredited and partnered with The Royal Institute of British Architects, guaranteeing a high standard of education and recognition. This comprehensive program exposed me to various disciplines within the field of building science, including civil engineering, structural design, MEP systems, project management, and beyond.</p>
          <p className="bd-founder-name">Yousef Elbarry</p>
        </div>

        <div>
          <img src="/images/yousef-elbarry-portrait.png" alt="Yousef Elbarry" className="bd-about-img" />
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 9: Replace `export default function BarryDesignStudio() {` with** (skip link uses a class and targets `#main`)

```jsx
export default function BarryDesignStudio() {
  return (
    <BrowserRouter>
      <a href="#main" className="bd-skip-link">
        Skip to main content
      </a>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/project/:id" element={<ProjectDetailRoute />} />
        <Route path="/category/:slug" element={<ProjectCategory />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
```

- [ ] **Step 10: Run the full suite**

Run: `npm test`
Expected: `Tests  41 passed (41)`.

- [ ] **Step 11: Confirm no stray inline styles remain**

Run: `grep -n "style={{" src/App.jsx`
Expected: exactly two hits, both `backgroundImage` (the megamenu preview and `.bd-proj-panel-bg`).

- [ ] **Step 12: Lint and build**

Run: `npm run lint && npm run build`
Expected: lint exits 0 with **0 problems**; the build succeeds.

- [ ] **Step 13: Commit**

```bash
git add src/App.jsx src/App.shell.test.jsx
git commit -m "feat: megamenu without placeholders, About leads with Yousef, inline styles to classes" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Stylesheets — tokens, type, contrast, layout and mobile

**Files:**
- Create: `src/test/css.js`, `src/styles/tokens.test.js`, `src/styles/layout.test.js`, `src/styles/{index,tokens,base,nav,home,project,about,contact}.css`
- Modify: `src/App.jsx` (one import line), `index.html` (font links)
- Delete: `src/App.css`

**Interfaces:**
- Consumes: every class name used by `src/App.jsx` after Task 5.
- Produces: `readStyles() -> { [file]: css }`, `parseRules(css) -> { selector, body, atRule }[]`, `declarations(body) -> { prop, value }[]`, `minFontPx(value) -> number|null` (resolves `clamp()` to its minimum; 15px root), `contrast(hexA, hexB) -> number`, `rootTokens(css) -> { [--name]: value }`.

- [ ] **Step 1: Create the CSS test helpers** `src/test/css.js`

```js
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Vitest runs from the project root.
const STYLES_DIR = join(process.cwd(), 'src', 'styles')

// Every stylesheet under src/styles, keyed by file name.
export function readStyles() {
  return Object.fromEntries(
    readdirSync(STYLES_DIR)
      .filter((f) => f.endsWith('.css'))
      .map((f) => [f, readFileSync(join(STYLES_DIR, f), 'utf8')]),
  )
}

// Minimal CSS walker: returns every style rule as
// { selector, body, atRule } where atRule is the enclosing @media/@supports prelude or null.
// Good enough for this project's hand-written CSS (no nesting, no braces inside strings).
export function parseRules(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const rules = []
  const stack = []
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '{') {
      const prelude = text.slice(start, i).trim()
      stack.push({ prelude, bodyStart: i + 1 })
      start = i + 1
    } else if (ch === '}') {
      const open = stack.pop()
      if (!open) continue
      const parent = stack[stack.length - 1]
      if (!open.prelude.startsWith('@')) {
        rules.push({
          selector: open.prelude,
          body: text.slice(open.bodyStart, i).trim(),
          atRule: parent && parent.prelude.startsWith('@') ? parent.prelude : null,
        })
      }
      start = i + 1
    } else if (ch === ';' && stack.length === 0) {
      start = i + 1
    }
  }
  return rules
}

export function declarations(body) {
  return body
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const idx = d.indexOf(':')
      return { prop: d.slice(0, idx).trim(), value: d.slice(idx + 1).trim() }
    })
}

const ROOT_PX = 15

// Smallest size a font-size value can render at, in px. clamp() resolves to its minimum.
export function minFontPx(value) {
  const v = value.replace(/!important/, '').trim()
  const clamp = v.match(/^clamp\(\s*([^,]+),/)
  const first = clamp ? clamp[1].trim() : v
  const m = first.match(/^([\d.]+)(rem|px)$/)
  if (!m) return null
  return m[2] === 'rem' ? parseFloat(m[1]) * ROOT_PX : parseFloat(m[1])
}

const luminance = (hex) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Custom properties declared in the top-level :root rule.
export function rootTokens(css) {
  const root = parseRules(css).find((r) => r.selector === ':root' && r.atRule === null)
  if (!root) return {}
  return Object.fromEntries(
    declarations(root.body)
      .filter((d) => d.prop.startsWith('--'))
      .map((d) => [d.prop, d.value]),
  )
}
```

- [ ] **Step 2: Write the failing token, type and interaction tests** `src/styles/tokens.test.js`

```js
import { describe, it, expect } from 'vitest'
import { contrast, declarations, minFontPx, parseRules, readStyles, rootTokens } from '../test/css'

const files = readStyles()
const all = Object.values(files).join('\n')
const rules = parseRules(all)

describe('tokens', () => {
  const t = rootTokens(files['tokens.css'] ?? '')

  it('defines the spec token set with exact values', () => {
    expect(t).toMatchObject({
      '--paper': '#f4f0ea',
      '--paper-2': '#ebe5dd',
      '--ink': '#121212',
      '--ink-2': '#4a4a4a',
      '--ink-3': '#646464',
      '--gold': '#a38757',
      '--gold-text': '#735d30',
      '--nav-h': '88px',
    })
  })

  it.each([
    ['--ink', '--paper'],
    ['--ink', '--paper-2'],
    ['--ink-2', '--paper'],
    ['--ink-2', '--paper-2'],
    ['--ink-3', '--paper'],
    ['--ink-3', '--paper-2'],
    ['--gold-text', '--paper'],
    ['--gold-text', '--paper-2'],
  ])('%s on %s meets 4.5:1', (fg, bg) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5)
  })

  it('--gold on --paper meets 3:1 for large text', () => {
    expect(contrast(t['--gold'], t['--paper'])).toBeGreaterThanOrEqual(3)
  })

  it('no stylesheet uses the old token names', () => {
    expect(all).not.toMatch(/--(bone2?|bone3|hi|off|dim)\b/)
  })
})

describe('type', () => {
  it('no font-size renders below 12px', () => {
    const tooSmall = rules.flatMap((r) =>
      declarations(r.body)
        .filter((d) => d.prop === 'font-size')
        .filter((d) => {
          const px = minFontPx(d.value)
          return px !== null && px < 12
        })
        .map((d) => `${r.selector} { font-size: ${d.value} }`),
    )
    expect(tooSmall).toEqual([])
  })

  // --gold is 3.0:1, so it may only colour large display text.
  const LARGE_GOLD_SELECTORS = [
    '.bd-proj:hover .bd-proj-title',
    '.bd-inprogress-row:hover .bd-inprogress-title',
    '.bd-next-link:hover .bd-next-title',
  ]

  it('uses --gold as a text colour only on large display text', () => {
    const offenders = rules
      .filter((r) => declarations(r.body).some((d) => d.prop === 'color' && d.value === 'var(--gold)'))
      .map((r) => r.selector)
      .filter((s) => !LARGE_GOLD_SELECTORS.includes(s))
    expect(offenders).toEqual([])
  })
})

describe('interaction states', () => {
  it('has a gold :focus-visible outline', () => {
    const focus = rules.find((r) => r.selector.includes(':focus-visible'))
    expect(focus?.body).toMatch(/outline:\s*2px solid var\(--gold\)/)
    expect(focus?.body).toMatch(/outline-offset:\s*3px/)
  })

  it('handles prefers-reduced-motion', () => {
    expect(rules.some((r) => r.atRule?.includes('prefers-reduced-motion: reduce'))).toBe(true)
  })

  it('uses !important only inside the reduced-motion block', () => {
    const offenders = rules
      .filter((r) => r.body.includes('!important'))
      .filter((r) => !r.atRule?.includes('prefers-reduced-motion'))
      .map((r) => r.selector)
    expect(offenders).toEqual([])
  })
})

describe('cleanup', () => {
  it('drops fixed backgrounds, the unused marquee and stale FIXED comments', () => {
    expect(all).not.toMatch(/background-attachment:\s*fixed/)
    expect(all).not.toMatch(/bd-marquee/)
    expect(all).not.toMatch(/FIXED/)
  })
})
```

- [ ] **Step 3: Write the failing layout tests** `src/styles/layout.test.js`

```js
import { describe, it, expect } from 'vitest'
import { declarations, parseRules, readStyles } from '../test/css'

const rules = parseRules(Object.values(readStyles()).join('\n'))

// Value of `prop` in the rule matching `selector` exactly, inside `atRule` (null = top level).
// When several rules match, the last one wins, as in the cascade.
function value(selector, prop, atRule = null) {
  const matches = rules.filter(
    (r) =>
      r.selector.split(',').map((s) => s.trim()).includes(selector) &&
      (atRule === null ? r.atRule === null : r.atRule?.includes(atRule)),
  )
  const decls = matches.flatMap((r) => declarations(r.body)).filter((d) => d.prop === prop)
  return decls.length ? decls[decls.length - 1].value : undefined
}

const px = (v) => parseFloat(v)

describe('navigation', () => {
  it('sizes the nav from --nav-h and shrinks it on phones', () => {
    expect(value('.bd-nav', 'height')).toBe('var(--nav-h)')
    expect(value(':root', '--nav-h', 'max-width: 768px')).toBe('72px')
  })

  it('sizes the logo 64px, 48px on phones', () => {
    expect(value('.bd-logo-img', 'height')).toBe('64px')
    expect(value('.bd-logo-img', 'height', 'max-width: 768px')).toBe('48px')
  })

  it('pins the megamenu flush under the nav', () => {
    expect(value('.bd-megamenu-canvas', 'top')).toBe('var(--nav-h)')
  })

  it('gives the hamburger a 44px target', () => {
    expect(px(value('.bd-hamburger', 'width'))).toBeGreaterThanOrEqual(44)
    expect(px(value('.bd-hamburger', 'height'))).toBeGreaterThanOrEqual(44)
  })
})

describe('home', () => {
  it('uses the small-viewport unit for the phone hero, with a vh fallback', () => {
    const hero = rules.find((r) => r.selector === '.bd-hero' && r.atRule?.includes('max-width: 768px'))
    expect(hero.body).toMatch(/min-height:\s*85vh;\s*min-height:\s*85svh/)
  })

  it('shows thumbnails in full colour on touch screens', () => {
    expect(value('.bd-proj-panel-bg', 'filter', 'hover: none')).toBe('none')
  })

  it('starts thumbnails at 30% grey', () => {
    expect(value('.bd-proj-panel-bg', 'filter')).toBe('grayscale(30%) brightness(0.95)')
  })

  it('uses Cyclone Anayas behind the statement', () => {
    expect(value('.bd-stmt-bg', 'background-image')).toContain('cyclone-anayas-2.jpg')
  })

  it('stacks services 4 -> 2 -> 1 columns', () => {
    expect(value('.bd-svc-grid', 'grid-template-columns')).toBe('repeat(4, 1fr)')
    expect(value('.bd-svc-grid', 'grid-template-columns', 'max-width: 1024px')).toBe('1fr 1fr')
    expect(value('.bd-svc-grid', 'grid-template-columns', 'max-width: 768px')).toBe('1fr')
  })
})

describe('project page', () => {
  it('stacks the meta grid 4 -> 2 -> 1 columns', () => {
    expect(value('.bd-detail-meta', 'grid-template-columns')).toBe('repeat(4, 1fr)')
    expect(value('.bd-detail-meta', 'grid-template-columns', 'max-width: 1024px')).toBe('1fr 1fr')
    expect(value('.bd-detail-meta', 'grid-template-columns', 'max-width: 768px')).toBe('1fr')
  })

  it('reduces the header top padding to 4rem', () => {
    expect(value('.bd-detail-header', 'padding')).toBe('4rem var(--gutter)')
  })
})

describe('tap targets', () => {
  it.each([
    ['.bd-filter-btn', 'min-height'],
    ['.bd-mobile-select', 'min-height'],
    ['.bd-carousel-btn', 'width'],
    ['.bd-carousel-btn', 'height'],
    ['.bd-carousel-dot', 'width'],
    ['.bd-carousel-dot', 'height'],
    ['.bd-input', 'min-height'],
    ['.bd-submit', 'min-height'],
    ['.bd-btn-fill', 'min-height'],
    ['.bd-nav-cta', 'min-height'],
  ])('%s %s is at least 44px', (selector, prop) => {
    expect(px(value(selector, prop))).toBeGreaterThanOrEqual(44)
  })
})
```

- [ ] **Step 4: Run them to confirm they fail**

Run: `npx vitest run src/styles`
Expected: FAIL, 33 failed and 5 passed. The 5 that pass are the "must not contain" guards, which pass trivially when no stylesheets exist under `src/styles/` yet.

- [ ] **Step 5: Create `src/styles/index.css`**

```css
/* Order matters: tokens, then base, then page areas. */
@import "./tokens.css";
@import "./base.css";
@import "./nav.css";
@import "./home.css";
@import "./project.css";
@import "./about.css";
@import "./contact.css";
```

- [ ] **Step 6: Create `src/styles/tokens.css`**

Contrast comments are measured on `--paper` / `--paper-2`.

```css
/* Design tokens. Contrast figures are on --paper / --paper-2 (see spec §1). */
:root {
  --paper:     #f4f0ea;
  --paper-2:   #ebe5dd;
  --ink:       #121212; /* 16.50 / 14.97 */
  --ink-2:     #4a4a4a; /* 7.81 / 7.08 */
  --ink-3:     #646464; /* 5.21 / 4.73 */
  --gold:      #a38757; /* 3.00 — rules, borders and text >= 24px only */
  --gold-text: #735d30; /* 5.54 / 5.03 — gold at small sizes */

  --nav-h:  88px;
  --gutter: 2.5rem;

  --display: 'Bebas Neue', sans-serif;
  --body:    'DM Sans', system-ui, sans-serif;

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-reveal: cubic-bezier(0.215, 0.61, 0.355, 1);
}

@media (max-width: 768px) {
  :root {
    --nav-h:  72px;
    --gutter: 1.25rem;
  }
}
```

- [ ] **Step 7: Create `src/styles/base.css`**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--body);
  font-weight: 300;
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
}

img { max-width: 100%; }

.bd-skip-link {
  position: absolute; left: 1rem; top: -100px; z-index: 300;
  background: var(--ink); color: var(--paper);
  padding: 0.75rem 1.25rem;
  font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase;
  text-decoration: none;
}
.bd-skip-link:focus { top: 1rem; }

:where(a, button, input, textarea, select, [tabindex]):focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 3px;
}

/* ── SCROLL REVEAL ── */
.bd-reveal { width: 100%; }

.reveal-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s var(--ease-reveal), transform 0.8s var(--ease-reveal);
}
.reveal-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
.delay-100 { transition-delay: 100ms; }
.delay-200 { transition-delay: 200ms; }
.delay-300 { transition-delay: 300ms; }
.delay-400 { transition-delay: 400ms; }

@keyframes bdUp {
  from { opacity: 0; transform: translateY(25px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes bdFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── SHARED LABELS ── */
.bd-section-label {
  font-size: 0.87rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--ink-3); margin-bottom: 3rem;
  display: flex; align-items: center; gap: 1rem;
}
.bd-section-label::after {
  content: ''; flex: 1; height: 1px;
  background: rgba(18, 18, 18, 0.08);
}

.bd-eyebrow {
  font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--ink-3); margin-bottom: 1rem;
}

.bd-page {
  background: var(--paper);
  min-height: 100vh;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .reveal-fade-up {
    opacity: 1 !important;
    transform: none !important;
  }
  .bd-proj-panel-bg,
  .bd-megamenu-preview-img,
  .bd-hero-bg {
    transform: none !important;
  }
}
```

- [ ] **Step 8: Create `src/styles/nav.css`**

```css
/* ── NAV ── */
.bd-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 var(--gutter); height: var(--nav-h);
  background: rgba(244, 240, 234, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(18, 18, 18, 0.05);
}

.bd-logo-link {
  display: flex; align-items: center;
  text-decoration: none;
  z-index: 200; position: relative;
}
.bd-logo-img {
  display: block;
  height: 64px;
  width: auto;
  object-fit: contain;
}

.bd-nav-links {
  display: flex; gap: 2.5rem; list-style: none;
}
.bd-nav-links li { position: relative; }
.bd-nav-links a {
  font-size: 0.8rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--ink-2); font-weight: 400; text-decoration: none; transition: color 0.2s;
}
.bd-nav-links a:hover { color: var(--gold-text); }

.bd-nav-actions {
  display: flex; align-items: center; gap: 1.5rem;
  z-index: 200; position: relative;
}
.bd-nav-cta {
  font-family: var(--body); font-size: 0.8rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink); font-weight: 400;
  border: 1px solid var(--ink); padding: 0 1.2rem; min-height: 44px;
  display: inline-flex; align-items: center;
  background: none; cursor: pointer; text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.bd-nav-cta:hover {
  background: var(--ink);
  color: var(--paper);
}

/* ── MEGAMENU ── */
/* .bd-nav has backdrop-filter, so it is the containing block for this fixed panel. */
.bd-megamenu-canvas {
  position: fixed;
  top: var(--nav-h);
  left: 0;
  width: 100%;
  background: var(--paper);
  border-bottom: 1px solid rgba(18, 18, 18, 0.08);
  padding: 4rem var(--gutter);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity 0.4s var(--ease-out), visibility 0.4s var(--ease-out), transform 0.4s var(--ease-out);
  z-index: 90;
}
.bd-megamenu-canvas.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.bd-megamenu-list-block {
  display: flex; flex-direction: column; gap: 1.25rem;
}
.bd-megamenu-label {
  font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--ink-3);
  margin-bottom: 0.5rem; padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(18, 18, 18, 0.05);
}
.bd-megamenu-links-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 2.5rem;
}
.bd-nav-links .bd-megamenu-link {
  font-size: 0.88rem; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--ink-2);
  display: inline-block;
  transition: color 0.3s ease, transform 0.3s var(--ease-out);
}
.bd-nav-links .bd-megamenu-link:hover {
  color: var(--gold-text);
  transform: translateX(4px);
}

.bd-megamenu-display-canvas {
  position: relative; width: 100%; height: 240px;
  overflow: hidden; background-color: var(--paper-2);
}
.bd-megamenu-preview-img {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  filter: grayscale(15%) brightness(0.95);
  opacity: 0; transform: scale(1.04);
  transition: opacity 0.4s var(--ease-out), transform 0.5s var(--ease-out);
}
.bd-megamenu-preview-img.active {
  opacity: 0.15;
  transform: scale(1);
}
.bd-megamenu-display-text {
  position: absolute; bottom: 2rem; left: 2rem; z-index: 2;
  pointer-events: none;
}
.bd-megamenu-display-h3 {
  font-family: var(--display); font-size: 2rem; line-height: 1;
  color: var(--ink); letter-spacing: 0.02em;
}
.bd-megamenu-display-sub {
  font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--ink-3); margin-top: 0.25rem;
}

/* ── HAMBURGER + MOBILE MENU ── */
.bd-hamburger {
  display: none; flex-direction: column; justify-content: center; align-items: center; gap: 6px;
  width: 44px; height: 44px;
  background: none; border: none; cursor: pointer;
}
.bd-hamburger span {
  display: block; width: 25px; height: 1px; background: var(--ink);
  transition: transform 0.3s ease;
}
.bd-hamburger.open span:nth-child(1) { transform: translateY(3.5px) rotate(45deg); }
.bd-hamburger.open span:nth-child(2) { transform: translateY(-3.5px) rotate(-45deg); }

.bd-mobile-menu {
  position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
  background: var(--paper); z-index: 99;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  opacity: 0; pointer-events: none; visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.bd-mobile-menu.active { opacity: 1; pointer-events: auto; visibility: visible; }
.bd-mobile-menu-list {
  list-style: none; text-align: center;
  display: flex; flex-direction: column; gap: 2.5rem;
}
.bd-mobile-menu-link {
  font-family: var(--display); font-size: 3.5rem; letter-spacing: 0.05em;
  color: var(--ink); text-decoration: none;
}

@media (max-width: 1024px) {
  .bd-nav-links { display: none; }
  .bd-hamburger { display: flex; }
  .bd-nav-actions { gap: 1rem; }
  .bd-megamenu-canvas { display: none; }
}

@media (max-width: 768px) {
  .bd-logo-img { height: 48px; }
}
```

- [ ] **Step 9: Create `src/styles/home.css`**

The phone hero sets `min-height` twice on purpose: `85vh` is the fallback for browsers without `svh`.

```css
/* ── HERO ── */
.bd-hero {
  min-height: 95vh;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: 3rem var(--gutter) 5rem;
  position: relative; overflow: hidden;
  background-color: var(--ink);
}
.bd-hero-bg {
  position: absolute; inset: 0;
  background-image: url("/images/bg-hero-img.jpg");
  background-size: cover; background-position: center 40%; background-repeat: no-repeat;
  transform: scale(1.02);
  filter: brightness(0.65) contrast(1.05) saturate(0.9);
}
.bd-hero-gradient {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to top, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.4) 50%, rgba(18, 18, 18, 0.1) 100%);
}
.bd-hero-noise {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}
.bd-hero-rule-v {
  position: absolute; top: 0; right: var(--gutter); bottom: 5rem; width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(244, 240, 234, 0.1) 20%, rgba(244, 240, 234, 0.1) 80%, transparent);
}
.bd-hero-scroll {
  position: absolute; bottom: 5rem; right: calc(var(--gutter) + 0.15rem);
  font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(244, 240, 234, 0.8); writing-mode: vertical-lr;
}
.bd-hero-eyebrow {
  font-size: 0.88rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(244, 240, 234, 0.85); margin-bottom: 1.5rem;
  position: relative; z-index: 2;
  animation: bdUp 0.8s ease both;
}
.bd-hero-h1 {
  font-family: var(--display); font-weight: 400;
  font-size: clamp(5rem, 14vw, 9rem);
  line-height: 0.92; letter-spacing: 0.02em; color: var(--paper);
  max-width: 860px; position: relative; z-index: 2;
}
.bd-hero-h1 span { display: block; }
.bd-hero-h1 span:nth-child(1) { animation: bdUp 0.8s 0.05s ease both; }
.bd-hero-h1 span:nth-child(2) { animation: bdUp 0.8s 0.15s ease both; }
.bd-hero-h1 span:nth-child(3) {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(244, 240, 234, 0.6);
  animation: bdUp 0.8s 0.25s ease both;
}
.bd-hero-sub {
  margin-top: 2.5rem; max-width: 440px;
  font-size: 0.93rem; color: rgba(244, 240, 234, 0.85); line-height: 1.8;
  border-left: 1px solid var(--gold); padding-left: 1.25rem;
  position: relative; z-index: 2;
  animation: bdUp 0.8s 0.45s ease both;
}
.bd-hero-btns {
  display: flex; gap: 1.25rem; margin-top: 2.5rem; flex-wrap: wrap;
  position: relative; z-index: 2;
  animation: bdUp 0.8s 0.55s ease both;
}
.bd-btn-fill,
.bd-btn-ghost {
  font-family: var(--body); font-size: 0.8rem; letter-spacing: 0.16em; font-weight: 400;
  text-transform: uppercase; text-decoration: none;
  min-height: 44px; padding: 0 2.2rem;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.bd-btn-fill {
  background: var(--paper); color: var(--ink); border: 1px solid var(--paper);
  transition: background 0.2s, transform 0.2s;
}
.bd-btn-fill:hover { background: #ffffff; transform: translateY(-1px); }
.bd-btn-ghost {
  background: none; color: var(--paper);
  border: 1px solid rgba(244, 240, 234, 0.6);
  transition: border-color 0.2s, background 0.2s;
}
.bd-btn-ghost:hover { border-color: var(--paper); background: rgba(244, 240, 234, 0.08); }

/* ── WORK: FILTERS ── */
.bd-work-section-padding { padding: 6rem var(--gutter) 0; }

.bd-filter-bar {
  display: flex; gap: 0.75rem; flex-wrap: wrap;
  margin-bottom: 2rem; list-style: none;
}
.bd-filter-btn {
  font-family: var(--body); font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase;
  background: none; border: 1px solid transparent; color: var(--ink-3);
  min-height: 44px; padding: 0 1.2rem; cursor: pointer;
  transition: color 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
}
.bd-filter-btn:hover { color: var(--ink); }
.bd-filter-btn.active {
  color: var(--ink); font-weight: 400;
  border-color: rgba(18, 18, 18, 0.15);
  background-color: var(--paper-2);
}

.bd-mobile-filter-container {
  display: none; position: relative;
  width: 100%; max-width: 400px; margin-bottom: 2rem;
}
.bd-mobile-select {
  width: 100%; min-height: 44px;
  font-family: var(--body); font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--ink); background-color: var(--paper-2);
  border: 1px solid rgba(18, 18, 18, 0.12); border-radius: 0;
  padding: 0.85rem 2.5rem 0.85rem 1.2rem; cursor: pointer;
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23121212' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 1.2rem center; background-size: 1rem;
}
.bd-mobile-select:focus { border-color: var(--ink-2); }

/* ── WORK: PROJECT ROWS ── */
.bd-work-lists { animation: bdFadeIn 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
.bd-projects { display: flex; flex-direction: column; }

.bd-proj {
  position: relative; display: block; width: 100%;
  min-height: 25vh; padding: 3.5rem var(--gutter);
  border-top: 1px solid rgba(18, 18, 18, 0.07);
  text-decoration: none;
  transition: background-color 0.3s ease;
}
.bd-projects > :last-child .bd-proj { border-bottom: 1px solid rgba(18, 18, 18, 0.07); }

.bd-proj-panel-content {
  position: relative; z-index: 3;
  display: grid; grid-template-columns: 1.1fr 0.9fr; align-items: center;
  width: 100%; gap: 4rem;
}
.bd-proj .bd-proj-num {
  font-family: var(--display); font-size: 1.1rem; letter-spacing: 0.1em;
  color: var(--ink-3); margin-bottom: 0.4rem;
}
.bd-proj .bd-proj-title {
  font-family: var(--display); font-size: clamp(2.5rem, 4.5vw, 4.2rem);
  letter-spacing: 0.02em; line-height: 1.1; color: var(--ink);
  transition: color 0.4s var(--ease-out);
}
.bd-proj-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
.bd-proj .bd-proj-tag {
  font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase;
  border: 1px solid rgba(18, 18, 18, 0.12); color: var(--ink-2);
  padding: 0.3rem 0.75rem;
}

.bd-proj-right {
  position: relative; display: block; width: 100%; height: 240px; overflow: hidden;
}
.bd-proj-panel-bg {
  position: absolute; inset: 0; z-index: 1;
  background-size: cover; background-position: center 40%; background-repeat: no-repeat;
  transform: scale(1.02);
  filter: grayscale(30%) brightness(0.95);
  transition: filter 0.5s var(--ease-out), transform 0.65s var(--ease-out);
}
.bd-proj-panel-overlay {
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(to top, rgba(18, 18, 18, 0.55) 0%, transparent 60%);
}
.bd-proj-meta-trigger {
  position: absolute; bottom: 1.25rem; right: 1.5rem; z-index: 3;
  display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem;
  opacity: 0.9; transition: opacity 0.4s var(--ease-out);
}
.bd-proj .bd-proj-year,
.bd-proj .bd-proj-arrow {
  font-size: 0.8rem; letter-spacing: 0.12em; color: var(--paper);
  text-shadow: 0 1px 3px rgba(18, 18, 18, 0.5);
}
.bd-proj .bd-proj-img { display: none; }

.bd-proj:hover { background-color: rgba(18, 18, 18, 0.02); }
.bd-proj:hover .bd-proj-title { color: var(--gold); }
.bd-proj:hover .bd-proj-panel-bg { filter: grayscale(0%) brightness(1); transform: scale(1); }
.bd-proj:hover .bd-proj-meta-trigger { opacity: 1; }

/* Touch screens never hover, so show the photos in full colour. */
@media (hover: none) {
  .bd-proj-panel-bg { filter: none; transform: none; }
}

/* ── WORK: ALSO IN PROGRESS ── */
.bd-inprogress { padding: 4rem var(--gutter) 0; }
.bd-inprogress-label {
  font-size: 0.87rem; font-weight: 400; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--ink-3); margin-bottom: 1.5rem;
}
.bd-inprogress-list {
  list-style: none;
  border-top: 1px solid rgba(18, 18, 18, 0.07);
}
.bd-inprogress-row {
  display: grid; grid-template-columns: 2fr 1fr 2fr 0.7fr; gap: 1.5rem; align-items: baseline;
  min-height: 44px; padding: 1.25rem 0;
  border-bottom: 1px solid rgba(18, 18, 18, 0.07);
  text-decoration: none; color: var(--ink-2);
}
.bd-inprogress-title {
  font-family: var(--display); font-size: 1.6rem; letter-spacing: 0.03em; line-height: 1.1;
  color: var(--ink); transition: color 0.3s ease;
}
.bd-inprogress-meta { font-size: 0.87rem; }
.bd-inprogress-row:hover .bd-inprogress-title { color: var(--gold); }

.bd-empty-state {
  padding: 2rem var(--gutter) 0;
  color: var(--ink-2);
}

/* ── STATEMENT ── */
.bd-statement {
  padding: 10rem var(--gutter);
  position: relative; overflow: hidden;
  background-color: var(--ink);
}
.bd-stmt-bg {
  position: absolute; inset: 0; z-index: 1;
  background-image: url("/images/projects/cyclone-anayas/cyclone-anayas-2.jpg");
  background-size: cover; background-position: center 50%; background-repeat: no-repeat;
  filter: brightness(0.35) contrast(1.05) saturate(0.85);
}
.bd-stmt-gradient {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: linear-gradient(to bottom, rgba(18, 18, 18, 0.5) 0%, rgba(18, 18, 18, 0.85) 100%);
}
.bd-stmt-inner { position: relative; z-index: 3; }
.bd-stmt-text {
  font-family: var(--display); font-size: clamp(2.8rem, 6vw, 5rem);
  letter-spacing: 0.03em; line-height: 1.05; color: var(--paper); max-width: 900px;
}
.bd-stmt-text em {
  font-style: normal; color: transparent;
  -webkit-text-stroke: 1.5px rgba(244, 240, 234, 0.6);
}
.bd-statement-links { display: flex; align-items: center; gap: 1.5rem; margin-top: 3rem; }
.bd-stmt-link {
  font-size: 0.8rem; letter-spacing: 0.16em; text-transform: uppercase; white-space: nowrap;
  color: rgba(244, 240, 234, 0.85); text-decoration: none;
  border-bottom: 1px solid rgba(244, 240, 234, 0.3); padding-bottom: 3px;
  transition: color 0.2s, border-color 0.2s;
}
.bd-stmt-link:hover { color: var(--paper); border-color: var(--paper); }
.bd-stmt-link-sep { color: rgba(244, 240, 234, 0.4); pointer-events: none; }

/* ── SERVICES ── */
.bd-services { padding: 5rem var(--gutter); background: var(--paper); }
.bd-svc-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  margin-top: 4rem; border-top: 1px solid rgba(18, 18, 18, 0.07);
}
.bd-svc {
  padding: 2.5rem 2rem;
  border-right: 1px solid rgba(18, 18, 18, 0.07);
  transition: background 0.2s;
}
.bd-svc:last-child { border-right: none; }
.bd-svc:hover { background: rgba(18, 18, 18, 0.02); }
.bd-svc-num { font-size: 0.8rem; letter-spacing: 0.14em; color: var(--ink-3); margin-bottom: 1.5rem; }
.bd-svc-title {
  font-family: var(--display); font-size: 1.6rem; letter-spacing: 0.06em; line-height: 1.1;
  color: var(--ink); margin-bottom: 1rem;
}
.bd-svc-desc { font-size: 0.93rem; color: var(--ink-2); line-height: 1.7; }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .bd-filter-bar { display: none; }
  .bd-mobile-filter-container { display: block; }

  .bd-svc-grid { grid-template-columns: 1fr 1fr; }
  .bd-svc { border-right: none; border-bottom: 1px solid rgba(18, 18, 18, 0.07); }
  .bd-svc:nth-child(odd) { border-right: 1px solid rgba(18, 18, 18, 0.07); }
}

@media (max-width: 768px) {
  .bd-hero { min-height: 85vh; min-height: 85svh; padding: 6rem var(--gutter) 4rem; }
  .bd-hero-rule-v,
  .bd-hero-scroll { display: none; }
  .bd-hero-btns { flex-direction: column; }
  .bd-btn-fill, .bd-btn-ghost { width: 100%; }

  .bd-work-section-padding { padding: 4rem var(--gutter) 0; }

  .bd-proj {
    padding: 2.5rem var(--gutter);
    border-top: none;
    border-bottom: 1px solid rgba(18, 18, 18, 0.08);
  }
  .bd-proj-panel-content { grid-template-columns: 1fr; gap: 1rem; align-items: start; }
  .bd-proj-right { order: -1; height: auto; overflow: visible; }
  .bd-proj .bd-proj-img {
    display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover;
  }
  .bd-proj-panel-bg,
  .bd-proj-panel-overlay { display: none; }
  .bd-proj-meta-trigger {
    position: relative; bottom: auto; right: auto;
    flex-direction: row; justify-content: space-between;
    width: 100%; margin-top: 0.75rem; opacity: 1;
  }
  .bd-proj .bd-proj-year,
  .bd-proj .bd-proj-arrow { color: var(--ink-3); text-shadow: none; }

  .bd-inprogress-row { grid-template-columns: 1fr; gap: 0.25rem; }

  .bd-statement { padding: 6rem var(--gutter); }

  .bd-svc-grid { grid-template-columns: 1fr; }
  .bd-svc { padding: 2rem 0; }
  .bd-svc:nth-child(odd) { border-right: none; }
}
```

- [ ] **Step 10: Create `src/styles/project.css`**

```css
/* ── DETAIL HEADER (project, category and about pages) ── */
.bd-detail-header {
  padding: 4rem var(--gutter);
  border-bottom: 1px solid rgba(18, 18, 18, 0.05);
}
.bd-detail-back {
  font-size: 0.8rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--ink-3); text-decoration: none;
  display: inline-flex; align-items: center; min-height: 44px;
  margin-bottom: 1.5rem; transition: color 0.2s;
}
.bd-detail-back:hover { color: var(--ink); }
.bd-detail-title {
  font-family: var(--display); font-weight: 400;
  font-size: clamp(4rem, 10vw, 8rem); line-height: 0.9;
  color: var(--ink); margin-bottom: 2.5rem;
  overflow-wrap: anywhere;
}
.bd-detail-meta {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5rem;
}
.bd-detail-meta-label {
  font-size: 0.8rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--ink-3); margin-bottom: 0.4rem;
}
.bd-detail-meta-val { color: var(--ink); font-size: 0.93rem; font-weight: 400; line-height: 1.4; }

/* ── CAROUSEL ── */
.bd-carousel-wrap { padding: var(--gutter); }
.bd-carousel {
  position: relative; width: 100%; height: 70vh;
  overflow: hidden; background: var(--paper-2);
  touch-action: pan-y;
}
.bd-carousel-img {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%; object-fit: cover;
  filter: grayscale(10%) brightness(0.95);
  opacity: 0; transition: opacity 0.5s ease-in-out;
}
.bd-carousel-img.active { opacity: 1; z-index: 1; }

.bd-carousel-btn {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
  width: 48px; height: 48px; border-radius: 50%; border: none;
  background: var(--paper); color: var(--ink);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background 0.2s, color 0.2s, transform 0.2s;
}
.bd-carousel-btn:hover {
  background: var(--ink); color: var(--paper);
  transform: translateY(-50%) scale(1.05);
}
.bd-carousel-btn.prev { left: 1.5rem; }
.bd-carousel-btn.next { right: 1.5rem; }

.bd-carousel-count {
  position: absolute; left: 1.5rem; bottom: 1.5rem; z-index: 10;
  font-size: 0.8rem; letter-spacing: 0.16em;
  color: var(--paper); background: rgba(18, 18, 18, 0.6);
  padding: 0.35rem 0.75rem;
}

.bd-carousel-dots {
  position: absolute; bottom: 0.75rem; left: 50%; transform: translateX(-50%);
  display: flex; z-index: 10;
}
/* 44px hit area around an 8px dot. */
.bd-carousel-dot {
  width: 44px; height: 44px; padding: 0;
  background: none; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.bd-carousel-dot::before {
  content: ''; width: 8px; height: 8px; border-radius: 50%;
  background: rgba(244, 240, 234, 0.5);
  transition: background 0.2s, transform 0.2s;
}
.bd-carousel-dot.active::before { background: var(--paper); transform: scale(1.3); }

/* ── BODY + NEXT PROJECT ── */
.bd-detail-body {
  padding: 4rem var(--gutter) 6rem; max-width: 900px; margin: 0 auto;
  color: var(--ink-2); font-size: 1.1rem; line-height: 1.8;
}
.bd-detail-body p { margin-bottom: 1.5rem; }

.bd-next {
  border-top: 1px solid rgba(18, 18, 18, 0.07);
  padding: 4rem var(--gutter) 6rem;
}
.bd-next-link {
  display: inline-flex; flex-direction: column; gap: 0.5rem;
  text-decoration: none;
}
.bd-next-label {
  font-size: 0.8rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--ink-3);
}
.bd-next-title {
  font-family: var(--display); font-size: clamp(2.5rem, 6vw, 5rem); line-height: 1;
  color: var(--ink); transition: color 0.3s ease;
}
.bd-next-link:hover .bd-next-title { color: var(--gold); }

/* ── NOT FOUND ── */
.bd-not-found { padding: 10rem var(--gutter); text-align: center; min-height: 80vh; }
.bd-not-found-title { font-family: var(--display); font-weight: 400; font-size: 3rem; }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .bd-detail-meta { grid-template-columns: 1fr 1fr; gap: 1.5rem; }
}

@media (max-width: 768px) {
  .bd-detail-header { padding: 3rem var(--gutter); }
  .bd-detail-meta { grid-template-columns: 1fr; gap: 1.25rem; }
  .bd-carousel { height: 50vh; }
  .bd-carousel-btn.prev { left: 1rem; }
  .bd-carousel-btn.next { right: 1rem; }
  .bd-carousel-count { top: 1rem; bottom: auto; left: 1rem; }
}
```

- [ ] **Step 11: Create `src/styles/about.css`**

```css
/* ── ABOUT ── */
.bd-about-hero { padding: 0 var(--gutter); }
.bd-about-hero-img {
  display: block; width: 100%; height: 50vh; object-fit: cover;
  filter: grayscale(10%) brightness(0.95);
}

.bd-about-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start;
  max-width: 1100px; margin: 0 auto; padding: 6rem var(--gutter);
}
.bd-about-text-block p {
  font-size: 1rem; color: var(--ink-2);
  margin-bottom: 1.5rem; line-height: 1.8;
}
.bd-founder-quote {
  font-size: 1.25rem; font-style: italic; line-height: 1.6; color: var(--ink);
  border-left: 2px solid var(--gold); padding-left: 1.5rem;
  margin-bottom: 2rem;
}
.bd-about-text-block .bd-founder-name {
  font-family: var(--display); font-size: 1.6rem; letter-spacing: 0.04em;
  color: var(--gold-text); margin-bottom: 0;
}
.bd-about-img {
  width: 100%; height: auto; object-fit: cover;
  filter: grayscale(10%) brightness(0.95);
}

@media (max-width: 768px) {
  .bd-about-hero-img { height: 35vh; }
  .bd-about-grid { grid-template-columns: 1fr; gap: 3rem; padding: 4rem var(--gutter); }
}
```

- [ ] **Step 12: Create `src/styles/contact.css`**

```css
/* ── CONTACT ── */
.bd-contact {
  padding: 6rem var(--gutter);
  background: var(--paper-2);
  border-top: 1px solid rgba(18, 18, 18, 0.05);
}
.bd-contact-inner {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start;
  max-width: 900px;
}
.bd-contact-h2 {
  font-family: var(--display); font-weight: 400;
  font-size: clamp(3rem, 7vw, 5.5rem); letter-spacing: 0.03em; line-height: 1;
  color: var(--ink);
}
.bd-contact-h2 em {
  font-style: normal; color: transparent;
  -webkit-text-stroke: 1.5px rgba(18, 18, 18, 0.55);
}

.bd-form {
  margin-top: 3rem; max-width: 400px;
  display: flex; flex-direction: column; gap: 1.5rem;
}
.bd-input,
.bd-textarea {
  width: 100%; min-height: 44px;
  background: transparent; border: none; border-radius: 0;
  border-bottom: 1px solid rgba(18, 18, 18, 0.3);
  padding: 0.75rem 0;
  font-family: var(--body); font-size: 0.95rem; color: var(--ink);
  transition: border-color 0.2s;
}
.bd-input::placeholder,
.bd-textarea::placeholder { color: var(--ink-3); }
.bd-input:focus,
.bd-textarea:focus { border-bottom-color: var(--ink); }
.bd-textarea { resize: vertical; min-height: 120px; }

.bd-submit {
  align-self: flex-start; margin-top: 1rem; min-height: 44px; padding: 0 2rem;
  font-family: var(--body); font-size: 0.8rem; letter-spacing: 0.16em; text-transform: uppercase;
  background: var(--ink); color: var(--paper); border: none; cursor: pointer;
  transition: background 0.2s;
}
.bd-submit:hover { background: var(--ink-2); }

.bd-form-msg { font-size: 0.87rem; font-weight: 400; color: var(--gold-text); }
.bd-form-msg a { color: inherit; }

.bd-contact-detail { margin-bottom: 1.75rem; }
.bd-contact-label {
  font-size: 0.8rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--ink-3); margin-bottom: 0.4rem;
}
.bd-contact-val { font-size: 0.93rem; color: var(--ink); line-height: 1.6; }
.bd-contact-val a { color: var(--ink); text-decoration: none; transition: color 0.2s; }
.bd-contact-val a:hover { color: var(--gold-text); }

.bd-social { display: flex; gap: 1.5rem; margin-top: 2.5rem; align-items: center; }
.bd-social-icon-link {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 44px; min-height: 44px;
  color: var(--ink-3);
  transition: color 0.3s var(--ease-out), transform 0.3s ease;
}
.bd-social-icon-link svg { width: 20px; height: 20px; fill: currentColor; }
.bd-social-icon-link:hover { color: var(--ink); transform: translateY(-2px); }

/* ── FOOTER ── */
.bd-footer-sub-grid {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.25rem;
  width: 100%; margin-top: 6rem; padding-top: 1.5rem;
  border-top: 1px solid rgba(18, 18, 18, 0.05);
}
.bd-footer-logo-wrap { display: flex; justify-content: center; align-items: center; text-decoration: none; }
.bd-footer-logo-wrap .bd-logo-img { height: 80px; width: auto; }
.bd-footer-copy { width: 100%; text-align: center; font-size: 0.8rem; color: var(--ink-2); }
.bd-credit-sep { color: var(--ink-3); margin: 0 0.5rem; }
.bd-agency-link {
  color: var(--ink-2); text-decoration: none;
  border-bottom: 1px solid rgba(18, 18, 18, 0.2); padding-bottom: 1px;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.bd-agency-link:hover { color: var(--gold-text); border-color: var(--gold-text); }

@media (max-width: 768px) {
  .bd-contact-inner { grid-template-columns: 1fr; }
}
```

- [ ] **Step 13: Load fonts from `index.html`**

In `index.html`, directly after the `<meta name="viewport" …>` line, add:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;1,9..40,300&display=swap" />
```

- [ ] **Step 14: Switch `src/App.jsx` to the new stylesheets and delete the old one**

In `src/App.jsx`, change `import "./App.css";` to:

```jsx
import "./styles/index.css";
```

Then:

```bash
git rm src/App.css
```

- [ ] **Step 15: Run the full suite**

Run: `npm test`
Expected: `Tests  79 passed (79)` across 8 files.

- [ ] **Step 16: Lint and build**

Run: `npm run lint && npm run build`
Expected: 0 lint problems; build succeeds with a single CSS bundle (about 24 kB, 5 kB gzipped).

- [ ] **Step 17: Commit**

```bash
git add -A src/styles src/test/css.js src/App.jsx index.html
git commit -m "style: replace App.css with tokenised per-area stylesheets (AA contrast, 12px floor, 44px targets, mobile)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: End-to-end verification in the browser

**Files:**
- Create: `scripts/verify-page.js`

**Interfaces:**
- Consumes: the production build from `npm run build` served by `npm run preview` (http://localhost:4173).
- Produces: `window.verifyPage() -> Promise<{ path, width, overflow, smallText[], brokenImages[], smallTargets[], placeholder }>` for the current page. Pass means every array is empty and `overflow` and `placeholder` are `false`.

- [ ] **Step 1: Create the verification script** `scripts/verify-page.js`

```js
// Paste into the browser console (or the browser pane's JavaScript tool) on any page of the
// production preview. Defines window.verifyPage(), which resolves to a report for the current
// page: every array should be empty, and overflow and placeholder should be false.
window.verifyPage = async () => {
  // Reveal scroll-animated content so it is measured in its final state.
  document.querySelectorAll('.reveal-fade-up').forEach((el) => el.classList.add('visible'));
  await new Promise((r) => setTimeout(r, 900));

  const visible = (el) => {
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && box.width > 0 && box.height > 0;
  };

  const smallText = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const el = node.parentElement;
    if (!node.textContent.trim() || !el || !visible(el)) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 12) smallText.push(`${el.tagName.toLowerCase()}.${el.className} "${node.textContent.trim().slice(0, 30)}" ${size}px`);
  }

  const urls = new Set();
  document.querySelectorAll('img').forEach((img) => urls.add(img.currentSrc || img.src));
  document.querySelectorAll('*').forEach((el) => {
    const m = getComputedStyle(el).backgroundImage.match(/url\("([^"]+)"\)/);
    if (m && !m[1].startsWith('data:')) urls.add(m[1]);
  });
  const brokenImages = [];
  for (const url of urls) {
    const res = await fetch(url);
    if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image/')) brokenImages.push(`${url} ${res.status}`);
  }

  const smallTargets = [...document.querySelectorAll('button, select, input, textarea, .bd-filter-btn, .bd-carousel-dot')]
    .filter(visible)
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return innerWidth <= 1024 && (r.height < 44 || r.width < 44);
    })
    .map((el) => `${el.tagName.toLowerCase()}.${el.className} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);

  return {
    path: location.pathname,
    width: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
    smallText,
    brokenImages,
    smallTargets,
    placeholder: document.body.innerHTML.includes('photos-coming-soon'),
  };
};
```

- [ ] **Step 2: Build and serve the production bundle**

Run: `npm run build && npm run preview`
Expected: `Local: http://localhost:4173/`. In the Claude desktop app, start it with `preview_start` using the existing `preview` entry in `.claude/launch.json`.

- [ ] **Step 3: Run the script on every route at 1440, 768 and 375px**

Set the viewport (browser pane `resize_window` 1440×900, 768×1024 and the `mobile` preset; or DevTools device mode). At each width, first run the whole of `scripts/verify-page.js` in the page (it defines `window.verifyPage`), then run this, which walks every route client-side:

```js
const paths = ['/', '/about',
  '/project/xo-juice-and-studio', '/project/omg-burger', '/project/greek-orthodox-cathedral',
  '/project/cyclone-anayas', '/project/haii-keii', '/project/flying-saucer-draught',
  '/project/bauhaus-houston', '/project/doubletree-by-hilton', '/project/airport-retail-spaces',
  '/category/health-wellness', '/category/restaurants-bars', '/category/nightlife',
  '/category/hospitality', '/category/retail', '/category/institutional'];
const out = [];
for (const p of paths) {
  history.pushState({}, '', p);
  dispatchEvent(new PopStateEvent('popstate'));
  await new Promise((r) => setTimeout(r, 500));
  const r = await window.verifyPage();
  const ok = !r.overflow && !r.placeholder && !r.smallText.length && !r.brokenImages.length && !r.smallTargets.length;
  out.push(ok ? `${p} OK @${r.width}` : r);
}
out;
```

Expected: 17 lines of `… OK @<width>` at each of the three widths. Also check the console: no errors.

- [ ] **Step 4: Keyboard pass at 1440px**

Starting from the address bar, press Tab repeatedly on `/`. Confirm, with the gold focus ring visible at each stop:
1. "Skip to main content" appears top-left on the first Tab; Enter jumps to the hero.
2. The nav links, then "Get in Touch".
3. Hovering "Work", then tabbing through the megamenu links: the preview panel name changes with each one.
4. Each filter button: Space toggles it and the list updates.
5. Each project row and each "Also in progress" row.
6. On `/project/haii-keii`: Tab to the carousel; Right/Left arrows change the counter. Then the Previous/Next buttons and the dots.
7. The contact form fields and "Send Message".

- [ ] **Step 5: Reduced-motion check**

If the browser can emulate `prefers-reduced-motion` (Chrome DevTools > Rendering > "Emulate CSS media feature prefers-reduced-motion: reduce"), reload `/` with it on. Hero text and project rows should appear immediately, without fade or slide. If the environment can't emulate it, ask the user to check with macOS System Settings > Accessibility > Display > Reduce motion; don't change system settings yourself. The static guard in `tokens.test.js` (`handles prefers-reduced-motion`) passes either way.

- [ ] **Step 6: Screenshots for review**

At 1440, 768 and 375px, capture: `/` (hero, work list, "Also in progress"), `/project/haii-keii` (header, carousel, next-project link), `/project/doubletree-by-hilton` (no-photo layout) and `/about`. Share them with the reviewer.

- [ ] **Step 7: Final checks and commit**

Run: `npm test && npm run lint && npm run build`
Expected: all green.

```bash
git add scripts/verify-page.js
git commit -m "test: add in-browser verification script for Phase A" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Spec coverage

| Spec section | Task |
|---|---|
| §1 Tokens | 6 (`tokens.css`, `tokens.test.js`) |
| §2 Typography | 6 (all stylesheets; `no font-size renders below 12px`) |
| §3 Interaction states (focus, ghost button, reduced motion) | 6 (`base.css`, `home.css`), 7 (Steps 4–5) |
| §4 Data | 2 |
| §5 Home: work list, filters, statement, services | 3 (markup), 6 (`home.css`) |
| §6 Navigation | 5 (markup), 6 (`nav.css`) |
| §7 Project page | 4 (markup), 6 (`project.css`) |
| §8 About | 5 (markup), 6 (`about.css`) |
| §9 Mobile | 6 (responsive rules, `layout.test.js`), 7 (375px run) |
| §10 Code cleanup | 1 (lint config), 4 and 5 (lint fixes, inline styles), 6 (`!important`, FIXED comments, marquee, fixed backgrounds) |
| Verification | 7 |
