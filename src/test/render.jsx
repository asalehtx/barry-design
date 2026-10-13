import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

// Render a component inside a router at `path`.
export const renderAt = (ui, path = '/') =>
  render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>)
