import { DeriveSocietyCandidate } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Route, Routes } from 'react-router-dom'
import { useKusama } from '../../kusama'
import { BiddersPage } from './BiddersPage'
import { CandidatesPage } from './CandidatesPage'
import { NavigationBar } from './components/NavigationBar'
import { buildSocietyCandidatesArray } from './helpers'
import { MembersPage } from './MembersPage'

const ExplorePage = (): JSX.Element => {
  const { api } = useKusama()
  const [candidates, setCandidates] = useState<SocietyCandidate[]>([])

  const loading = !api?.derive?.society

  useEffect(() => {
    // Ensures callbacks are only added once
    if (loading) return

    api.derive.society.candidates((responseCandidates: DeriveSocietyCandidate[]) => {
      buildSocietyCandidatesArray(api, responseCandidates).then(setCandidates).catch(console.error)
    })
  }, [api?.derive?.society])

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
            <Route path="/candidates" element={<CandidatesPage api={api} candidates={candidates}/>}/>
            <Route path="/suspended" element={<>TODO SUSPENDED PAGE</>}/>
          </Routes>
        </Col>
      </Row>
    </Container>
  )
}

export { ExplorePage }
