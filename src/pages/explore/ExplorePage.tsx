import { useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Route, Routes } from 'react-router-dom'
import { BiddersPage } from './BiddersPage'
import { CandidatesPage } from './CandidatesPage'
import { ChainError } from './components/ChainError'
import { LoadingSpinner } from './components/LoadingSpinner'
import { NavigationBar } from './components/NavigationBar'
import { MembersPage } from './MembersPage'
import { PayoutsPage } from './PayoutsPage'
import { ProofOfInkPage } from './ProofOfInkPage'
import { SuspendedPage } from './SuspendedPage'
import { ChainState, useAssetHub } from '../../chain/ChainProvider'
import { useChainQuery } from '../../chain/hooks'
import { getSocietyTotals, type SocietyTotals } from '../../chain/society/queries'
import { NavigateWithQuery } from '../../components/NavigateWithQuery'

const initialState: SocietyTotals = { bidders: 0, candidates: 0, members: 0, maxMembers: 0, suspendedMembers: 0 }

const ExplorePage = (): JSX.Element => {
  const { api, state: chainState } = useAssetHub()
  const [trigger, setTrigger] = useState(false)
  const totalsState = useChainQuery(() => (api ? getSocietyTotals(api) : undefined), [api, trigger])
  const totals = totalsState.data ?? initialState
  const handleUpdateTotal = () => setTrigger((previous) => !previous)
  return (
    <Container>
      <Row>
        <Col>
          <NavigationBar totals={totals} />
        </Col>
      </Row>
      {totalsState.error && <ChainError error={totalsState.error} onRetry={totalsState.refetch} />}
      <Row>
        <Col>
          {chainState !== ChainState.ready ? (
            <LoadingSpinner />
          ) : (
            <div data-test="blockchain-data">
              <Routes>
                <Route path="/" element={<NavigateWithQuery to="/explore/bidders" replace />} />
                <Route path="/bidders" element={<BiddersPage />} />
                <Route path="/candidates" element={<CandidatesPage handleUpdateTotal={handleUpdateTotal} />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/payouts" element={<PayoutsPage />} />
                <Route path="/suspended" element={<SuspendedPage />} />
                <Route path="/poi/*" element={<ProofOfInkPage />} />
              </Routes>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export { ExplorePage }
