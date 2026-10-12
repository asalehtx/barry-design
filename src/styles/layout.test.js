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
