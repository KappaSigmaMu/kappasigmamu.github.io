import { Container } from 'react-bootstrap'
import { Switch, Route } from 'react-router-dom'
import { Navbar } from '../components/navbar'
import { KusamaContextProvider, useKusama } from '../kusama-lib'
import { About } from './About'
import { Blog } from './Blog'
import { CyborgJourney } from './CyborgJourney'
import { Home } from './Home'

function Main() {
  const { apiState, apiError } = useKusama()

  const loader = (text: string) => {
    return <p>{text}</p>
  }

  if (apiState === 'ERROR')
    return loader(`${JSON.stringify(apiError, null, 4)}`)
  if (apiState !== 'READY') return loader('Connecting')

  return (
    <Container>
      <Navbar />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/blog">
          <Blog />
        </Route>
        <Route path="/cyborg-journey">
          <CyborgJourney />
        </Route>
      </Switch>
    </Container>
  )
}

function App() {
  return (
    <KusamaContextProvider>
      <Main />
    </KusamaContextProvider>
  )
}

export { App }
