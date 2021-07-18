import ThreeCanary from 'canary-component'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Row from 'react-bootstrap/Row'
import { Switch, Route, Link } from 'react-router-dom'
import { About } from './About'
import { Home } from './Home'

function App() {
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

      <Row>
        <Col>
          {process.env.PUBLIC_URL}
          <ThreeCanary
            objectUrl={process.env.PUBLIC_URL + '/assets/canary.obj'}
          />
        </Col>
      </Row>
    </Container>
  )
}

export { App }
