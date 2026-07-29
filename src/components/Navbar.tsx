import { useEffect, useState } from 'react'
import { Button, Navbar as RBNavbar } from 'react-bootstrap'
import { FaBars, FaXmark } from 'react-icons/fa6'
import styled from 'styled-components'
import { LinkWithQuery } from './LinkWithQuery'
import { SelectedAccount } from './SelectedAccount'
import { SettingsDropdown } from './SettingsDropdown'
import { SocialIcons } from './SocialIcons'
import { Wallets } from './Wallets'
import { useAccount } from '../account/AccountContext'
import type { NavRouteProps } from '../chain/types'
import KappaSigmaMu from '../static/kappa-sigma-mu-logo-trimmed.svg'

const navigationItems = [
  { label: 'Home', to: '/', testId: 'nav-link-home' },
  { label: 'Explore', to: '/explore', testId: 'nav-link-explore' },
  { label: 'Journey', to: '/journey', testId: 'nav-link-journey' },
  { label: 'Wiki', to: '/wiki', testId: 'nav-link-wiki' },
  { label: 'Gilberto Gil Partnership', to: '/gilbertogil', testId: 'nav-link-gilberto-gil' }
]

const Navbar = ({
  showAccount = false,
  showBrandIcon = false,
  showNavLinks = false,
  showSocialIcons = false
}: NavRouteProps) => {
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (!showMenu) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowMenu(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [showMenu])

  const closeMenu = () => setShowMenu(false)

  return (
    <>
      <HeaderNavbar>
        <HeaderInner>
          <DesktopHeader>
            {showBrandIcon && <NavbarBrand />}
            {showNavLinks && (
              <DesktopNavigation aria-label="Primary navigation">
                {navigationItems.map((item) => (
                  <DesktopNavLink
                    key={item.to}
                    to={item.to}
                    data-test={item.testId}
                    onClick={(event) => event.currentTarget.blur()}
                  >
                    {item.label}
                  </DesktopNavLink>
                ))}
              </DesktopNavigation>
            )}

            <DesktopActions>
              <SettingsDropdown />
              {showSocialIcons && <SocialIcons />}
            </DesktopActions>
          </DesktopHeader>

          <MobileHeader>
            {showBrandIcon && <NavbarBrand />}
            <MenuButton
              type="button"
              onClick={() => setShowMenu(true)}
              aria-label="Open navigation menu"
              aria-expanded={showMenu}
              aria-controls="mobile-navigation"
              data-test="mobile-menu-open"
            >
              <FaBars />
            </MenuButton>
          </MobileHeader>
          {showAccount && <AccountNavbar />}
        </HeaderInner>
      </HeaderNavbar>

      {showMenu && (
        <>
          <MenuBackdrop onClick={closeMenu} aria-hidden="true" />
          <MobileDrawer id="mobile-navigation" aria-label="Mobile navigation" data-test="mobile-menu">
            <DrawerHeader>
              {showBrandIcon && <NavbarBrand onClick={closeMenu} />}
              <CloseButton type="button" onClick={closeMenu} aria-label="Close navigation menu">
                <FaXmark />
              </CloseButton>
            </DrawerHeader>

            {showNavLinks && (
              <MobileNavigation aria-label="Primary navigation">
                {navigationItems.map((item) => (
                  <MobileNavLink key={item.to} to={item.to} data-test={item.testId} onClick={closeMenu}>
                    {item.label}
                  </MobileNavLink>
                ))}
              </MobileNavigation>
            )}

            <DrawerActions>
              <SettingsDropdown mobile />
            </DrawerActions>
          </MobileDrawer>
        </>
      )}

    </>
  )
}

const NavbarBrand = ({ onClick }: { onClick?: () => void }) => (
  <BrandLink as={LinkWithQuery} to="/" onClick={onClick} aria-label="Kappa Sigma Mu home" allowActiveClick>
    <BrandImage src={KappaSigmaMu} alt="Kappa Sigma Mu" />
  </BrandLink>
)

const AccountNavbar = () => {
  const { activeAccount } = useAccount()
  const [showWallets, setShowWallets] = useState(false)

  return (
    <AccountContainer>
      <Button
        className={activeAccount ? 'p-0 px-2' : undefined}
        variant={activeAccount ? 'outline-primary' : 'primary'}
        onClick={() => setShowWallets(true)}
        style={{ minHeight: '38px' }}
        data-test={activeAccount ? 'connected-account' : 'connect-wallet-button'}
      >
        {activeAccount ? <SelectedAccount /> : 'Connect Wallet'}
      </Button>
      {showWallets && <Wallets show={showWallets} setShow={setShowWallets} />}
    </AccountContainer>
  )
}

