import Identicon from '@polkadot/react-identicon'
import { Col, Badge } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { humanizeBidKind } from '../../../helpers/humanize'

import styled from 'styled-components'
import { truncateMiddle } from '../../../helpers/truncate'

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => props.isBidder ? '#73003d' : ''};
  border: ${(props) => props.isBidder ? '2px solid #E6007A' : ''};
`

const StyledUnbid = styled.a`
  color: #E6007A;
  font-weight: 800;
  font-size: 13px;
`

const BiddersList = ({ bids, activeAccount, handleUnbid }: { bids: any, activeAccount: any; handleUnbid: any }): JSX.Element => {
  const isBidder = (bidAddress : string) => activeAccount.address === bidAddress

  return (
    <>
      <DataHeaderRow>
        <Col xs={1} className="text-center">#</Col>
        <Col xs={4} className="text-start">Wallet Hash</Col>
        <Col xs={2} className="text-start">Bid Kind</Col>
        <Col xs={4} className="text-end" style={{ paddingRight: 0 }}>Value</Col>
      </DataHeaderRow>
      {bids.map((bid: any) => {
        const _isBidder = isBidder(bid.who.toString())
        return (
          <StyledDataRow isBidder={_isBidder} key={bid.who?.toString()}>
            <Col xs={1} className="text-center">
              <Identicon value={bid.who} size={32} theme={'polkadot'} />
            </Col>
            <Col xs={4} className="text-start text-truncate">
              {truncateMiddle(bid.who?.toString())}
            </Col>
            <Col xs={2} className="text-start text-truncate">
              {humanizeBidKind(bid.kind)}
            </Col>
            <Col xs={4} className="text-end" style={{ paddingRight: 0 }}>
              {_isBidder && <Badge pill bg="primary">My bid</Badge>}{' '}
              {bid.value.toHuman()} KSM
            </Col>
            <Col xs={1} className="text-start">
              {_isBidder && <StyledUnbid onClick={handleUnbid} href="#">UNBID</StyledUnbid>}
            </Col>
          </StyledDataRow>
        )
      })}
    </>
  )
}

export { BiddersList }
