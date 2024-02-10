import { useState } from 'react'
import { Button, Container, Nav, Navbar as RBNavbar } from 'react-bootstrap'
import { isMobile } from 'react-device-detect'
import { AccountSelector } from './AccountSelector'
import { LinkWithQuery } from './LinkWithQuery'
import { SettingsDropdown } from './SettingsDropdown'
import { SocialIcons } from './SocialIcons'
import { Wallets } from './Wallets'
import { useAccount } from '../account/AccountContext'
import KappaSigmaMu from '../static/kappa-sigma-mu-logo.svg'

const Navbar = ({
  showAccount = false,
  showBrandIcon = false,
  showExploreButton = false,
  showSocialIcons = false
}: NavRouteProps) => (
  <RBNavbar className="pt-4">
    <Container>
      <Nav className="align-items-center align-self-center">
        {showBrandIcon ? <NavbarBrand /> : <BrandPlaceholder />}
        <SettingsDropdown />
      </Nav>
      <Nav className="align-items-center align-self-center">
        {showExploreButton && !isMobile && (
          <Nav.Link to="/explore" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
            Explore
          </Nav.Link>
        )}
        &nbsp;
        {showSocialIcons && <SocialIcons />}
        &nbsp;
        {showAccount && !isMobile && <AccountNavbar />}
      </Nav>
    </Container>
  </RBNavbar>
)

const BrandPlaceholder = () => <div style={{ height: 82, width: 106 }}></div>

const NavbarBrand = () => (
  <RBNavbar.Brand as={LinkWithQuery} to="/">
    <img width={90} src={KappaSigmaMu} alt="KappaSigmaMu Logo" />
  </RBNavbar.Brand>
)

const AccountNavbar = () => {
  const { activeAccount, fetchAccounts } = useAccount()
  const [showWallets, setShowWallets] = useState(false)

  return !activeAccount && !activeAccount?.address ? (
    <AccountSelector />
  ) : (
    <>
      <Button variant="outline-primary" onClick={() => setShowWallets(true)}>
        Connect Wallet
      </Button>
      {showWallets && <Wallets show={showWallets} setShow={setShowWallets} />}
    </>
  )
}

export { Navbar }
