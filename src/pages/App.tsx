import React, { Suspense, useLayoutEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { AccountContextProvider } from '../account/AccountContext'
import { Navbar } from '../components/Navbar'
import { KusamaContextProvider } from '../kusama'
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
      // When changing back to `true`, must also revert the
      // way context is provided so NavBar can have access to it
      showAccount={false}
      showExploreButton
      showBrandIcon
      showSocialIcons
    />
    <Outlet />
  </>)
}

const KusamaContextProviderMemo = React.memo(KusamaContextProvider)
const AccountContextProviderMemo = React.memo(AccountContextProvider)

function apiDependentRoute(path: string, element: JSX.Element) {
  const contextWrappedElement = (
    <KusamaContextProviderMemo>
      <AccountContextProviderMemo>
        {element}
      </AccountContextProviderMemo>
    </KusamaContextProviderMemo>
  )
  return <Route path={path} element={contextWrappedElement} />
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppNavigation />}>
          {apiDependentRoute("/", <LandingPage />)}
          {apiDependentRoute("/welcome", <WelcomePage />)}
          {apiDependentRoute("/journey", <JourneyPage />)}
          {apiDependentRoute("/explore/*", <ExplorePage />)}
          <Route path="/guide" element={<CyborgGuidePage />} />
          <Route path="/futurivel" element={<FuturivelPage />} />
          <Route path="*" element={<>NOT FOUND</>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

const App = () => (
  <>
    <GlobalStyle />
    <ThemeProvider theme={Theme}>
      <GlobalStyle />
      <Suspense fallback={<p>ERROR/LOADING...</p>}>
        <AppRouter />
      </Suspense>
    </ThemeProvider>
  </>
)

export { App }
