import Identicon from '@polkadot/react-identicon'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { humanizeBidKind, humanizeBidValue } from '../../../helpers/humanize'
import { truncateMiddle } from '../../../helpers/truncate'

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
      {truncateMiddle(bid.who?.toString())}
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
  line-height: 3;

  & .text-end {
    padding-right: 36px;
  }
`

const StyledDataRow = styled(StyledHeaderRow)`
  background-color: #343A40;
  border-radius: 6px;
  margin-top: 10px;
`

export { BidsList }
