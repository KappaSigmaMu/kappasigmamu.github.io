import { Button, Container, Nav, Navbar as RBNavbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { fetchAccounts } from '../helpers/fetchAccounts'
import KappaSigmaMu from '../static/kappa-sigma-mu-logo.svg'
import { AccountSelector } from './AccountSelector'
import { SocialIcons } from './SocialIcons'

const Navbar = ({
  accounts,
  activeAccount,
  setAccounts,
  setActiveAccount,
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
        {showAccount ?
          <AccountNavbar
            setActiveAccount={setActiveAccount}
            activeAccount={activeAccount}
            accounts={accounts}
            setAccounts={setAccounts}
          /> : <></>}
      </Nav>
    </Container>
  </RBNavbar>
)

const NavbarBrand = () => (
  <RBNavbar.Brand as={Link} to="/">
    <img width={90} src={KappaSigmaMu} alt="KappaSigmaMu Logo" />
  </RBNavbar.Brand>
)

const AccountNavbar = ({ accounts, activeAccount, setAccounts, setActiveAccount }: NavRouteProps) => (
  accounts.length != 0 && activeAccount ? (
    <AccountSelector accounts={accounts} activeAccount={activeAccount} setActiveAccount={setActiveAccount} />
  ) : (
    <Button variant="outline-secondary" onClick={() => fetchAccounts(setAccounts, setActiveAccount)}>
      Connect Wallet
    </Button>
  )
)

export { Navbar }
