import { useCallback } from 'react'
import { Col, Row } from 'react-bootstrap'
import { BiddersList } from './BiddersList'
import { BidVouch } from './BidVouch'
import { useAccount } from '../../../account/AccountContext'
import { useAssetHub } from '../../../chain/ChainProvider'
import { useChainSub } from '../../../chain/hooks'
import type { ExtrinsicResult } from '../../../chain/types'
import { mapBidToRow } from '../../../helpers/bidKind'
import { ChainError } from '../components/ChainError'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { toastByStatus } from '../helpers'

const BiddersPage = (): JSX.Element => {
  const { api } = useAssetHub()
  const { activeAccount } = useAccount()
  const state = useChainSub(() => api?.query.Society.Bids.watchValue({ at: 'best' }), [api])
  const bids = state.data?.value.map(mapBidToRow)

  const handleResult = useCallback((nextResult: ExtrinsicResult) => {
    toastByStatus[nextResult.status](nextResult.message, { id: nextResult.message })
  }, [])

  if (state.error) return <ChainError error={state.error} onRetry={state.refetch} />
  if (!bids) return <LoadingSpinner />

  return (
    <Row>
      <Col xs={12} lg={3}>
        <BidVouch handleResult={handleResult} />
      </Col>
      <Col xs={12} lg={9}>
        <BiddersList bids={bids} activeAccount={activeAccount} handleResult={handleResult} />
      </Col>
    </Row>
  )
}

export { BiddersPage }
