import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState } from 'react'
import { Container, Col, Row } from 'react-bootstrap'
import { BidsList } from '../../../components/BidsList'
import { Sidebar } from '../../../components/Sidebar'
import { useSubstrate } from '../../../substrate'

const Page = (): JSX.Element => {
  const { api } = useSubstrate()
  const [bids, setBids] = useState<Vec<PalletSocietyBid> | []>([])

  useEffect(() => {
    if (api) {
      api.query.society.bids().then((response: Vec<PalletSocietyBid>) => {
        setBids(response)
      })
    }
  }, [api])

  return (
    <Container>
      <Row>
        <Col xs={2}>
          <Sidebar />
        </Col>
        <Col xs={10}>
          <BidsList bids={bids} />
        </Col>
      </Row>
    </Container>
  )
}

export { Page }
