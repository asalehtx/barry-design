import { describe, it, expect } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import BarryDesignStudio from './App'

const renderHome = () => {
  window.history.pushState({}, '', '/')
  return render(<BarryDesignStudio />)
}

const heroVideo = () => document.querySelector('.bd-hero-video')
const badge = () => screen.getByRole('link', { name: /Now showing/ })

// Make window.matchMedia match only the given queries; the shared setup resets it after each test.
const matchOnly = (...queries) =>
  window.matchMedia.mockImplementation((query) => ({ matches: queries.includes(query), media: query }))

describe('hero media', () => {
  it('always renders the responsive poster', () => {
    renderHome()
    const picture = document.querySelector('.bd-hero-poster')
    expect(picture.querySelector('source')).toHaveAttribute('srcset', '/video/hero-poster-9x16.webp')
    expect(picture.querySelector('source')).toHaveAttribute('media', '(max-width: 768px)')
    expect(picture.querySelector('img')).toHaveAttribute('src', '/video/hero-poster-16x9.webp')
  })

  it('plays the muted 16:9 reel, WebM first, on larger screens', () => {
    renderHome()
    const video = heroVideo()
    expect(video.muted).toBe(true)
    expect(video.loop).toBe(true)
    expect([...video.querySelectorAll('source')].map((s) => s.getAttribute('src'))).toEqual([
      '/video/hero-16x9.webm',
      '/video/hero-16x9.mp4',
    ])
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('plays the 9:16 cut on phones', () => {
    matchOnly('(max-width: 768px)')
    renderHome()
    expect(heroVideo().querySelector('source')).toHaveAttribute('src', '/video/hero-9x16.webm')
  })

  it.each([
    ['reduced motion', () => matchOnly('(prefers-reduced-motion: reduce)')],
    ['Data Saver', () => { navigator.connection = { saveData: true } }],
    ['a 2g connection', () => { navigator.connection = { effectiveType: '2g' } }],
  ])('requests no video for %s', (_, arrange) => {
    arrange()
    renderHome()
    expect(heroVideo()).toBeNull()
    expect(document.querySelector('.bd-hero-poster img')).toBeInTheDocument()
  })

  it('reveals the video only once it is actually playing', () => {
    renderHome()
    expect(heroVideo()).not.toHaveClass('is-playing')
    fireEvent.playing(heroVideo())
    expect(heroVideo()).toHaveClass('is-playing')
  })

  it('keeps the poster when autoplay is refused', async () => {
    window.HTMLMediaElement.prototype.play.mockImplementationOnce(() => Promise.reject(new Error('NotAllowedError')))
    renderHome()
    await act(async () => {})
    expect(heroVideo()).not.toHaveClass('is-playing')
  })
})

describe('hero badge', () => {
  const at = (seconds) => {
    Object.defineProperty(heroVideo(), 'currentTime', { value: seconds, configurable: true })
    fireEvent.timeUpdate(heroVideo())
  }

  it('names XO first and links to it', () => {
    renderHome()
    expect(badge()).toHaveTextContent('XO JUICE AND STUDIO')
    expect(badge()).toHaveAttribute('href', '/project/xo-juice-and-studio')
  })

  it('follows the video through OMG Burger and Haii Keii, then back to XO', () => {
    renderHome()
    at(5.1)
    expect(badge()).toHaveAttribute('href', '/project/omg-burger')
    at(10.2)
    expect(badge()).toHaveAttribute('href', '/project/haii-keii')
    at(0.1)
    expect(badge()).toHaveAttribute('href', '/project/xo-juice-and-studio')
  })

  it('keeps keyboard focus on the badge when the project changes', () => {
    renderHome()
    badge().focus()
    at(5.1)
    expect(badge()).toHaveAttribute('href', '/project/omg-burger')
    expect(badge()).toHaveFocus()
  })

  it('stays on XO when only the poster shows', () => {
    matchOnly('(prefers-reduced-motion: reduce)')
    renderHome()
    expect(badge()).toHaveAttribute('href', '/project/xo-juice-and-studio')
  })
})

describe('hero pause control', () => {
  const pauseButton = () => screen.getByRole('button', { name: /pause background video/i })

  it('pauses the reel, then plays it again', () => {
    renderHome()
    const { pause, play } = window.HTMLMediaElement.prototype
    play.mockClear()
    fireEvent.click(pauseButton())
    expect(pause).toHaveBeenCalledTimes(1)
    const playButton = screen.getByRole('button', { name: /play background video/i })
    fireEvent.click(playButton)
    expect(play).toHaveBeenCalledTimes(1)
    expect(pauseButton()).toBeInTheDocument()
  })

  it('is absent when only the poster shows', () => {
    matchOnly('(prefers-reduced-motion: reduce)')
    renderHome()
    expect(screen.queryByRole('button', { name: /background video/i })).toBeNull()
  })
})

describe('retired hero pieces', () => {
  it('no longer renders the stock background or the scroll label', () => {
    renderHome()
    expect(document.querySelector('.bd-hero-bg')).toBeNull()
    expect(document.querySelector('.bd-hero-scroll')).toBeNull()
  })
})
