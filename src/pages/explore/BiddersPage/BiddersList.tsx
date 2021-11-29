import Identicon from '@polkadot/react-identicon'
import { Col } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { humanizeBidKind, humanizeBidValue } from '../../../helpers/humanize'
import { truncateMiddle } from '../../../helpers/truncate'

const BiddersList = ({ bids }: { bids: any }): JSX.Element => (
  <>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={4} className="text-start">Wallet Hash</Col>
      <Col xs={5} className="text-start">Bid Kind</Col>
      <Col xs={2} className="text-end">Value</Col>
    </DataHeaderRow>
    {bids.map((bid: any) => (
      <DataRow key={bid.who?.toString()}>
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
      </DataRow>
    ))}
  </>
)

export { BiddersList }
