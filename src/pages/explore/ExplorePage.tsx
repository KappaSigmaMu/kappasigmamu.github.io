import { Col, Container, Row } from 'react-bootstrap'
import { Route, Routes } from 'react-router-dom'
import { useKusama } from '../../kusama'
import { BiddersPage } from './BiddersPage'
import { CandidatesPage } from './CandidatesPage'
import { NavigationBar } from './components/NavigationBar'
import { MembersPage } from './MembersPage'

const ExplorePage = (): JSX.Element => {
  const { api } = useKusama()

  return (
    <Container>
      <Row>
        <Col>
          <NavigationBar />
        </Col>
      </Row>
      <Row>
        <Col>
          <Routes>
            <Route path="/" element={<>TODO EXPLORE PAGE</>}/>
            <Route path="/bidders" element={<BiddersPage />}/>
            <Route path="/members" element={<MembersPage api={api}/>}/>
            <Route path="/candidates" element={<CandidatesPage api={api}/>}/>
            <Route path="/suspended" element={<>TODO SUSPENDED PAGE</>}/>
          </Routes>
        </Col>
      </Row>
    </Container>
  )
}

export { ExplorePage }
