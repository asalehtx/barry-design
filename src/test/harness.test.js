import { describe, it, expect } from 'vitest'

describe('test harness', () => {
  it('runs in jsdom with the stubs installed', () => {
    expect(typeof document.createElement).toBe('function')
    expect(typeof IntersectionObserver).toBe('function')
  })
})
