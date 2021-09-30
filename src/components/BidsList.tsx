import Identicon from '@polkadot/react-identicon'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { truncateAccountId } from '../helpers/accountId'
import { humanizeBidKind, humanizeBidValue } from '../helpers/humanize'

const Header = () => (
  <StyledHeaderRow>
    <Col xs={1} className="text-center">#</Col>
    <Col xs={4} className="text-start">Wallet Hash</Col>
    <Col xs={5} className="text-start">Bid Kind</Col>
    <Col xs={2} className="text-end">Value</Col>
  </StyledHeaderRow>
)

const DataRow = ({ bid }: { bid: any }) => (
  <StyledDataRow key={bid.who?.toString()}>
    <Col xs={1} className="text-center">
      <Identicon value={bid.who} size={32} theme={'polkadot'} />
    </Col>
    <Col xs={4} className="text-start text-truncate">
      {truncateAccountId(bid.who?.toString())}
    </Col>
    <Col xs={5} className="text-start text-truncate">
      {humanizeBidKind(bid.kind)}
    </Col>
    <Col xs={2} className="text-end">
      {humanizeBidValue(bid.kind)}
    </Col>
  </StyledDataRow>
)

const BidsList = ({ bids }: { bids: any }): JSX.Element => (
  <>
    <Header />
    {bids.map((bid: any) => (
      <DataRow key={bid.who} bid={bid} />
    ))}
  </>
)

const StyledHeaderRow = styled(Row)`
  color: #fff;
  lineHeight: 3;

  .text-end {
    padding-right: 36;
  }
`

const StyledDataRow = styled(StyledHeaderRow)`
  backgroundColor: #343A40;
  borderRadius: 6px;
  marginTop: 5px;
`

export { BidsList }
