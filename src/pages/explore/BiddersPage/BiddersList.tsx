import Identicon from '@polkadot/react-identicon'
import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { useState } from 'react'
import { Col, Badge } from 'react-bootstrap'
import styled from 'styled-components'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { humanizeBidKind, humanizeBidValue, humanizeVouchValue } from '../../../helpers/humanize'
import { truncateMiddle } from '../../../helpers/truncate'
import { useKusama } from '../../../kusama'
import { unbid, unvouch } from './helper'

type Props = { bids: Vec<PalletSocietyBid> | [], activeAccount: accountType; handleResult: any }

const BiddersList = ({ bids, activeAccount, handleResult } : Props) : JSX.Element => {
  const { api, apiState } = useKusama()
  const [loading, setLoading] = useState(false)

  const isBidder = (bid : PalletSocietyBid) => activeAccount?.address === bid.who.toString()
  const isVoucher = (bid : PalletSocietyBid) => activeAccount?.address === bid.kind.asVouch?.[0].toString()

  const apiReady = apiState === 'READY'

  const onStatusChange = ({ loading, text } : { loading : boolean, text : string }) => {
    setLoading(loading)
    handleResult(text)
  }

  const handleUnbid = (index : any) => {
    const tx = api?.tx?.society?.unbid(index)
    apiReady && unbid(tx, activeAccount, onStatusChange)
  }

  const handleUnvouch = (index : any) => {
    const tx = api?.tx?.society?.unvouch(index)
    apiReady && unvouch(tx, activeAccount, onStatusChange)
  }

  const BidVouchIdentifier = ({ bid, index } : { bid: PalletSocietyBid, index : number }) => {
    let badge = <></>
    let badgeText = ""
    let handleAction : any

    if (bid.kind.isDeposit) {
      if (isBidder(bid)) {
        badge = <Badge pill bg="primary">My bid</Badge>
        handleAction = handleUnbid
        badgeText = 'UNBID'
     }
    } else if (bid.kind.isVouch) {
      if (isVoucher(bid)) {
        badge = <Badge pill bg="primary">My vouch</Badge>
        handleAction = handleUnvouch
        badgeText = 'UNVOUCH'
      }
    }

    return (
      <>
        <Col xs={2}>
          {humanizeBidValue(bid)}
          {' '}{badge}
        </Col>
        <Col xs={2}>
          {humanizeVouchValue(bid.kind)}
        </Col>
        <Col xs={1} className="text-end">
          {badgeText &&
            <StyledUndo disabled={loading} onClick={() => handleAction(index)} href="#">{badgeText}</StyledUndo>
          }
        </Col>
      </>
    )
  }

  const isOwner = (bid : PalletSocietyBid) => {
    if (bid.kind.isDeposit) {
      return isBidder(bid)
    } else if (bid.kind.isVouch) {
      return isVoucher(bid)
    }
  }

  return (
    <>
      <DataHeaderRow>
        <Col xs={1} className="text-center">#</Col>
        <Col xs={3} className="text-start">Wallet Hash</Col>
        <Col xs={2} className="text-start">Bid Kind</Col>
        <Col xs={2} className="text-start">Value</Col>
        <Col xs={3} className="text-start" style={{ paddingRight: 0 }}>Tip</Col>
      </DataHeaderRow>
      {bids.map((bid : PalletSocietyBid, index : any) => (
        <StyledDataRow isOwner={isOwner(bid)} key={bid.who?.toString()}>
          <Col xs={1} className="text-center">
            <Identicon value={bid.who} size={32} theme={'polkadot'} />
          </Col>
          <Col xs={3} className="text-start text-truncate">
            {truncateMiddle(bid.who?.toString())}
          </Col>
          <Col xs={2} className="text-start text-truncate">
            {humanizeBidKind(bid.kind)}
          </Col>
          <BidVouchIdentifier bid={bid} index={index} />
        </StyledDataRow>
      ))}
    </>
  )
}

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => props.isOwner ? '#73003d' : ''};
  border: ${(props) => props.isOwner ? '2px solid #E6007A' : ''};
`

type PropsUnbid = {
  disabled: boolean;
};

const StyledUndo = styled.a.attrs((props : PropsUnbid) => ({
  disabled: props.disabled
}))<PropsUnbid>`
  color: ${(props) => props.disabled ? 'grey' : '#E6007A'};
  font-weight: 800;
  font-size: 13px;
  pointer-events: ${(props) => props.disabled ? 'none' : ''};
`

export { BiddersList }
