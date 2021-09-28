import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState } from 'react'
import { Container, Col, Row } from 'react-bootstrap'
import { BidsList } from '../../../components/BidsList'
import { Navbar } from '../../../components/Navbar'
import { Sidebar } from '../../../components/Sidebar'
import { useSubstrate } from '../../../substrate'

const Page = ({
  accounts,
  activeAccount,
  setAccounts,
  setActiveAccount,
}: {
  setActiveAccount: (activeAccount: string) => void
  activeAccount: string
  accounts: { name: string | undefined; address: string }[]
  setAccounts: (accounts: { name: string | undefined; address: string }[]) => void
}): JSX.Element => {
  const { api } = useSubstrate()
  const [bids, setBids] = useState<Vec<PalletSocietyBid> | []>([])

  useEffect(() => {
    if (!api) { return }
    api.query.society.bids().then((response: Vec<PalletSocietyBid>) => {
      setBids(response)
    })
  }, [api])

  return (
    <>
      <Navbar
        accounts={accounts}
        activeAccount={activeAccount}
        setAccounts={setAccounts}
        setActiveAccount={setActiveAccount}
        showAccount
        showBrandIcon
        showGalleryButton
      />
      <Container>
        <Row style={{ marginTop: 60 }}>
          <Col xs={2}>
            <Sidebar />
          </Col>
          <Col xs={10}>
            <BidsList data={bids} />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export { Page }
