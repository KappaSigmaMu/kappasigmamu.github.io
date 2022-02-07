import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState, useCallback } from 'react'
import { Spinner, Row, Col, Alert } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../../../account/AccountContext'
import { useKusama } from '../../../kusama'
import { BiddersList } from './BiddersList'
import { BidVouch } from './BidVouch'

const BiddersPage = (): JSX.Element => {
  const { api } = useKusama()
  const { activeAccount } = useAccount()
  const [bids, setBids] = useState<Vec<PalletSocietyBid> | []>([])
  const [result, setResult] = useState(null)
  const [showAlert, setShowAlert] = useState(true)

  const loading = !api?.query?.society

  useEffect(() => {
    if (!loading) {
      api.query.society.bids((response: Vec<PalletSocietyBid>) => {
        setBids(response)
      })
    }
  }, [api?.query?.society])

  const handleResult = useCallback((result) => {
    setResult(result)
    setShowAlert(true)
  }, [])

  const content = loading
    ? <Spinner animation="border" variant="primary" />
    : <BiddersList bids={bids} activeAccount={activeAccount} handleResult={handleResult} />

  return (
    <>
      {(result && showAlert) && <StyledAlert onClose={() => setShowAlert(false)} dismissible>{result}</StyledAlert>}
      <Row>
        <Col>
          <BidVouch activeAccount={activeAccount} handleResult={handleResult} /> 
        </Col>
        <Col xs={9}>
          {content}
        </Col>
      </Row>
    </>
  )
}

const StyledAlert = styled(Alert)`
  background-color: #1A1D20;
  border-color: #A7FB8F;
  color: #A7FB8F;

  .btn-close {
    filter: invert(88%) sepia(27%) saturate(621%) hue-rotate(50deg) brightness(97%) contrast(104%);
  }
`

export { BiddersPage }
