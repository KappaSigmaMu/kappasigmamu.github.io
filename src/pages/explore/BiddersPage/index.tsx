import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useKusama } from '../../../kusama'
import { BidsList } from './BidsList'

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

  return (content)
}

export { BiddersPage }
