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
  const [rawMembers, setRawMembers] = useState<DeriveSocietyMember[]>([])
  const [members, setMembers] = useState<SocietyMember[]>([])
  const [info, setInfo] = useState<DeriveSociety | null>(null)

  const loading = !(api?.derive?.society && api?.derive?.accounts)

  useEffect(() => {
    // Ensures callbacks are only added once
    if (loading) return

    api.derive.society.info((responseInfo: DeriveSociety) => {
      setInfo(responseInfo)
    })

    api.derive.society.members((responseMembers: DeriveSocietyMember[]) => {
      setRawMembers(responseMembers)
    })

    api.derive.society.candidates((responseCandidates: DeriveSocietyCandidate[]) => {
      buildSocietyCandidatesArray(api, responseCandidates).then(setCandidates).catch(console.error)
    })

  }, [api?.derive?.society, api?.derive?.accounts])

  useEffect(() => {
   if (info === null) return

   setMembers(buildSocietyMembersArray(rawMembers, info, maxStrikes))
  }, [info, rawMembers])

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