const HeaderNavbar = styled(RBNavbar)`
  position: sticky;
  top: 0;
  min-height: 64px;
  padding: 0;
  background: #2b3035;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
  z-index: 1030;

  @media (max-width: 991.98px) {
    min-height: 56px;
  }
`

const HeaderInner = styled.div`
  display: flex;
  width: 100%;
  max-width: 1440px;
  min-height: 64px;
  margin: 0 auto;
  padding: 0 24px;
  gap: 10px;
  align-items: center;

  @media (max-width: 991.98px) {
    min-height: 56px;
    padding: 0 16px;
  }
`

const DesktopHeader = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  min-height: 64px;
  align-items: stretch;

  @media (max-width: 991.98px) {
    display: none;
  }
`

const BrandLink = styled(RBNavbar.Brand)`
  display: flex;
  width: 76px;
  margin: 0 12px 0 0;
  padding: 0;
  align-items: center;
  justify-content: center;
`

const BrandImage = styled.img`
  width: 76px;
  height: 60px;
  object-fit: contain;
  transition: filter 160ms ease;

  ${BrandLink}:hover &,
  ${BrandLink}:focus-visible & {
    filter: drop-shadow(0 0 7px rgba(255, 255, 255, 0.72));
  }
`

const DesktopNavigation = styled.nav`
  display: flex;
  min-width: 0;
  align-items: stretch;
`

const DesktopNavLink = styled(LinkWithQuery)`
  position: relative;
  display: flex;
  padding: 0 16px;
  align-items: center;
  color: #d7d9db;
  font-size: 1rem;
  font-weight: 400;
  white-space: nowrap;
  transition: color 150ms ease, background-color 150ms ease;

  &:hover,
  &:focus-visible {
    color: #fff;
    background: rgba(255, 255, 255, 0.035);
  }

  &[aria-current='page'] {
    color: #fff;
    font-weight: 700;
  }

  &[aria-current='page']::after {
    position: absolute;
    right: 14px;
    bottom: 0;
    left: 14px;
    height: 3px;
    background: #e6007a;
    content: '';
  }
`

const DesktopActions = styled.div`
  display: flex;
  min-width: 0;
  margin-left: auto;
  gap: 10px;
  align-items: center;
`

const MobileHeader = styled.div`
  display: none;

  @media (max-width: 991.98px) {
    display: flex;
    min-width: 0;
    min-height: 56px;
    flex: 1;
    gap: 2px;
    align-items: center;
    justify-content: flex-start;
  }

  ${BrandLink} {
    width: 64px;
    margin-right: 0;
  }

  ${BrandImage} {
    width: 64px;
    height: 50px;
  }
`

const AccountContainer = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
`

const MenuButton = styled.button`
  display: inline-flex;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #fff;
  font-size: 18px;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.08);
  }
`

const MenuBackdrop = styled.div`
  position: fixed;
  z-index: 1040;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);

  @media (min-width: 992px) {
    display: none;
  }
`

const MobileDrawer = styled.aside`
  position: fixed;
  z-index: 1045;
  top: 0;
  left: 0;
  display: flex;
  width: min(320px, 88vw);
  height: 100dvh;
  flex-direction: column;
  overflow-y: auto;
  background: #22272b;
  box-shadow: 8px 0 24px rgba(0, 0, 0, 0.35);

  @media (min-width: 992px) {
    display: none;
  }
`

const DrawerHeader = styled.div`
  display: flex;
  min-height: 56px;
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;

  ${BrandLink} {
    width: 64px;
    margin: 0;
  }

  ${BrandImage} {
    width: 64px;
    height: 50px;
  }
`

const CloseButton = styled(MenuButton)`
  font-size: 20px;
`

const MobileNavigation = styled.nav`
  display: flex;
  flex-direction: column;
`

const MobileNavLink = styled(LinkWithQuery)`
  position: relative;
  display: flex;
  min-height: 48px;
  padding: 0 18px;
  align-items: center;
  color: #e4e5e6;
  font-size: 1rem;
  transition: color 150ms ease, background-color 150ms ease;

  &:hover,
  &:focus-visible {
    color: #fff;
    background: rgba(255, 255, 255, 0.045);
  }

  &[aria-current='page'] {
    padding-left: 22px;
    background: rgba(230, 0, 122, 0.08);
    color: #fff;
    font-weight: 700;
  }

  &[aria-current='page']::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    background: #e6007a;
    content: '';
  }
`

const DrawerActions = styled.div`
  display: flex;
  margin-top: 6px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-direction: column;
`

export { Navbar }
