import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState } from 'react'
import { Spinner, Row, Col } from 'react-bootstrap'
import { useKusama } from '../../../kusama'
import { BiddersList } from './BiddersList'
import { BidVouch } from './BidVouch'

const BiddersPage = (): JSX.Element => {
  const { api } = useKusama()
  const [bids, setBids] = useState<Vec<PalletSocietyBid> | []>([])

  const loading = !api?.query?.society

  useEffect(() => {
    if (!loading) {
      api.query.society.bids().then((response: Vec<PalletSocietyBid>) => {
        setBids(response)
      })
    }
  }, [api?.query?.society])

  const content = loading ? <Spinner animation="border" variant="primary" /> : <BiddersList bids={bids} />

  return (
    <Row>
      <Col>
        <BidVouch /> 
      </Col>
      <Col xs={9}>
        {content}
      </Col>
    </Row>
  )
}

export { BiddersPage }
