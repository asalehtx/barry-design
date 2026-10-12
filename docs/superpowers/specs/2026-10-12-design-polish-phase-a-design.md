# Barry Design Studio — Design Polish, Phase A

**Date:** 2026-10-12
**Client:** Yousef Elbarry, Barry Design Studio
**Prepared by:** Hear Hear Agency
**Status:** Draft, awaiting review

## Goal

Make the existing site sharper, more legible and properly usable on phones without changing its identity. Keep Bebas Neue + DM Sans, the warm paper palette and the current page structure. Leave the codebase clean enough that Phase B (a Remotion hero reel leading with Yousef's interiors) can read project data from one place.

## Success criteria

- Every text/background pair used for text meets WCAG AA (4.5:1 for small text, 3:1 for text ≥ 24px or ≥ 18.66px bold).
- No rendered text smaller than 12px.
- No horizontal scroll at 375px width; all tap targets ≥ 44px on touch layouts.
- Visible keyboard focus on every interactive element.
- No "photos coming soon" placeholder images anywhere on the site.
- `npm run build` and `npm run lint` both pass with zero errors.
- No console errors or 404s on `/`, `/about`, `/project/:id` (all 9) and `/category/:slug` (all 6).

## Out of scope

- Hero image and hero concept (Phase B, separate spec). Phase A only fixes hero legibility and button contrast.
- Remotion, video, or any new motion beyond what exists.
- New fonts, new palette direction, new page structures.
- Contact form backend (stays mailto) and social links (stay hidden until URLs arrive).

## 1. Tokens

Rename tokens so names match their values. All existing usages are migrated; the old names are removed.

| Token | Value | Use | Contrast on `--paper` / `--paper-2` |
|---|---|---|---|
| `--paper` | `#f4f0ea` | page background | — |
| `--paper-2` | `#ebe5dd` | contact area, filter fills | — |
| `--ink` | `#121212` | primary text, dark sections | 16.50 / 14.97 |
| `--ink-2` | `#4a4a4a` | body text | 7.81 / 7.08 |
| `--ink-3` | `#646464` | labels, secondary text | 5.21 / 4.73 |
| `--gold` | `#a38757` | rules, borders, large display text only | 3.00 / 2.72 |
| `--gold-text` | `#735d30` | gold used at small sizes (links, form note, hover) | 5.54 / 5.03 |
| `--nav-h` | `88px` (72px ≤ 768px) | nav height; megamenu offset | — |

Rule: `--gold` is never used for text under 24px. Small gold text uses `--gold-text`.

Light-on-dark text (hero, statement) keeps `--paper` at full opacity for headings and at ≥ 0.8 opacity for supporting text, over the existing dark gradients.

## 2. Typography

- Minimum rendered size: 12px (0.8rem at the 15px root).
- Labels, eyebrows, tags, meta labels, nav links, button text: 12px, existing letter-spacing and uppercase kept.
- Service descriptions and other small body copy: ~14px (0.93rem).
- Body: DM Sans 300, 15px, unchanged.
- Bebas display sizes unchanged.
- Outlined display words ("SPACES", "COMMERCIAL", "HELLO"): stroke raised to 1.5px at higher opacity (light-on-dark ≥ 0.6, dark-on-light ≥ 0.55) so they read as type, not texture.
- About page body text: left-aligned, not justified.

## 3. Interaction states

- `:focus-visible` on all links, buttons, inputs, select and carousel controls: 2px `--gold` outline with 3px offset. Inputs keep their bottom-border focus change in addition.
- Hero "Our Process" ghost button: solid 1px `--paper` border at ≥ 0.6 opacity.
- `prefers-reduced-motion: reduce`: reveal animations, hero `bdUp` entrance and hover scale transforms are disabled; content renders in its final state.

## 4. Data

New file `src/data/projects.js` exports `PROJECTS` and `SERVICES`, moved from `App.jsx`.

Project shape changes:

- `gallery`: array of image paths; `[]` when no photos exist. The `photos-coming-soon.png` references are removed.
- `img`: cover image path, or `null` when `gallery` is empty.
- `procurement`: boolean, default `false` for all nine projects until Yousef confirms (see checklist below).
- `num` is removed from the data; display numbers are derived from position in the photographed list.

Helper: `hasPhotos(project)` returns `project.gallery.length > 0`.

## 5. Home page

### Work list

- Photographed projects (currently XO, OMG Burger, Cyclone Anayas, Haii Keii, Bauhaus, in that order) render as full image rows, numbered 01–05.
- Projects without photos (Greek Orthodox Cathedral, Flying Saucer Draught DFW, DoubleTree by Hilton, MSY Airport Retail) render below in an "Also in progress" compact list: one text row each with title, category, location and area, linking to the project page. No image.
- Row thumbnails: remove `background-attachment: fixed`. Default filter `grayscale(30%)`; hover goes to full colour. Under `@media (hover: none)`, thumbnails are always full colour.
- Hidden duplicate `<img>` inside each row is used for the mobile layout instead of the background div (see §9), so the image has proper alt text.

### Filters

- All filter buttons filter in place on the home page (state only, no navigation). Both lists (rows and compact list) respect the filter.
- The mobile `<select>` filters in place; the `window.location.href` reload is removed.
- A filter with no matching projects in either list shows a one-line empty state.
- Category pages (`/category/:slug`) remain and are linked from the megamenu; they use the same two-list layout.

### Statement

- Background image changes from `omg-burger-1.jpg` to `cyclone-anayas-2.jpg`.
- "About Yousef" / "Our Process" links: `--paper` at 0.85 opacity, 12px.

### Services

- Description text to ~14px, `--ink-2`.
- Grid stacks to 2 columns ≤ 1024px, 1 column ≤ 768px, with horizontal dividers replacing vertical ones when stacked.

## 6. Navigation

- Nav height `--nav-h` (88px desktop); logo 64px tall.
- Megamenu `top` uses `var(--nav-h)` so it sits flush under the nav.
- Megamenu previews:
  - All Projects → `haii-keii-1.jpg`
  - Health & Wellness → `xo-1.jpg`
  - Restaurants & Bars → `cyclone-anayas-1.jpg`
  - Nightlife → `bauhaus-1.jpg`
  - Hospitality, Retail, Institutional → no image; the display panel shows the category name and sub-label on `--paper-2`.
- Mobile menu links move from inline styles to classes.

## 7. Project detail page

- Header top padding reduced from 8rem to 4rem (the sticky nav already provides offset).
- Meta grid: 4 columns desktop, 2 columns ≤ 1024px, 1 column ≤ 768px.
- Carousel (only when `hasPhotos`):
  - Image counter "n / total" in the bottom-left.
  - Left/Right arrow keys move between images when the carousel has focus.
  - Horizontal swipe (≥ 50px) moves between images on touch.
  - Prev/next buttons ≥ 44px.
- Projects without photos: no carousel; the description sits directly under the header.
- The procurement paragraph renders only when `procurement` is `true`.
- "Next project" link at the bottom: title of the next project in data order, wrapping from last to first, styled as a large Bebas link with a 12px "Next project" label above.
- Fix existing lint error: reset `currentIdx` on route change via `key={id}` on the component instead of `setState` inside an effect.

## 8. About page

- Eyebrow "Founder, Barry Design Studio"; title "YOUSEF ELBARRY" (replaces "ABOUT US").
- Founder quote: left-aligned, 2px `--gold` rule on the left.
- Body paragraphs left-aligned.
- The closing name line uses `--gold-text`.
- All inline styles moved into `App.css` classes.

## 9. Mobile (≤ 768px)

- Nav 72px, logo 48px, hamburger button ≥ 44 × 44px.
- Project rows stack: full-width image (aspect-ratio 4 / 3) first, then number, title and tags.
- Hero uses `min-height: 85svh` (fallback `85vh`); buttons stack full-width.
- Filter buttons, carousel controls, form inputs and submit: ≥ 44px tall.
- No horizontal overflow at 375px.

## 10. Code cleanup

- Inline `style={{…}}` props in `App.jsx` replaced by classes.
- `!important` removed from megamenu rules where specificity makes it unnecessary.
- Stale "FIXED:" / process comments removed.
- Unused `.bd-marquee*` styles removed (no markup uses them).
- Fix existing lint warning in `ScrollReveal` (copy `elementRef.current` into a local inside the effect).

## Verification

Run against `npm run build` + `vite preview`, at 1440, 768 and 375px widths:

1. `npm run lint` and `npm run build` pass with zero errors.
2. Every route listed in Success criteria loads with no console errors; every image request returns 200.
3. Script check: computed font-size ≥ 12px for every visible text node; contrast recalculated for every token pair in §1.
4. Keyboard pass: Tab through nav, megamenu, filters, project rows, carousel (including arrow keys) and form; focus ring visible throughout.
5. At 375px: `document.documentElement.scrollWidth === innerWidth` on every route.
6. `prefers-reduced-motion: reduce` emulated: content visible without animation.
7. Visual screenshots of home, a photographed project, a no-photo project and About at each width for review.

## Checklist for Yousef

To complete before launch. None of these block Phase A.

- [ ] Which projects included procurement and installation? (Sets `procurement: true`.)
- [ ] Photos for Greek Orthodox Cathedral, Flying Saucer Draught DFW, DoubleTree by Hilton and MSY Airport Retail.
- [ ] Verified area for Greek Orthodox Cathedral (currently "Pending Verification").
- [ ] Instagram, Facebook and LinkedIn URLs.
