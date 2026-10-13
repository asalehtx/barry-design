import { describe, it, expect, beforeEach } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BarryDesignStudio from './App'

// The whole app, using its own BrowserRouter, starting at `path`.
const renderApp = (path) => {
  window.history.pushState({}, '', path)
  return render(<BarryDesignStudio />)
}

const rowCount = () => screen.queryAllByRole('link', { name: /^View project:/ }).length

beforeEach(() => {
  window.scrollTo.mockClear()
})

describe('skip link', () => {
  it.each(['/', '/about', '/project/haii-keii', '/category/retail'])('has a #main target on %s', (path) => {
    renderApp(path)
    const main = document.getElementById('main')
    expect(main).not.toBeNull()
    expect(within(main).getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main')
  })
})

describe('links to the full work list', () => {
  it('clears an active filter when "All Projects" is chosen from the menu', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(screen.getByRole('button', { name: 'Nightlife' }))
    expect(rowCount()).toBe(1)
    await user.click(screen.getByRole('link', { name: 'All Projects' }))
    expect(rowCount()).toBe(5)
  })
})

describe('not-found pages', () => {
  it.each([
    ['/no-such-page', 'Page Not Found'],
    ['/about/extra', 'Page Not Found'],
    ['/project/no-such-project', 'Project Not Found'],
    ['/category/no-such-category', 'Category Not Found'],
  ])('%s shows "%s" with ways back', (path, title) => {
    renderApp(path)
    const main = document.getElementById('main')
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent(title)
    expect(within(main).getByText('This page may have moved, or the link may be mistyped.')).toBeInTheDocument()
    expect(within(main).getByRole('link', { name: /Back to Home/ })).toHaveAttribute('href', '/')
    expect(within(main).getByRole('link', { name: /View all projects/ })).toHaveAttribute('href', '/#work')
  })
})

describe('work filter in the URL', () => {
  const pressed = (name) => screen.getByRole('button', { name })

  it('records the filter in the URL without adding history entries', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const entries = window.history.length
    await user.click(pressed('Nightlife'))
    expect(window.location.search).toBe('?category=nightlife')
    await user.click(pressed('Restaurants & Bars'))
    expect(window.location.search).toBe('?category=restaurants-bars')
    await user.click(pressed('All Projects'))
    expect(window.location.search).toBe('')
    expect(window.history.length).toBe(entries)
  })

  it('does not scroll the page when the filter changes', async () => {
    const user = userEvent.setup()
    renderApp('/')
    window.scrollTo.mockClear()
    Element.prototype.scrollIntoView.mockClear()
    await user.click(pressed('Nightlife'))
    await act(async () => new Promise((r) => setTimeout(r, 150)))
    expect(window.scrollTo).not.toHaveBeenCalled()
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('opens a shared filtered link with the filter applied', () => {
    renderApp('/?category=retail')
    expect(pressed('Retail')).toHaveAttribute('aria-pressed', 'true')
    expect(rowCount()).toBe(0)
  })

  it('treats an unknown category as All Projects', () => {
    renderApp('/?category=no-such-category')
    expect(pressed('All Projects')).toHaveAttribute('aria-pressed', 'true')
    expect(rowCount()).toBe(5)
  })

  it('keeps the filter after visiting a project and going Back, and returns to the work list', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(pressed('Nightlife'))
    await user.click(screen.getByRole('link', { name: 'View project: BAUHAUS HOUSTON' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BAUHAUS HOUSTON')
    Element.prototype.scrollIntoView.mockClear()
    await act(async () => window.history.back())
    await waitFor(() => expect(pressed('Nightlife')).toHaveAttribute('aria-pressed', 'true'))
    expect(rowCount()).toBe(1)
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView.mock.contexts).toContain(document.getElementById('work')),
    )
  })
})

describe('scroll on page change', () => {
  it.each(['/about', '/project/haii-keii', '/category/retail', '/no-such-page'])('jumps to the top instantly on %s', (path) => {
    renderApp(path)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
  })
})
