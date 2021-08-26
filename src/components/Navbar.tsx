import { useState } from 'react'
import { Button } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import { default as BNavbar } from 'react-bootstrap/Navbar'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import DiscordLogo from '../static/discord-logo.svg'
import ElementLogo from '../static/element-logo.svg'
import KappaSigmaMu from '../static/kappa-sigma-mu-logo.svg'
import TwitterLogo from '../static/twitter-logo.svg'
import { AccountSelector } from './AccountSelector'
import { fetchAccounts } from '../helpers/fetchAccounts'

type NavbarType = {
  showBrandIcon: boolean
  showSocialIcons: boolean
  showGalleryButton: boolean
  showAccount: boolean
  setAccount: () => void
  account: string
}

const Navbar = ({
  showBrandIcon,
  showSocialIcons,
  showGalleryButton,
  showAccount,
  setAccount,
  account,
}: NavbarType) => {
  return (
    <BNavbar>
      <NavbarContainer>
        <Nav>{showBrandIcon ? <NavbarBrand /> : <></>}</Nav>
        <CenterNav>
          {showGalleryButton ? <NavbarGallery /> : <></>}
          {showSocialIcons ? <NavbarSocial /> : <></>}
          {showAccount ? (
            <NavbarAccount setAccount={setAccount} account={account} />
          ) : (
            <></>
          )}
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
  <Button variant="link" href="/gallery">
    Gallery
  </Button>
)

const NavbarAccount = ({ setAccount, account }: any) => {
  const [accounts, setAccounts] = useState<
    { name: string | undefined; address: string }[]
  >([])

  return (
    <>
      {accounts.length != 0 && account ? (
        // @ts-ignore
        <AccountSelector
          accounts={accounts}
          initialAddress={account}
          setAccountAddress={setAccount}
        />
      ) : (
        <Button variant="outline-secondary" onClick={() => fetchAccounts(setAccounts, setAccount)}>
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
`

Navbar.defaultProps = {
  showBrandIcon: false,
  showSocialIcons: false,
  showGalleryButton: false,
  showAccount: false,
}

export { Navbar }
