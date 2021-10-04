import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { AccountContextProvider } from '../account/AccountContext'
import { Navbar } from '../components/Navbar'
import { KusamaContextProvider } from '../kusama'
import { GlobalStyle } from '../styles/globalStyle'
import { Theme } from '../styles/Theme'
import { CyborgGuide } from './CyborgGuide'
import { Bids } from './home/Bids'
import { Home } from './home/Home'
import { LandingPage } from './LandingPage'
import { Welcome } from './Welcome'

const Main = () => {
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
    <KusamaContextProvider>
      <AccountContextProvider>
        <ThemeProvider theme={Theme}>
          <GlobalStyle />
            <Suspense fallback={<p>ERROR/LOADING...</p>}>
              <Main />
            </Suspense>
        </ThemeProvider>
      </AccountContextProvider>
    </KusamaContextProvider>
  </>
)

export { App }
