import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState } from 'react'
import { Container, Col, Row, Spinner } from 'react-bootstrap'
import { BidsList } from '../../../components/BidsList'
import { Sidebar } from '../../../components/Sidebar'
import { useKusama } from '../../../kusama'

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

  const content = loading ? <Spinner animation="border" variant="primary" /> : <BidsList bids={bids} />

  return (
    <Container>
      <Row>
        <Col xs={2}>
          <Sidebar />
        </Col>
        <Col xs={10}>
          {content}
        </Col>
      </Row>
    </Container>
  )
}

export { BiddersPage }
