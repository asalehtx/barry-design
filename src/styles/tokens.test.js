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

  it('removes animation delays under reduced motion so content shows in its final state at once', () => {
    const all = rules.filter((r) => r.atRule?.includes('prefers-reduced-motion') && r.selector.includes('*'))
    expect(all.some((r) => /animation-delay:\s*0s !important/.test(r.body))).toBe(true)
  })

  it('drops the carousel button hover scale under reduced motion', () => {
    const hover = rules.find((r) => r.atRule?.includes('prefers-reduced-motion') && r.selector.includes('.bd-carousel-btn:hover'))
    expect(hover?.body).toMatch(/transform:\s*translateY\(-50%\) !important/)
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
