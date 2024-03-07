import { ApiPromise } from '@polkadot/api'
import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { Col, Badge } from 'react-bootstrap'
import styled from 'styled-components'
import { unbid, unvouch } from './helper'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { FormatBalance } from '../../../components/FormatBalance'
import { humanizeBidKind } from '../../../helpers/humanize'
import { Identicon } from '../components/Identicon'

type Props = {
  api: ApiPromise
  bids: Vec<PalletSocietyBid>
  activeAccount: WalletAccount | undefined
  handleResult: any
}

type OnStatusChangeProps = { loading: boolean; message: string; status: string }

// TODO: move this to a `components` directory to follow the convention of other pages
const BiddersList = ({ api, bids, activeAccount, handleResult }: Props): JSX.Element => {
  const [loading, setLoading] = useState(false)

  const isBidder = (bid: PalletSocietyBid) => activeAccount?.address === bid.who.toString()
  const isVoucher = (bid: PalletSocietyBid) => activeAccount?.address === bid.kind.asVouch?.[0].toString()

  const onStatusChange = ({ loading, message, status }: OnStatusChangeProps) => {
    setLoading(loading)
    handleResult({ message, status })
  }

  const handleUnbid = () => {
    const tx = api.tx.society.unbid()
    unbid(api, tx, activeAccount, onStatusChange)
  }

  const handleUnvouch = () => {
    const tx = api.tx.society.unvouch()
    unvouch(api, tx, activeAccount, onStatusChange)
  }

  const ownerActions = (bid: PalletSocietyBid) => {
    let pillText, handleUndo: any, badgeText

    if (bid.kind.isDeposit && isBidder(bid)) {
      pillText = 'My bid'
      handleUndo = handleUnbid
      badgeText = 'UNBID'
    } else if (bid.kind.isVouch && isVoucher(bid)) {
      pillText = 'My vouch'
      handleUndo = handleUnvouch
      badgeText = 'UNVOUCH'
    }

    return { pillText, handleUndo, badgeText }
  }

  const BidVouchIdentifier = ({ bid, index }: { bid: PalletSocietyBid; index: number }) => {
    const { pillText, badgeText, handleUndo } = ownerActions(bid)

    return (
      <>
        <Col lg={2} className="text-center text-lg-start text-truncate">
          {<FormatBalance balance={bid.value} />}
        </Col>
        <Col lg={2} className="text-center text-lg-start text-truncate">
          {bid.kind.isVouch && <FormatBalance balance={bid.kind.asVouch?.[1]} />}
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          {badgeText && (
            <>
              <StyledUndo disabled={loading} onClick={() => handleUndo(index)} href="#">
                {badgeText}
              </StyledUndo>
              <Badge pill bg="primary">
                {pillText}
              </Badge>
            </>
          )}
        </Col>
      </>
    )
  }

  const isOwner = (bid: PalletSocietyBid) => {
    if (bid.kind.isDeposit) {
      return isBidder(bid)
    } else if (bid.kind.isVouch) {
      return isVoucher(bid)
    }
  }

  if (bids.length === 0) return <>No bids</>

  return (
    <>
      <DataHeaderRow className="d-none d-lg-flex text-center">
        <Col lg={1}>#</Col>
        <Col lg={3} className="text-center text-lg-start">
          Wallet Hash
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Bid Kind
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Value
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Tip
        </Col>
      </DataHeaderRow>

      {bids.map((bid: PalletSocietyBid, index: any) => (
        <StyledDataRow $isOwner={isOwner(bid)} key={bid.who?.toString()}>
          <Col lg={1} className="text-center">
            <Identicon value={bid.who.toHuman()} size={32} theme={'polkadot'} />
          </Col>
          <Col lg={3} className="text-center text-lg-start text-truncate">
            <AccountIdentity api={api} accountId={bid.who} />
          </Col>
          <Col lg={2} className="text-center text-lg-start text-truncate">
            {humanizeBidKind(bid.kind)}
          </Col>
          <BidVouchIdentifier bid={bid} index={index} />
        </StyledDataRow>
      ))}
    </>
  )
}

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => (props.$isOwner ? '#73003d' : '')};
  border: ${(props) => (props.$isOwner ? '2px solid #E6007A' : '')};
`

type PropsUnbid = {
  disabled: boolean
}

const StyledUndo = styled.a<PropsUnbid>`
  color: ${(props) => (props.disabled ? 'grey' : '#E6007A')};
  margin-right: 3%;
  font-weight: 800;
  font-size: 13px;
  pointer-events: ${(props) => (props.disabled ? 'none' : '')};
`

export { BiddersList }
