import Container from 'react-bootstrap/Container'
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
    </Container>
  )
}

export { App }
