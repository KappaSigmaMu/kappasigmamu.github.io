import { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Route, Routes } from 'react-router-dom'
import { BiddersPage } from './BiddersPage'
import { CandidatesPage } from './CandidatesPage'
import { LoadingSpinner } from './components/LoadingSpinner'
import { NavigationBar } from './components/NavigationBar'
import { MembersPage } from './MembersPage'
import { PayoutsPage } from './PayoutsPage'
import { ProofOfInkPage } from './ProofOfInkPage'
import { SuspendedPage } from './SuspendedPage'
import { NavigateWithQuery } from '../../components/NavigateWithQuery'
import { useKusama } from '../../kusama'
import { ApiState } from '../../kusama/KusamaContext'

type Totals = {
  bidders: number
  candidates: number
  members: number
  maxMembers: number
  suspendedMembers: number
}

const initialState = {
  bidders: 0,
  candidates: 0,
  members: 0,
  maxMembers: 0,
  suspendedMembers: 0
}

const ExplorePage = (): JSX.Element => {
  const { api, apiState } = useKusama()
  const [totals, setTotals] = useState<Totals>(initialState)
  const [trigger, setTrigger] = useState(false)

  const handleUpdateTotal = () => {
    setTrigger((prev) => !prev)
  }

  const society = api?.query?.society

  useEffect(() => {
    setTrigger(true)
    if (society) {
      const biddersPromise = society.bids()
      const candidatesPromise = society.candidates.keys()
      const membersPromise = society.memberCount()
      const paramsPromise = society.parameters()
      const suspendedMembersPromise = society.suspendedMembers.keys()

      Promise.all([biddersPromise, candidatesPromise, membersPromise, paramsPromise, suspendedMembersPromise]).then(
        ([bidders, candidates, members, params, suspendedMembers]) => {
          setTotals({
            bidders: bidders.length,
            candidates: candidates.length,
            members: members.toNumber(),
            maxMembers: params.unwrap().maxMembers.toNumber(),
            suspendedMembers: suspendedMembers.length
          })
        }
      )
    }
  }, [trigger, society])

  return (
    <Container>
      <Row>
        <Col>
          <NavigationBar totals={totals} />
        </Col>
      </Row>
      <Row>
        <Col>
          {apiState !== ApiState.ready ? (
            <LoadingSpinner />
          ) : (
            <Routes>
              <Route path="/" element={<NavigateWithQuery to="/explore/bidders" replace />} />
              <Route path="/bidders" element={<BiddersPage api={api} />} />
              <Route path="/candidates" element={<CandidatesPage api={api} handleUpdateTotal={handleUpdateTotal} />} />
              <Route path="/members" element={<MembersPage api={api} />} />
              <Route path="/payouts" element={<PayoutsPage api={api} />} />
              <Route path="/suspended" element={<SuspendedPage api={api} />} />
              <Route path="/poi/*" element={<ProofOfInkPage api={api} />} />
            </Routes>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export { ExplorePage }
