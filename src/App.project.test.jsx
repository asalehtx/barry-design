import { describe, it, expect } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { ProjectDetailRoute } from './App'
import { PROCUREMENT_COPY, PROJECTS } from './data/projects'
import { renderAt } from './test/render'

const renderProject = (id) =>
  renderAt(
    <Routes>
      <Route path="/project/:id" element={<ProjectDetailRoute />} />
    </Routes>,
    `/project/${id}`,
  )

describe('Project page', () => {
  it('shows an image counter and moves with the buttons, wrapping at the ends', async () => {
    const user = userEvent.setup()
    renderProject('haii-keii')
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Previous image' }))
    expect(screen.getByText('5 / 5')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next image' }))
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('moves with the arrow keys when the carousel has focus', async () => {
    const user = userEvent.setup()
    renderProject('haii-keii')
    screen.getByRole('region', { name: 'HAII KEII gallery' }).focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText('3 / 5')).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('moves on a swipe of 50px or more and ignores shorter ones', () => {
    renderProject('haii-keii')
    const carousel = screen.getByRole('region', { name: 'HAII KEII gallery' })
    fireEvent.touchStart(carousel, { touches: [{ clientX: 300, clientY: 400 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 280, clientY: 400 }] })
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    fireEvent.touchStart(carousel, { touches: [{ clientX: 300, clientY: 400 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 200, clientY: 400 }] })
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('does not change image when a vertical scroll drifts sideways', () => {
    renderProject('xo-juice-and-studio')
    const carousel = screen.getByRole('region', { name: 'XO JUICE AND STUDIO gallery' })
    fireEvent.touchStart(carousel, { touches: [{ clientX: 200, clientY: 600 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 140, clientY: 250 }] })
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('ignores a cancelled touch', () => {
    renderProject('xo-juice-and-studio')
    const carousel = screen.getByRole('region', { name: 'XO JUICE AND STUDIO gallery' })
    fireEvent.touchStart(carousel, { touches: [{ clientX: 300, clientY: 400 }] })
    fireEvent.touchCancel(carousel)
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 100, clientY: 400 }] })
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('has no carousel for a project without photos', () => {
    renderProject('doubletree-by-hilton')
    expect(screen.queryByRole('region', { name: /gallery/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('hides the procurement paragraph while procurement is false', () => {
    renderProject('haii-keii')
    expect(screen.queryByText(PROCUREMENT_COPY)).not.toBeInTheDocument()
  })

  it('shows the procurement paragraph when the project sets procurement', () => {
    const project = PROJECTS.find((p) => p.id === 'haii-keii')
    project.procurement = true
    try {
      renderProject('haii-keii')
      expect(screen.getByText(PROCUREMENT_COPY)).toBeInTheDocument()
    } finally {
      project.procurement = false
    }
  })

  it('links to the next project, wrapping from last to first', () => {
    renderProject('airport-retail-spaces')
    const next = screen.getByRole('navigation', { name: 'Next project' })
    expect(within(next).getByRole('link')).toHaveAttribute('href', '/project/xo-juice-and-studio')
    expect(next).toHaveTextContent('XO JUICE AND STUDIO')
  })

  it('resets the carousel to the first image when following the next-project link', async () => {
    const user = userEvent.setup()
    renderProject('xo-juice-and-studio')
    await user.click(screen.getByRole('button', { name: 'Next image' }))
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
    await user.click(within(screen.getByRole('navigation', { name: 'Next project' })).getByRole('link'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('OMG BURGER')
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('shows not-found for an unknown id', () => {
    renderProject('nope')
    expect(screen.getByRole('heading', { name: 'Project Not Found' })).toBeInTheDocument()
  })
})
