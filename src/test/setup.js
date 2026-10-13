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

// jsdom has neither matchMedia nor media playback. By default no media query matches,
// play() succeeds and pause() is a no-op; tests override these with mockImplementation and
// they reset after each test.
const noQueryMatches = (query) => ({ matches: false, media: query })
const playSucceeds = () => Promise.resolve()
window.matchMedia = vi.fn(noQueryMatches)
window.HTMLMediaElement.prototype.play = vi.fn(playSucceeds)
window.HTMLMediaElement.prototype.pause = vi.fn()

afterEach(() => {
  cleanup()
  window.matchMedia.mockImplementation(noQueryMatches)
  window.HTMLMediaElement.prototype.play.mockImplementation(playSucceeds)
  window.HTMLMediaElement.prototype.pause.mockClear()
  delete navigator.connection
})
