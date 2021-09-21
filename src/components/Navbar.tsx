import { useState } from 'react'
import { Button } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import { default as BNavbar } from 'react-bootstrap/Navbar'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { fetchAccounts } from '../helpers/fetchAccounts'
import KappaSigmaMu from '../static/kappa-sigma-mu-logo.svg'
import { AccountSelector } from './AccountSelector'
import { SocialIcons } from './SocialIcons'

type NavbarType = {
  showBrandIcon: boolean
  showSocialIcons: boolean
  showGalleryButton: boolean
  showAccount: boolean
  setActiveAccount: (account: string) => void
  activeAccount: string
}

const Navbar = ({
  showBrandIcon,
  showSocialIcons,
  showGalleryButton,
  showAccount,
  setActiveAccount,
  activeAccount,
}: NavbarType) => {
  return (
    <BNavbar>
      <NavbarContainer>
        <Nav>{showBrandIcon ? <NavbarBrand /> : <></>}</Nav>
        <CenterNav>
          {showGalleryButton ? <NavbarGallery /> : <></>}
          {showSocialIcons ? <SocialIcons /> : <></>}
          {showAccount ? <AccountNavbar setActiveAccount={setActiveAccount} activeAccount={activeAccount} /> : <></>}
        </CenterNav>
      </NavbarContainer>
    </BNavbar>
  )
}

const NavbarBrand = () => (
  <BNavbar.Brand as={Link} to="/">
    <img width={90} src={KappaSigmaMu} alt="KappaSigmaMu Logo" />
  </BNavbar.Brand>
)

const NavbarGallery = () => (
  <Button variant="link" href="/gallery">
    Gallery
  </Button>
)

const AccountNavbar = ({
  setActiveAccount,
  activeAccount,
}: {
  setActiveAccount: (activeAccount: string) => void
  activeAccount: string
}) => {
  const [accounts, setAccounts] = useState<{ name: string | undefined; address: string }[]>([])

  return (
    <>
      {accounts.length != 0 && activeAccount ? (
        <AccountSelector accounts={accounts} activeAccount={activeAccount} setActiveAccount={setActiveAccount} />
      ) : (
        <Button variant="outline-secondary" onClick={() => fetchAccounts(setAccounts, setActiveAccount)}>
          Connect Wallet
        </Button>
      )}
    </>
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

Navbar.defaultProps = {
  showBrandIcon: false,
  showSocialIcons: false,
  showGalleryButton: false,
  showAccount: false,
}

export { Navbar }
