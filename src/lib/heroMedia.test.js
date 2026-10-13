import { describe, it, expect } from 'vitest'
import { heroSources, shouldShowPosterOnly } from './heroMedia'

// A matchMedia stand-in that matches only the queries listed.
const mediaMatching = (...queries) => (query) => ({ matches: queries.includes(query) })

describe('shouldShowPosterOnly', () => {
  it('plays the reel by default', () => {
    expect(shouldShowPosterOnly({ matchMedia: mediaMatching(), connection: undefined })).toBe(false)
  })

  it.each([
    ['reduced motion', { matchMedia: mediaMatching('(prefers-reduced-motion: reduce)') }],
    ['reduced data', { matchMedia: mediaMatching('(prefers-reduced-data: reduce)') }],
    ['Data Saver', { matchMedia: mediaMatching(), connection: { saveData: true } }],
    ['a 2g connection', { matchMedia: mediaMatching(), connection: { effectiveType: '2g' } }],
    ['a slow-2g connection', { matchMedia: mediaMatching(), connection: { effectiveType: 'slow-2g' } }],
  ])('shows only the poster for %s', (_, env) => {
    expect(shouldShowPosterOnly(env)).toBe(true)
  })

  it('still plays on a 3g or 4g connection without Data Saver', () => {
    expect(shouldShowPosterOnly({ matchMedia: mediaMatching(), connection: { effectiveType: '3g', saveData: false } })).toBe(false)
    expect(shouldShowPosterOnly({ matchMedia: mediaMatching(), connection: { effectiveType: '4g' } })).toBe(false)
  })
})

describe('heroSources', () => {
  it('serves the 16:9 cut, WebM first, on larger screens', () => {
    expect(heroSources(false)).toEqual([
      { src: '/video/hero-16x9.webm', type: 'video/webm' },
      { src: '/video/hero-16x9.mp4', type: 'video/mp4' },
    ])
  })

  it('serves the 9:16 cut on phones', () => {
    expect(heroSources(true).map((s) => s.src)).toEqual(['/video/hero-9x16.webm', '/video/hero-9x16.mp4'])
  })
})
