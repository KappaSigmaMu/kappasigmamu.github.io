import { ApiPromise } from '@polkadot/api'
import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState, useCallback } from 'react'
import { Row, Col } from 'react-bootstrap'
import { BiddersList } from './BiddersList'
import { BidVouch } from './BidVouch'
import { useAccount } from '../../../account/AccountContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { StyledAlert } from '../components/StyledAlert'

interface BidResult {
  message: string
  success: boolean
}

type BiddersPageProps = {
  api: ApiPromise | null
}

const BiddersPage = ({ api }: BiddersPageProps): JSX.Element => {
  const { activeAccount } = useAccount()
  const [bids, setBids] = useState<Vec<PalletSocietyBid> | null>(null)
  const [result, setResult] = useState<BidResult>()
  const [showAlert, setShowAlert] = useState(true)

  const society = api?.query?.society

  useEffect(() => {
    society?.bids((response: Vec<PalletSocietyBid>) => {
      setBids(response)
    })
  }, [society])

  const handleResult = useCallback((result: BidResult) => {
    setResult(result)
    setShowAlert(true)
  }, [])

  if (bids === null) return <LoadingSpinner />

  return (<>
    {(result && showAlert) &&
      <StyledAlert
        success={result.success}
        onClose={() => setShowAlert(false)}
        dismissible>{result.message}
      </StyledAlert>}
    <Row>
      <Col>
        <BidVouch api={api!} activeAccount={activeAccount} handleResult={handleResult} />
      </Col>
      <Col xs={9}>
        <BiddersList api={api!} bids={bids} activeAccount={activeAccount} handleResult={handleResult} />
      </Col>
    </Row>
  </>)
}

export { BiddersPage }
