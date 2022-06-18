import { ApiPromise } from '@polkadot/api'
import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Alert } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../../../account/AccountContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { BiddersList } from './BiddersList'
import { BidVouch } from './BidVouch'

interface BidResult {
  message: string
  success: boolean
}

type BiddersPageProps = {
  api: ApiPromise | null
}

const BiddersPage = ({ api }: BiddersPageProps): JSX.Element => {
  const { activeAccount, accounts } = useAccount()
  const [bids, setBids] = useState<Vec<PalletSocietyBid> | null>(null)
  const [result, setResult] = useState<BidResult>()
  const [showAlert, setShowAlert] = useState(true)

  const society = api?.query?.society

  useEffect(() => {
    society?.bids((response: Vec<PalletSocietyBid>) => {
      setBids(response)
    })
  }, [society])

  const handleResult = useCallback(result => {
    setResult(result)
    setShowAlert(true)
  }, [])

  const content = bids === null
    ? <LoadingSpinner />
    : <BiddersList bids={bids} activeAccount={activeAccount} handleResult={handleResult} />

  return (
    <>
      {(result && showAlert) &&
        <StyledAlert
          success={result.success}
          onClose={() => setShowAlert(false)}
          dismissible>{result.message}
        </StyledAlert>}
      <Row>
        <Col>
          <BidVouch accounts={accounts} activeAccount={activeAccount} handleResult={handleResult} />
        </Col>
        <Col xs={9}>
          {content}
        </Col>
      </Row>
    </>
  )
}

interface StyledAlertProps {
  success: boolean
}

const StyledAlert = styled(Alert)<StyledAlertProps>`
  background-color: #1A1D20;
  border-color: ${props => props.success ? '#A7FB8F' : '#ED6464'};
  color: ${props => props.success ? '#A7FB8F' : '#ED6464'};

  .btn-close {
    filter: ${props => props.success
      ? 'invert(88%) sepia(27%) saturate(621%) hue-rotate(50deg) brightness(97%) contrast(104%);'
      : 'invert(58%) sepia(6%) saturate(6386%) hue-rotate(315deg) brightness(94%) contrast(96%);'}
  }
`

export { BiddersPage }
