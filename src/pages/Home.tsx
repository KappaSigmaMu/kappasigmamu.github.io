import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { Canary } from '../components/canary'

function Home() {
  return (
    <div>
      <h2>Home</h2>
      <Row>
        <Col>
          <Canary />
        </Col>
      </Row>
    </div>
  )
}

export { Home }
