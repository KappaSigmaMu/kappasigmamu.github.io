import { useState } from 'react'
import { Container } from 'react-bootstrap'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { Navbar } from '../components/Navbar'
import { GlobalStyle } from '../styles/globalStyle'
import { Theme } from '../styles/Theme'
import { SubstrateContextProvider, useSubstrate } from '../substrate'
import { CyborgGuide } from './CyborgGuide'
import { Bids } from './home/Bids'
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

  const defaultNavbarProps = {
    accounts,
    activeAccount,
    setAccounts,
    setActiveAccount,
    showAccount: true,
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <Navbar showSocialIcons {...defaultNavbarProps} />
            <LandingPage activeAccount={activeAccount} />
          </>
        }/>
        <Route path="/cyborg-guide" element={
          <>
            <Navbar showSocialIcons showGalleryButton {...defaultNavbarProps} />
            <CyborgGuide />
          </>
        }/>
        <Route path="/welcome" element={
          <>
            <Navbar showBrandIcon showGalleryButton {...defaultNavbarProps} />
            <Welcome />
          </>
        }/>
        <Route path="/home" element={
          <>
            <Navbar showBrandIcon showGalleryButton {...defaultNavbarProps} />
            <Home activeAccount={activeAccount} />
          </>
        }/>
        <Route path="/home/bids" element={
          <>
            <Navbar showBrandIcon showGalleryButton {...defaultNavbarProps} />
            <Bids />
          </>
        }/>
      </Routes>
    </BrowserRouter>
  )
}

const App = () => (
  <>
    <GlobalStyle />
    <SubstrateContextProvider>
      <ThemeProvider theme={Theme}>
        <Container fluid>
          <Main />
        </Container>
      </ThemeProvider>
    </SubstrateContextProvider>
  </>
)

export { App }
