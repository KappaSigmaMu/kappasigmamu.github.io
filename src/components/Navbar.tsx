import { Button, Container, Nav, Navbar as RBNavbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAccount } from '../account/AccountContext'
import { fetchAccounts } from '../helpers/fetchAccounts'
import KappaSigmaMu from '../static/kappa-sigma-mu-logo.svg'
import { AccountSelector } from './AccountSelector'
import { SocialIcons } from './SocialIcons'

const Navbar = ({
  showAccount=false,
  showBrandIcon=false,
  showGalleryButton=false,
  showSocialIcons=false,
}: NavRouteProps) => (
  <RBNavbar className="mt-4">
    <Container>
      {showBrandIcon ? <NavbarBrand /> : <></>}
      <Nav className="align-items-center align-self-center">
        {showGalleryButton ? <Nav.Link to="/home/bids" as={Link}>Gallery</Nav.Link> : <></>}
        &nbsp;
        {showSocialIcons ? <SocialIcons /> : <></>}
        &nbsp;
        {showAccount ? <AccountNavbar /> : <></>}
      </Nav>
    </Container>
  </RBNavbar>
)

const NavbarBrand = () => (
  <RBNavbar.Brand as={Link} to="/">
    <img width={90} src={KappaSigmaMu} alt="KappaSigmaMu Logo" />
  </RBNavbar.Brand>
)

const AccountNavbar = () => {
  const { activeAccount, setActiveAccount, accounts, setAccounts } = useAccount()

  return accounts.length != 0 && activeAccount
    ? <AccountSelector />
    : (
      <Button variant="outline-secondary" onClick={() => fetchAccounts(setAccounts, setActiveAccount)}>
        Connect Wallet
      </Button>
    )
}

export { Navbar }
