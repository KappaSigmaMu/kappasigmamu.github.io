import React, { useState } from 'react'
import { Container } from 'react-bootstrap'
import { Switch, Route, RouteProps } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'
import { Navbar } from '../components/Navbar'
import { GlobalStyle } from '../styles/globalStyle'
import { Theme } from '../styles/Theme'
import { SubstrateContextProvider, useSubstrate } from '../substrate'
import { CyborgGuide } from './CyborgGuide'
import { Home } from './home/Home'
import { Index } from './Index'
import { Welcome } from './Welcome'

const NavRoute = ({
  accounts,
  activeAccount,
  setAccounts,
  setActiveAccount,
  showAccount,
  showBrandIcon,
  showGalleryButton,
  showSocialIcons,
  exact,
  path,
  children,
}: NavRouteProps & RouteProps) => (
  <Route exact={exact} path={path} render={() => (
    <>
      <Navbar
        accounts={accounts}
        activeAccount={activeAccount}
        setAccounts={setAccounts}
        setActiveAccount={setActiveAccount}
        showAccount={showAccount}
        showSocialIcons={showSocialIcons}
        showBrandIcon={showBrandIcon}
        showGalleryButton={showGalleryButton}
      />
      {children}
    </>
  )}/>
)

const Main = () => {
  const { apiState, apiError } = useSubstrate()
  const [activeAccount, setActiveAccount] = useState<string>('')
  const [accounts, setAccounts] = useState<{ name: string | undefined; address: string }[]>([])

  const loader = (text: string) => {
    return <p>{text}</p>
  }

  if (apiState === 'CONNECTING') return loader('Connecting')
  if (apiState === 'ERROR') return loader(`${JSON.stringify(apiError, null, 4)}`)
  if (apiState !== 'READY') return loader('Connecting')

  return (
    <>
      <GlobalStyle />
      <StyledMain fluid>
        <Switch>
          <NavRoute
            accounts={accounts}
            activeAccount={activeAccount}
            exact
            path="/"
            setAccounts={setAccounts}
            setActiveAccount={setActiveAccount}
            showAccount
            showSocialIcons
            showBrandIcon={false}
            showGalleryButton={false}
          >
            <Index activeAccount={activeAccount} />
          </NavRoute>
          <NavRoute
            accounts={accounts}
            activeAccount={activeAccount}
            path="/cyborg-guide"
            setAccounts={setAccounts}
            setActiveAccount={setActiveAccount}
            showAccount
            showBrandIcon
            showGalleryButton
            showSocialIcons={false}
          >
            <CyborgGuide />
          </NavRoute>
          <NavRoute
            accounts={accounts}
            activeAccount={activeAccount}
            path="/welcome"
            setAccounts={setAccounts}
            setActiveAccount={setActiveAccount}
            showAccount
            showBrandIcon
            showGalleryButton
            showSocialIcons={false}
          >
            <Welcome />
          </NavRoute>
          <NavRoute
            path="/home"
            accounts={accounts}
            activeAccount={activeAccount}
            setAccounts={setAccounts}
            setActiveAccount={setActiveAccount}
            showAccount
            showBrandIcon
            showGalleryButton
            showSocialIcons={false}
          >
            <Home activeAccount={activeAccount} />
          </NavRoute>
        </Switch>
      </StyledMain>
    </>
  )
}

const App = () => {
  return (
    <SubstrateContextProvider>
      <ThemeProvider theme={Theme}>
        <Main />
      </ThemeProvider>
    </SubstrateContextProvider>
  )
}

const StyledMain = styled(Container)`
`

export { App }
