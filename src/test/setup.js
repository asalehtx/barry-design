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
