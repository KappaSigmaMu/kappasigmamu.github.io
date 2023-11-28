import { Vec } from '@polkadot/types'
import { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useAccount } from '../../account/AccountContext'
import { FormattedKSM } from '../../helpers/FormattedKSM'
import { useKusama } from '../../kusama'

const Bid = () => {
  const { api } = useKusama()
  const { activeAccount } = useAccount()
  const [bidAmount, setBidAmount] = useState<string>('0')

  // useEffect(() => {
  //   if (api) {
  //     api.query.society.bids().then((bids: Vec<PalletSocietyBid>) => {
  //       const accountBid = bids.find((bid) => {
  //         activeAccount && bid.who.toHuman() === activeAccount.address
  //       })
  //       if (!accountBid) return setBidAmount('0')

  //       setBidAmount(accountBid.value.toHuman())
  //     })
  //   }
  // }, [api])

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h4>My Bid</h4>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <FormattedKSM>{bidAmount}</FormattedKSM>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button>Update</Button>
        </Col>
      </Row>
    </>
  )
}

export { Bid }
