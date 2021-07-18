import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { Switch, Route, Link } from 'react-router-dom'
import { KusamaContextProvider, useKusama } from './kusama-lib'
import { About } from './pages/About'
import { Home } from './pages/Home'

function Main() {
  const { apiState, apiError } = useKusama()

  const loader = (text: string) => {
    return <p>{text}</p>
  }

  if (apiState === 'ERROR')
    return loader(`${JSON.stringify(apiError, null, 4)}`)
  if (apiState !== 'READY') return loader('Connecting')

  return (
    <Container fluid className="px-0">
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand as={Link} to="/">
            KappaSigmaMu Society
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about">
              About
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/about">
          <About />
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
