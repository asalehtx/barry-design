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

  it('opens the megamenu for keyboard focus, not only hover', () => {
    const rule = rules.find((r) => r.selector.includes(':focus-within') && r.selector.includes('.bd-megamenu-canvas'))
    expect(rule?.body).toMatch(/visibility:\s*visible/)
    expect(rule?.body).toMatch(/opacity:\s*1/)
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

// iOS Safari zooms the page when a focused control's text is under 16px.
describe('phone form controls', () => {
  it('uses 16px text in the phone filter dropdown', () => {
    expect(value('.bd-mobile-select', 'font-size', 'max-width: 1024px')).toBe('16px')
  })

  it.each(['.bd-input', '.bd-textarea'])('uses 16px text in %s on phones', (selector) => {
    expect(value(selector, 'font-size', 'max-width: 768px')).toBe('16px')
  })
})

describe('skip-link target', () => {
  it('does not draw a focus ring around the whole page when the skip link focuses <main>', () => {
    expect(value('#main:focus', 'outline')).toBe('none')
  })
})

describe('hero reel', () => {
  it('darkens the hero enough for text over the reel (stops mirrored in reel/tools/check_renders.py)', () => {
    expect(value('.bd-hero-gradient', 'background')).toBe(
      'linear-gradient(to top, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.65) 50%, rgba(18, 18, 18, 0.35) 100%)',
    )
    expect(value('.bd-hero-gradient', 'background', 'max-width: 768px')).toBe(
      'linear-gradient(to top, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.75) 50%, rgba(18, 18, 18, 0.45) 100%)',
    )
  })

  it('keeps the video hidden until it plays, then fades it in', () => {
    expect(value('.bd-hero-video', 'opacity')).toBe('0')
    expect(value('.bd-hero-video.is-playing', 'opacity')).toBe('1')
  })

  it('puts the badge bottom-right on desktop and top-right on phones, with a 44px target', () => {
    expect(value('.bd-hero-badge', 'bottom')).toBe('5rem')
    expect(value('.bd-hero-badge', 'top', 'max-width: 768px')).toBe('1rem')
    expect(px(value('.bd-hero-badge', 'min-height'))).toBeGreaterThanOrEqual(44)
  })
})
