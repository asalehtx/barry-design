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
