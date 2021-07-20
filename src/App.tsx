import { Container, Nav, Navbar, Button } from 'react-bootstrap'
import { Switch, Route, Link } from 'react-router-dom'
import NavLogo from '../src/static/nav-logo.png'
import { About } from './pages/About'
import { Blog } from './pages/Blog'
import { CyborgJourney } from './pages/CyborgJourney'
import { Home } from './pages/Home'

function App() {
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
          <Button>Connect Wallet</Button>
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

export { App }
