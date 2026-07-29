import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LinkWithQuery } from '../LinkWithQuery'

describe('LinkWithQuery', () => {
  it('marks a parent route active on nested pages and preserves the query string', () => {
    render(
      <MemoryRouter initialEntries={['/explore/members?rpc=ws%3A%2F%2Flocalhost%3A8000']}>
        <LinkWithQuery to="/explore">Explore</LinkWithQuery>
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: 'Explore' })
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link).toHaveAttribute('href', '/explore?rpc=ws%3A%2F%2Flocalhost%3A8000')
  })

  it('does not mark an unrelated route active', () => {
    render(
      <MemoryRouter initialEntries={['/wiki']}>
        <LinkWithQuery to="/journey">Journey</LinkWithQuery>
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'Journey' })).not.toHaveAttribute('aria-current')
  })

  it('can remain interactive while selected', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LinkWithQuery to="/" allowActiveClick>
          Logo
        </LinkWithQuery>
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'Logo' })).toHaveStyle({ pointerEvents: 'auto', cursor: 'pointer' })
  })
})
