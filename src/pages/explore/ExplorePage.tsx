import { Container, Col, Row } from 'react-bootstrap'
import { Sidebar } from './components/Sidebar'

const ExplorePage = (): JSX.Element => {
  return (
    <Container>
      <Row>
        <Col xs={2}>
          <Sidebar />
        </Col>
        <Col xs={10}>
          {'CONTENT'}
        </Col>
      </Row>
    </Container>
  )
}

export { ExplorePage }
