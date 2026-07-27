import type { WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { Badge, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../../../account/AccountContext'
import { useAssetHub } from '../../../chain/ChainProvider'
import { submitTx } from '../../../chain/society/tx'
import { isSameAddress } from '../../../chain/ss58'
import type { ExtrinsicResult } from '../../../chain/types'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { FormatBalance } from '../../../components/FormatBalance'
import { humanizeBidKindType, type BidRow as DisplayBidRow } from '../../../helpers/bidKind'
import { Identicon } from '../components/Identicon'

type Props = {
  bids: DisplayBidRow[]
  activeAccount: WalletAccount | undefined
  handleResult: (result: ExtrinsicResult) => void
}

const BiddersList = ({ bids, activeAccount, handleResult }: Props): JSX.Element => {
  const { api } = useAssetHub()
  const { polkadotSigner } = useAccount()
  const [loading, setLoading] = useState(false)

  const onStatusChange = ({ loading: nextLoading, message, status }: ExtrinsicResult) => {
    setLoading(Boolean(nextLoading))
    handleResult({ message, status })
  }

  const handleUnbid = () => {
    if (!api) return
    void submitTx(api.tx.Society.unbid(), polkadotSigner, {
      finalizedText: 'Bid removed successfully. You became Human again.',
      onStatusChange
    })
  }

  const handleUnvouch = () => {
    if (!api) return
    void submitTx(api.tx.Society.unvouch(), polkadotSigner, {
      finalizedText: 'Vouch removed successfully.',
      onStatusChange
    })
  }

  const isBidder = (bid: DisplayBidRow) => isSameAddress(activeAccount?.address, bid.who)
  const isVoucher = (bid: DisplayBidRow) =>
    Boolean(
      activeAccount &&
        bid.kindType === 'Vouch' &&
        bid.vouchAccount &&
        isSameAddress(activeAccount.address, bid.vouchAccount)
    )

  if (bids.length === 0) return <>No bids</>

  return (
    <div data-test="bidders-list">
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
      {bids.map((bid) => {
        const owner = bid.kindType === 'Deposit' ? isBidder(bid) : isVoucher(bid)
        const canUndo = bid.kindType === 'Deposit' ? isBidder(bid) : isVoucher(bid)
        return (
          <StyledDataRow $isOwner={owner} key={bid.who} data-test={`bid-row-${bid.who}`}>
            <Col lg={1} className="text-center">
              <Identicon value={bid.who} size={32} theme="polkadot" />
            </Col>
            <Col lg={3} className="text-center text-lg-start text-truncate">
              <AccountIdentity accountId={bid.who} />
            </Col>
            <Col lg={2} className="text-center text-lg-start text-truncate">
              {humanizeBidKindType(bid.kindType, bid.vouchAccount)}
            </Col>
            <Col lg={2} className="text-center text-lg-start text-truncate">
              <FormatBalance balance={bid.value} />
            </Col>
            <Col lg={2} className="text-center text-lg-start text-truncate">
              {bid.kindType === 'Vouch' && bid.vouchTip ? <FormatBalance balance={bid.vouchTip} /> : null}
            </Col>
            <Col lg={2} className="text-center text-lg-start">
              {canUndo && (
                <>
                  <StyledUndo
                    $disabled={loading}
                    onClick={(event) => {
                      event.preventDefault()
                      bid.kindType === 'Deposit' ? handleUnbid() : handleUnvouch()
                    }}
                    href="#"
                    data-test={bid.kindType === 'Deposit' ? 'unbid-button' : 'unvouch-button'}
                  >
                    {bid.kindType === 'Deposit' ? 'UNBID' : 'UNVOUCH'}
                  </StyledUndo>
                  <Badge pill bg="primary">
                    {bid.kindType === 'Deposit' ? 'My bid' : 'My vouch'}
                  </Badge>
                </>
              )}
            </Col>
          </StyledDataRow>
        )
      })}
    </div>
  )
}

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => (props.$isOwner ? '#73003d' : '')};
  border: ${(props) => (props.$isOwner ? '2px solid #E6007A' : '')};
  @media (max-width: 992px) {
    padding-block: 12px;
    margin-inline: 2px;
  }
`
const StyledUndo = styled.a<{ $disabled: boolean }>`
  color: ${(props) => (props.$disabled ? 'grey' : '#E6007A')};
  margin-right: 3%;
  font-weight: 800;
  font-size: 13px;
  pointer-events: ${(props) => (props.$disabled ? 'none' : '')};
`

export { BiddersList }
