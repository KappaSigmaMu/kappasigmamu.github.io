import { Button } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import { default as BNavbar } from 'react-bootstrap/Navbar'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
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
  <BNavbar>
    <NavbarContainer>
      <Nav>{showBrandIcon ? <NavbarBrand /> : <></>}</Nav>
      <CenterNav>
        {showGalleryButton ? <Nav.Link to="/home/bids" as={Link}>Gallery</Nav.Link> : <></>}
        {showSocialIcons ? <SocialIcons /> : <></>}
        {showAccount ? <AccountNavbar /> : <></>}
      </CenterNav>
    </NavbarContainer>
  </BNavbar>
)

const NavbarBrand = () => (
  <BNavbar.Brand as={Link} to="/">
    <img width={90} src={KappaSigmaMu} alt="KappaSigmaMu Logo" />
  </BNavbar.Brand>
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

const NavbarContainer = styled(Container)`
  align-items: end !important;
  padding-top: 20px;
`

const CenterNav = styled(Nav)`
  align-items: center;
  align-self: normal;
`

export { Navbar }
