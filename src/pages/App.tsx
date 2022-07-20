import { Suspense, useLayoutEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { Navbar } from '../components/Navbar'
import { KusamaContextProvider } from '../kusama'
import { config } from '../kusama/config'
import { GlobalStyle } from '../styles/globalStyle'
import { Theme } from '../styles/Theme'
import { CyborgGuidePage } from './CyborgGuidePage'
import { ExplorePage } from './explore/ExplorePage'
import { FuturivelPage } from './FuturivelPage'
import { JourneyPage } from './JourneyPage'
import { LandingPage } from './LandingPage'
import { WelcomePage } from './WelcomePage'

const AppNavigation = () => {
  const location = useLocation()

  useLayoutEffect(() => {
    const isLandingPage = location.pathname === "/" || location.pathname === ""
    document.body.style.overflow = isLandingPage ? "hidden" : "auto"
  }, [location])

  return (<>
    <Navbar
      showAccount={config.env === 'development'}
      showExploreButton={config.env === 'development'}
      showBrandIcon
      showSocialIcons
    />
    <Outlet />
  </>)
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppNavigation />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/journey" element={<JourneyPage />} />
          <Route path="/explore/*" element={<ExplorePage />} />
          <Route path="/guide" element={<CyborgGuidePage />} />
          <Route path="/futurivel" element={<FuturivelPage />} />
          <Route path="*" element={<>NOT FOUND</>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

const App = () => (
  <KusamaContextProvider>
    <GlobalStyle />
    <ThemeProvider theme={Theme}>
      <GlobalStyle />
      <Suspense fallback={<p>ERROR/LOADING...</p>}>
        <AppRouter />
      </Suspense>
    </ThemeProvider>
  </KusamaContextProvider>
)

export { App }
