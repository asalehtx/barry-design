import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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

describe('scroll on page change', () => {
  it.each(['/about', '/project/haii-keii', '/category/retail'])('jumps to the top instantly on %s', (path) => {
    renderApp(path)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
  })
})
