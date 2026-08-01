import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from 'styled-components'
import { Navbar } from '@/components/Navbar'
import { Theme } from '@/styles/Theme'

jest.mock('../../account/AccountContext', () => ({
  useAccount: () => ({ activeAccount: undefined })
}))

jest.mock('../SettingsDropdown', () => ({
  SettingsDropdown: ({ mobile = false }: { mobile?: boolean }) => (
    <button>{mobile ? 'Mobile settings' : 'Settings'}</button>
  )
}))

jest.mock('../SocialIcons', () => ({ SocialIcons: () => null }))
jest.mock('../Wallets', () => ({ Wallets: () => null }))
jest.mock('../IndexSelectorModal', () => ({
  IndexSelectorModal: ({ show }: { show: boolean }) =>
    show ? <div data-test="index-selector-modal">Index modal</div> : null
}))

describe('Navbar', () => {
  const renderNavbar = (route = '/wiki') =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <ThemeProvider theme={Theme}>
          <Navbar showAccount showBrandIcon showNavLinks />
        </ThemeProvider>
      </MemoryRouter>
    )

  it('renders the primary design routes with the existing wallet control', () => {
    renderNavbar()

    expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: 'Explore' })).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: 'Journey' })).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: 'Wiki' })[0]).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('link', { name: 'Gilberto Gil Partnership' })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument()
    expect(screen.queryByText('Log out')).not.toBeInTheDocument()
  })

  it('opens and closes the mobile drawer', () => {
    const { container } = renderNavbar()
    const menuButton = container.querySelector<HTMLButtonElement>('[data-test="mobile-menu-open"]')

    expect(menuButton).not.toBeNull()
    fireEvent.click(menuButton!)
    expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mobile settings' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByLabelText('Mobile navigation')).not.toBeInTheDocument()
  })

  it('marks the Home navigation item active on the root route', () => {
    renderNavbar('/')

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  })

  it('opens the account index selector from the warning button', () => {
    const { container } = renderNavbar()

    fireEvent.click(screen.getByRole('button', { name: 'Open account index selector' }))
    expect(container.querySelector('[data-test="index-selector-modal"]')).toBeInTheDocument()
  })
})
