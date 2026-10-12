import { describe, it, expect } from 'vitest'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { About, Nav } from './App'
import { renderAt } from './test/render'

describe('About page', () => {
  it('leads with Yousef by name', () => {
    renderAt(<About />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('YOUSEF ELBARRY')
    expect(screen.getByText('Founder, Barry Design Studio')).toBeInTheDocument()
  })

  it('has no inline styles', () => {
    const { container } = renderAt(<About />)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })
})

describe('Navigation', () => {
  it('only renders preview images for categories that have photos', () => {
    renderAt(<Nav />)
    const previews = screen.getByTestId('megamenu-display').querySelectorAll('.bd-megamenu-preview-img')
    expect(previews).toHaveLength(4)
    expect(document.body.innerHTML).not.toContain('photos-coming-soon')
  })

  it('shows a text-only panel for a category without photos', async () => {
    const user = userEvent.setup()
    renderAt(<Nav />)
    await user.hover(screen.getByRole('link', { name: 'Retail' }))
    const display = screen.getByTestId('megamenu-display')
    expect(display).toHaveTextContent('RETAIL')
    expect(display.querySelector('.bd-megamenu-preview-img.active')).toBeNull()
  })

  it('updates the preview when a category link gets keyboard focus', () => {
    renderAt(<Nav />)
    act(() => screen.getByRole('link', { name: 'Nightlife' }).focus())
    expect(screen.getByTestId('megamenu-display')).toHaveTextContent('NIGHTLIFE')
  })

  it('has no inline styles outside the dynamic preview backgrounds', () => {
    const { container } = renderAt(<Nav />)
    const styled = [...container.querySelectorAll('[style]')]
    expect(styled.every((el) => el.classList.contains('bd-megamenu-preview-img'))).toBe(true)
  })
})
