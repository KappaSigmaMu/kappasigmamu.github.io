import Container from 'react-bootstrap/Container'
import { Switch, Route } from 'react-router-dom'
import { Navbar } from '../components/navbar'
import { About } from './About'
import { Home } from './Home'
import { KusamaContextProvider } from '../kusama-lib'

function App() {
  return (
    <KusamaContextProvider>

      <Container fluid className="px-0">
        <Navbar />

        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/about">
            <About />
          </Route>
        </Switch>
      </Container>
    </KusamaContextProvider>
  )
}

export { App }
