import React, { useState } from 'react'
import { Container } from 'react-bootstrap'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'
import { Navbar } from '../components/Navbar'
import { GlobalStyle } from '../styles/globalStyle'
import { Theme } from '../styles/Theme'
import { SubstrateContextProvider, useSubstrate } from '../substrate'
import { CyborgGuide } from './CyborgGuide'
import { Home } from './home/Home'
import { LandingPage } from './LandingPage'
import { Welcome } from './Welcome'

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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <>
                <Navbar
                  accounts={accounts}
                  activeAccount={activeAccount}
                  setAccounts={setAccounts}
                  setActiveAccount={setActiveAccount}
                  showAccount
                  showSocialIcons
                />
                <LandingPage activeAccount={activeAccount} />
              </>
            }/>
            <Route path="/cyborg-guide" element={
              <>
                <Navbar
                  accounts={accounts}
                  activeAccount={activeAccount}
                  setAccounts={setAccounts}
                  setActiveAccount={setActiveAccount}
                  showAccount
                  showSocialIcons
                  showGalleryButton
                />
                <CyborgGuide />
              </>
            }/>
            <Route path="/welcome" element={
              <>
                <Navbar
                  accounts={accounts}
                  activeAccount={activeAccount}
                  setAccounts={setAccounts}
                  setActiveAccount={setActiveAccount}
                  showAccount
                  showBrandIcon
                  showGalleryButton
                />
                <Welcome />
              </>
            }/>
            <Route path="/home" element={
              <>
                <Navbar
                  accounts={accounts}
                  activeAccount={activeAccount}
                  setAccounts={setAccounts}
                  setActiveAccount={setActiveAccount}
                  showAccount
                  showBrandIcon
                  showGalleryButton
                />
                <Home activeAccount={activeAccount} />
              </>
            }/>
          </Routes>
        </BrowserRouter>
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
