import { DeriveSociety, DeriveSocietyCandidate, DeriveSocietyMember } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Route, Routes } from 'react-router-dom'
import { useConsts } from '../../hooks/useConsts'
import { useKusama } from '../../kusama'
import { BiddersPage } from './BiddersPage'
import { CandidatesPage } from './CandidatesPage'
import { NavigationBar } from './components/NavigationBar'
import { buildSocietyCandidatesArray, buildSocietyMembersArray } from './helpers'
import { MembersPage } from './MembersPage'

const ExplorePage = (): JSX.Element => {
  const { api } = useKusama()
  const { maxStrikes } = useConsts()
  const [candidates, setCandidates] = useState<SocietyCandidate[]>([])
  const [members, setMembers] = useState<SocietyMember[]>([])

  const loading = !api?.query?.society

  useEffect(() => {
    if (!loading) {
      api.derive.society.info().then((responseInfo: DeriveSociety) => {
        api.derive.society.members((responseMembers: DeriveSocietyMember[]) => {
          setMembers(buildSocietyMembersArray(responseMembers, responseInfo, maxStrikes))
        })
      })

      api.derive.society.candidates().then((responseCandidates: DeriveSocietyCandidate[]) => {
        buildSocietyCandidatesArray(api, responseCandidates).then(setCandidates).catch(console.error)
      })
    }
  }, [api?.query?.society])

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
            <Route path="/members" element={<MembersPage api={api} members={members}/>}/>
            <Route path="/candidates" element={<CandidatesPage api={api} candidates={candidates}/>}/>
            <Route path="/suspended" element={<>TODO SUSPENDED PAGE</>}/>
          </Routes>
        </Col>
      </Row>
    </Container>
  )
}

export { ExplorePage }
