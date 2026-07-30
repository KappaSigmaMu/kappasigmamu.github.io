import { useCallback } from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { BiddersList } from './BiddersList'
import { BidVouch } from './BidVouch'
import { useAccount } from '../../../account/AccountContext'
import { useSociety } from '../../../chain/society/SocietyContext'
import type { ExtrinsicResult } from '../../../chain/types'
import { mapBidToRow } from '../../../helpers/bidKind'
import { ChainError } from '../components/ChainError'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { toastByStatus } from '../helpers'

const BiddersPage = (): JSX.Element => {
  const { activeAccount } = useAccount()
  const state = useSociety().bids
  const bids = state.data?.map(mapBidToRow)

  const handleResult = useCallback((nextResult: ExtrinsicResult) => {
    toastByStatus[nextResult.status](nextResult.message, { id: nextResult.message })
  }, [])

  if (state.error) return <ChainError error={state.error} onRetry={state.refetch} />
  if (!bids) return <LoadingSpinner />

  return (
    <Row>
      <Col xs={12} lg={3}>
        <BidPanel>
          <BidVouch dashboard handleResult={handleResult} />
        </BidPanel>
      </Col>
      <Col xs={12} lg={9}>
        <BiddersList bids={bids} activeAccount={activeAccount} handleResult={handleResult} />
      </Col>
    </Row>
  )
}

const BidPanel = styled.section`
  overflow: hidden;
  padding: 16px;
  border: 1px solid #495057;
  border-radius: 8px;
  background: #212529;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.22);

  @media (max-width: 991.98px) {
    margin-bottom: 16px;
    padding: 12px;
  }
`

export { BiddersPage }
