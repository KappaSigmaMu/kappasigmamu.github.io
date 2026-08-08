import { Suspense, useLayoutEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { CyborgGuidePage } from './CyborgGuidePage'
import { ExplorePage } from './explore/ExplorePage'
import { FuturivelPage } from './FuturivelPage'
import { GilbertoGilPage } from './GilbertoGilPage'
import { JourneyPage } from './JourneyPage'
import { GamePage } from './GamePage'
import { LandingPage } from './LandingPage'
import { WelcomePage } from './WelcomePage'
import { WikiPage } from './WikiPage'
import { AccountContextProvider } from '@/account/AccountContext'
import { ChainProvider } from '@/chain/ChainProvider'
import { SocietyProvider } from '@/chain/society/SocietyContext'
import { Navbar } from '@/components/Navbar'
import { Toaster } from '@/components/Toaster'
import { GlobalStyle } from '@/styles/globalStyle'
import { Theme } from '@/styles/Theme'

const AppNavigation = () => {
  const location = useLocation()

  useLayoutEffect(() => {
    const isLandingPage = location.pathname === '/' || location.pathname === ''
    document.body.style.overflow = isLandingPage ? 'hidden' : 'auto'
  }, [location])

  return (
    <>
      <Toaster />
      <Navbar showAccount showNavLinks showBrandIcon />
      <Outlet />
    </>
  )
}

/** Main Society app: chain, wallet, navbar. */
const MainApp = () => (
  <ChainProvider chain="assetHub" showLoading>
    <ChainProvider chain="people">
      <SocietyProvider>
        <AccountContextProvider>
          <Suspense fallback={<p>ERROR/LOADING...</p>}>
            <Routes>
              <Route element={<AppNavigation />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/gilbertogil" element={<GilbertoGilPage />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/journey" element={<JourneyPage />} />
                <Route path="/explore/*" element={<ExplorePage />} />
                <Route path="/guide" element={<CyborgGuidePage />} />
                <Route path="/futurivel" element={<FuturivelPage />} />
                <Route path="/wiki" element={<WikiPage />} />
                <Route path="*" element={<>NOT FOUND</>} />
              </Route>
            </Routes>
          </Suspense>
        </AccountContextProvider>
      </SocietyProvider>
    </ChainProvider>
  </ChainProvider>
)

/** Game sandbox: no navbar, no chain connect overlay. */
const GameShell = () => {
  useLayoutEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <Suspense fallback={null}>
      <GamePage />
    </Suspense>
  )
}

const App = () => (
  <>
    <GlobalStyle />
    <ThemeProvider theme={Theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/game" element={<GameShell />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </>
)

export { App }
