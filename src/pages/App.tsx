import { useReducer } from 'react'
import { Container, Nav, Navbar, Button } from 'react-bootstrap'
import { Switch, Route, Link } from 'react-router-dom'
import { KusamaContextProvider, useKusama, reducer, INIT_STATE, loadAccounts } from '../kusama-lib'
import NavLogo from '../static/nav-logo.png'
import { About } from './About'
import { Blog } from './Blog'
import { CyborgJourney } from './CyborgJourney'
import { Home } from './Home'

function Main() {
  const { apiState, apiError } = useKusama()
  const [state, dispatch] = useReducer(reducer, INIT_STATE)

  const loader = (text: string) => {
    return <p>{text}</p>
  }

  if (apiState === 'ERROR')
    return loader(`${JSON.stringify(apiError, null, 4)}`)
  if (apiState !== 'READY') return loader('Connecting')

  return (
    <Container>
      <Navbar bg="black" variant="dark">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            <img
              src={NavLogo}
              alt="KappaSigmaMu"
              width="150"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/">
              Kusama Network
            </Nav.Link>
            <Nav.Link as={Link} to="/about">
              About
            </Nav.Link>
            <Nav.Link as={Link} to="/blog">
              Blog
            </Nav.Link>
            <Nav.Link as={Link} to="/cyborg-journey">
              Cyborg Journey
            </Nav.Link>
          </Nav>
          <Button onClick={() => loadAccounts(state, dispatch)}>Connect Wallet</Button>
        </Container>
      </Navbar>

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
