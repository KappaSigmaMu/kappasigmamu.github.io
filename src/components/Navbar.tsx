import { Button, Container, Nav, Navbar as RBNavbar } from 'react-bootstrap'
import { isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'
import { AccountSelector } from './AccountSelector'
import { SocialIcons } from './SocialIcons'
import { useAccount } from '../account/AccountContext'
import KappaSigmaMu from '../static/kappa-sigma-mu-logo.svg'

const Navbar = ({
  showAccount = false,
  showBrandIcon = false,
  showExploreButton = false,
  showSocialIcons = false,
}: NavRouteProps) => (
  <RBNavbar className="pt-4">
    <Container>
      <Nav>{showBrandIcon ? <NavbarBrand /> : <BrandPlaceholder />}</Nav>
      <Nav className="align-items-center align-self-center">
        {showExploreButton && !isMobile &&
          <Nav.Link to="/explore" as={Link} onClick={(e) => e.currentTarget.blur()}>Explore</Nav.Link>}
        &nbsp;
        {showSocialIcons && <SocialIcons />}
        &nbsp;
        {showAccount && !isMobile && <AccountNavbar />}
      </Nav>
    </Container>
  </RBNavbar>
)

const BrandPlaceholder = () => (
  <div style={{ height: 82, width: 106 }}></div>
)

const NavbarBrand = () => (
  <RBNavbar.Brand as={Link} to="/">
    <img width={90} src={KappaSigmaMu} alt="KappaSigmaMu Logo" />
  </RBNavbar.Brand>
)

const AccountNavbar = () => {
  const { activeAccount, fetchAccounts } = useAccount()

  return activeAccount
    ? <AccountSelector />
    : (
      <Button variant="outline-secondary" onClick={fetchAccounts}>
        Connect Wallet
      </Button>
    )
}

export { Navbar }
