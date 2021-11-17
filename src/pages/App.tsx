import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { AccountContextProvider } from '../account/AccountContext'
import { Navbar } from '../components/Navbar'
import { KusamaContextProvider } from '../kusama'
import { GlobalStyle } from '../styles/globalStyle'
import { Theme } from '../styles/Theme'
import { CyborgGuidePage } from './CyborgGuidePage'
import { ExplorePage } from './explore/ExplorePage'
import { HomePage } from './HomePage'
import { LandingPage } from './LandingPage'
import { WelcomePage } from './WelcomePage'

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
            <CyborgGuidePage />
          </>
        }/>
        <Route path="/welcome" element={
          <>
            <Navbar showBrandIcon showExploreButton showAccount />
            <WelcomePage />
          </>
        }/>
        <Route path="/home" element={
          <>
            <Navbar showBrandIcon showExploreButton showAccount />
            <HomePage />
          </>
        }/>
        <Route path="/explore" element={
          <>
            <Navbar showBrandIcon showExploreButton showAccount />
            <ExplorePage />
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
