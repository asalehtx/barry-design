import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { ProjectCategory, Work } from './App'
import { PROJECTS } from './data/projects'
import { renderAt } from './test/render'

const rowTitles = () =>
  screen.queryAllByRole('link', { name: /^View project:/ }).map((a) => a.getAttribute('aria-label').replace('View project: ', ''))

const inProgressTitles = () => {
  const section = screen.queryByRole('region', { name: /^(Also in|In) progress$/ })
  if (!section) return []
  return within(section).getAllByRole('link').map((a) => a.querySelector('.bd-inprogress-title').textContent)
}

describe('Work list', () => {
  it('shows photographed projects as numbered rows and the rest as a compact list', () => {
    renderAt(<Work />)
    expect(rowTitles()).toEqual(['XO JUICE AND STUDIO', 'OMG BURGER', 'CYCLONE ANAYAS', 'HAII KEII', 'BAUHAUS HOUSTON'])
    expect(document.querySelectorAll('.bd-proj-num')[4].textContent).toBe('05')
    expect(inProgressTitles()).toEqual([
      'GREEK ORTHODOX CATHEDRAL',
      'FLYING SAUCER DRAUGHT',
      'DOUBLETREE BY HILTON',
      'AIRPORT RETAIL SPACES',
    ])
  })

  it('never renders the placeholder image', () => {
    renderAt(<Work />)
    expect(document.body.innerHTML).not.toContain('photos-coming-soon')
  })

  it('filters both lists in place from the buttons', async () => {
    const user = userEvent.setup()
    renderAt(<Work />)

    await user.click(screen.getByRole('button', { name: 'Nightlife' }))
    expect(rowTitles()).toEqual(['BAUHAUS HOUSTON'])
    expect(inProgressTitles()).toEqual([])
    expect(screen.getByRole('button', { name: 'Nightlife' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Retail' }))
    expect(rowTitles()).toEqual([])
    expect(inProgressTitles()).toEqual(['AIRPORT RETAIL SPACES'])

    await user.click(screen.getByRole('button', { name: 'Restaurants & Bars' }))
    expect(rowTitles()).toEqual(['OMG BURGER', 'CYCLONE ANAYAS', 'HAII KEII'])
    expect(document.querySelectorAll('.bd-proj-num')[0].textContent).toBe('01')
    expect(inProgressTitles()).toEqual(['FLYING SAUCER DRAUGHT'])
  })

  it('heads the compact list "Also in progress" only when photographed projects precede it', async () => {
    const user = userEvent.setup()
    renderAt(<Work />)
    expect(screen.getByRole('region', { name: 'Also in progress' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retail' }))
    expect(screen.getByRole('region', { name: 'In progress' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Also in progress' })).toBeNull()
  })

  it('filters in place from the phone dropdown', async () => {
    const user = userEvent.setup()
    renderAt(<Work />)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter projects by category' }), 'Hospitality')
    expect(rowTitles()).toEqual([])
    expect(inProgressTitles()).toEqual(['DOUBLETREE BY HILTON'])
  })

  it('shows an empty state when a filter matches nothing', async () => {
    const user = userEvent.setup()
    renderAt(<Work projects={PROJECTS.filter((p) => p.category !== 'Nightlife')} />)
    await user.click(screen.getByRole('button', { name: 'Nightlife' }))
    expect(screen.getByText('No projects in this category yet.')).toBeInTheDocument()
  })
})

describe('Category page', () => {
  const renderCategory = (slug) =>
    renderAt(
      <Routes>
        <Route path="/category/:slug" element={<ProjectCategory />} />
      </Routes>,
      `/category/${slug}`,
    )

  it('uses the same two-list layout', () => {
    renderCategory('restaurants-bars')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('RESTAURANTS & BARS')
    expect(rowTitles()).toEqual(['OMG BURGER', 'CYCLONE ANAYAS', 'HAII KEII'])
    expect(inProgressTitles()).toEqual(['FLYING SAUCER DRAUGHT'])
  })

  it('shows a not-found heading for an unknown slug', () => {
    renderCategory('nope')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Category Not Found')
  })
})
