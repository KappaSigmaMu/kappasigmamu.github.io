import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { AccountContextProvider } from '../account/AccountContext'
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

  const loader = (text: string) => {
    return <p>{text}</p>
  }

  if (apiState === 'CONNECTING') return loader('Connecting')
  if (apiState === 'ERROR') return loader(`${JSON.stringify(apiError, null, 4)}`)
  if (apiState !== 'READY') return loader('Connecting')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <Navbar showSocialIcons showAccount />
            <LandingPage />
          </>
        }/>
        <Route path="/guide" element={
          <>
            <Navbar showBrandIcon showSocialIcons showAccount />
            <CyborgGuide />
          </>
        }/>
        <Route path="/welcome" element={
          <>
            <Navbar showBrandIcon showGalleryButton showAccount />
            <Welcome />
          </>
        }/>
        <Route path="/home" element={
          <>
            <Navbar showBrandIcon showGalleryButton showAccount />
            <Home />
          </>
        }/>
        <Route path="/home/bids" element={
          <>
            <Navbar showBrandIcon showGalleryButton showAccount />
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
      <AccountContextProvider>
        <ThemeProvider theme={Theme}>
          <GlobalStyle />
            <Main />
        </ThemeProvider>
      </AccountContextProvider>
    </SubstrateContextProvider>
  </>
)

export { App }
