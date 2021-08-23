import { useState } from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import { default as BNavbar } from 'react-bootstrap/Navbar'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { AccountSelector } from '../AccountSelector'
import DiscordLogo from './discord-logo.svg'
import ElementLogo from './element-logo.svg'
import KappaSigmaMu from './kappa-sigma-mu-logo.svg'
import TwitterLogo from './twitter-logo.svg'

type NavbarType = {
  showBrandIcon: boolean
  showSocialIcons: boolean
  showGalleryButton: boolean
  showAccount: boolean
}

const Navbar = ({
  showBrandIcon,
  showSocialIcons,
  showGalleryButton,
  showAccount,
}: NavbarType) => {
  return (
    <BNavbar bg="dark" variant="dark">
      <NavbarContainer>
        <Nav>{showBrandIcon ? <NavbarBrand /> : <></>}</Nav>
        <CenterNav>
          {showGalleryButton ? <NavbarGallery /> : <></>}
          {showSocialIcons ? <NavbarSocial /> : <></>}
          {showAccount ? <NavbarAccount /> : <></>}
        </CenterNav>
      </NavbarContainer>
    </BNavbar>
  )
}

const NavbarBrand = () => (
  <BNavbar.Brand as={Link} to="/">
    <img src={KappaSigmaMu} alt="KappaSigmaMu Logo" />
  </BNavbar.Brand>
)

const NavbarSocial = () => (
  <>
    <BNavbar.Brand href="https://discord.gg/9AWjTf8wSk" target="_blank">
      <img src={DiscordLogo} alt="Discord Logo" />
    </BNavbar.Brand>
    <BNavbar.Brand href="" target="_blank">
      <img src={ElementLogo} alt="Discord Logo" />
    </BNavbar.Brand>
    <BNavbar.Brand href="https://twitter.com/network" target="_blank">
      <img src={TwitterLogo} alt="Twitter Logo" />
    </BNavbar.Brand>
  </>
)

const NavbarGallery = () => (
  <StyledNavLink as={Link} to="/gallery">
    Gallery
  </StyledNavLink>
)

const NavbarAccount = () => {
  const [, setAccountAddress] = useState('')

  return (
    <>
      <AccountSelector setAccountAddress={setAccountAddress} />
      <WalletButton>Connect Wallet</WalletButton>
    </>
  )
}

const NavbarContainer = styled(Container)`
  align-items: end !important;
  padding-top: 20px;
`

const StyledNavLink = styled(Nav.Link)`
  margin-right: 20px;
  color: #e6007a;

  &:hover {
    color: #e6007a;
  }
`

const CenterNav = styled(Nav)`
  align-items: center;
`

const WalletButton = styled.button`
  padding: 6px 12px;
  background-color: transparent;
  color: #01ffff;
  border: 1px solid #01ffff;
  border-radius: 4px;

  &:hover {
    background-color: #01ffff;
    color: black;
  }
`

Navbar.defaultProps = {
  showBrandIcon: false,
  showSocialIcons: false,
  showGalleryButton: false,
  showAccount: false,
}

export { Navbar }
