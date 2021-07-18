import ThreeCanary from 'canary-component'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { Switch, Route } from 'react-router-dom'
import { Navbar } from '../components/navbar'
import { About } from './About'
import { Home } from './Home'

function App() {
  return (
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

      <Row>
        <Col>
          <ThreeCanary
            objectUrl={process.env.PUBLIC_URL + '/assets/canary.obj'}
          />
        </Col>
      </Row>
    </Container>
  )
}

export { App }
