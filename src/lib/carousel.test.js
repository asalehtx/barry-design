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
    expect(swipeStep({ x: 300, y: 400 }, { x: 200, y: 400 })).toBe(1)
    expect(swipeStep({ x: 200, y: 400 }, { x: 300, y: 400 })).toBe(-1)
  })

  it('ignores movements shorter than the threshold', () => {
    expect(swipeStep({ x: 300, y: 400 }, { x: 260, y: 400 })).toBe(0)
    expect(swipeStep({ x: 300, y: 400 }, { x: 250, y: 400 })).toBe(1)
  })

  it('ignores a mostly vertical scroll that drifts sideways', () => {
    expect(swipeStep({ x: 200, y: 600 }, { x: 140, y: 250 })).toBe(0)
  })

  it('ignores a diagonal where vertical movement equals horizontal', () => {
    expect(swipeStep({ x: 300, y: 300 }, { x: 200, y: 200 })).toBe(0)
  })
})
