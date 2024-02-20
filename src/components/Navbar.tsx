import { useState } from 'react'
import { Button, Container, Dropdown, Nav, Navbar as RBNavbar } from 'react-bootstrap'
import { FaBars } from 'react-icons/fa6'
import { LinkWithQuery } from './LinkWithQuery'
import { SelectedAccount } from './SelectedAccount'
import { SettingsDropdown } from './SettingsDropdown'
import { SocialIcons } from './SocialIcons'
import { StyledDropdownMenu } from './StyledDropdownMenu'
import { Wallets } from './Wallets'
import { useAccount } from '../account/AccountContext'
import KappaSigmaMu from '../static/kappa-sigma-mu-logo.svg'

const Navbar = ({
  showAccount = false,
  showBrandIcon = false,
  showNavLinks = false,
  showSocialIcons = false
}: NavRouteProps) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <RBNavbar className="pt-4">
      <Container>
        <Nav className="align-items-center align-self-center">
          {showBrandIcon ? <NavbarBrand /> : <BrandPlaceholder />}
          <SettingsDropdown />
        </Nav>
        <Nav className="align-items-center align-self-center">
          {showNavLinks && (
            <>
              <div className="d-lg-none">
                <Dropdown show={showMenu} onToggle={() => setShowMenu(!showMenu)}>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    <FaBars role="button" />
                  </Dropdown.Toggle>

                  <StyledDropdownMenu>
                    <Dropdown.Item as="button">
                      <Nav.Link to="/guide" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
                        Guide
                      </Nav.Link>
                    </Dropdown.Item>
                    <Dropdown.Item as="button">
                      <Nav.Link to="/wiki" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
                        Wiki
                      </Nav.Link>
                    </Dropdown.Item>
                    <Dropdown.Item as="button">
                      <Nav.Link to="/journey" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
                        Journey
                      </Nav.Link>
                    </Dropdown.Item>
                    <Dropdown.Item as="button">
                      <Nav.Link to="/explore" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
                        Explore
                      </Nav.Link>
                    </Dropdown.Item>
                  </StyledDropdownMenu>
                </Dropdown>
              </div>

              {/* Desktop Links */}
              <div className="d-none d-lg-flex me-2 align-items-center">
                <Nav.Link to="/guide" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
                  Guide
                </Nav.Link>
                <span>•</span>
                <Nav.Link to="/wiki" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
                  Wiki
                </Nav.Link>
                <span>•</span>
                <Nav.Link to="/journey" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
                  Journey
                </Nav.Link>
                <span>•</span>
                <Nav.Link to="/explore" as={LinkWithQuery} onClick={(e) => e.currentTarget.blur()}>
                  Explore
                </Nav.Link>
              </div>
            </>
          )}
          {showSocialIcons && <SocialIcons />}
          {showAccount && <AccountNavbar />}
        </Nav>
      </Container>
    </RBNavbar>
  )
}

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
