import { describe, it, expect } from 'vitest'
import { DRAW_END, EARLY_START, cameraScale, lineProgress, linesOpacity, photoOpacity } from './beats.js'

describe('segment beats (spec §2)', () => {
  it('starts on pure ground: no photo and no drawn line at frame 0', () => {
    expect(photoOpacity(0)).toBe(0)
    expect(lineProgress(0, 0, 60, 0)).toBe(0)
  })

  it('finishes drawing every line by 1.6s, including segments that start early', () => {
    for (const start of [0, EARLY_START]) {
      expect(lineProgress(DRAW_END, 0, 60, start)).toBe(1)
      expect(lineProgress(DRAW_END, 59, 60, start)).toBe(1)
    }
  })

  it('draws in order: the first line leads the last', () => {
    expect(lineProgress(12, 0, 60, 0)).toBeGreaterThan(lineProgress(12, 59, 60, 0))
  })

  it('raises the photo from 1.6s to 2.6s and holds it until 4.4s', () => {
    expect(photoOpacity(48)).toBe(0)
    expect(photoOpacity(78)).toBe(1)
    expect(photoOpacity(132)).toBe(1)
  })

  it('returns to pure ground by frame 147 so the loop seam is exact', () => {
    expect(photoOpacity(147)).toBe(0)
    expect(photoOpacity(149)).toBe(0)
    expect(linesOpacity(147)).toBe(0)
  })

  it('fades lines from 70% to 15% as the photo rises, then out by 4.4s', () => {
    expect(linesOpacity(0)).toBeCloseTo(0.7)
    expect(linesOpacity(78)).toBeCloseTo(0.15)
    expect(linesOpacity(132)).toBe(0)
  })

  it('pushes in to the segment cap and no further', () => {
    expect(cameraScale(0, 1.06)).toBe(1)
    expect(cameraScale(48, 1.06)).toBeCloseTo(1.02)
    expect(cameraScale(149, 1.04)).toBeCloseTo(1.04)
  })
})
