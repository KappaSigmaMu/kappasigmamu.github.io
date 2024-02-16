import { useState } from 'react'
import { Button, Container, Nav, Navbar as RBNavbar } from 'react-bootstrap'
import { isMobile } from 'react-device-detect'
import { LinkWithQuery } from './LinkWithQuery'
import { SelectedAccount } from './SelectedAccount'
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
          <>
            <Nav.Link to="/journey" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
              Journey
            </Nav.Link>
            •
            <Nav.Link to="/explore" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
              Explore
            </Nav.Link>
          </>
        )}
        &nbsp;
        {showSocialIcons && !isMobile && <SocialIcons />}
        &nbsp;
        {showAccount && <AccountNavbar />}
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
  const { activeAccount } = useAccount()
  const [showWallets, setShowWallets] = useState(false)

  return (
    <>
      <Button
        className={activeAccount && 'p-0 px-2'}
        variant={activeAccount ? 'outline-primary' : 'primary'}
        onClick={() => setShowWallets(true)}
        style={{ minHeight: '38px' }}
      >
        {activeAccount ? <SelectedAccount /> : 'Connect Wallet'}
      </Button>
      {showWallets && <Wallets show={showWallets} setShow={setShowWallets} />}
    </>
  )
}

export { Navbar }
