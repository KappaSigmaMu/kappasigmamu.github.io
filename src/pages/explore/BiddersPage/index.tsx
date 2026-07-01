import { ApiPromise } from '@polkadot/api'
import type { Vec } from '@polkadot/types'
import type { Bid } from '@polkadot/types/interfaces/society'
import type { Codec } from '@polkadot/types-codec/types'
import { useEffect, useState, useCallback } from 'react'
import { Row, Col } from 'react-bootstrap'
import { BiddersList } from './BiddersList'
import { BidVouch } from './BidVouch'
import { useAccount } from '../../../account/AccountContext'
import { type BidRow, mapBidToRow } from '../../../helpers/bidKind'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { toastByStatus } from '../helpers'

type BiddersPageProps = {
  api: ApiPromise | null
}

const BiddersPage = ({ api }: BiddersPageProps): JSX.Element => {
  const { activeAccount } = useAccount()
  const [bids, setBids] = useState<BidRow[] | null>(null)

  const society = api?.query?.society

  useEffect(() => {
    society?.bids((response: Codec) => {
      const bidsVec = response as unknown as Vec<Bid>
      setBids([...bidsVec].map(mapBidToRow))
    })
  }, [society])

  const handleResult = useCallback((nextResult: ExtrinsicResult) => {
    toastByStatus[nextResult.status](nextResult.message, { id: nextResult.message })
  }, [])

  if (bids === null) return <LoadingSpinner />

  return (
    <>
      <Row>
        <Col xs={12} lg={3}>
          <BidVouch api={api!} activeAccount={activeAccount} handleResult={handleResult} />
        </Col>
        <Col xs={12} lg={9}>
          <BiddersList api={api!} bids={bids} activeAccount={activeAccount} handleResult={handleResult} />
        </Col>
      </Row>
    </>
  )
}

export { BiddersPage }
