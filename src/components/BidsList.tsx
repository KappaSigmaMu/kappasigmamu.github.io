import Identicon from '@polkadot/react-identicon'
import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { truncateAccountId } from '../helpers/accountId'
import { humanizeBidKind, humanizeBidValue } from '../helpers/humanize'
// import { CanaryIcon, GridIcon, ListIcon } from './assets'

const Filters = () => {
  return (
    <>
      {/* <Row style={{ marginBottom: 10 }}>
        <Col xs={4}>
          <ButtonToolbar aria-label="List format">
            <Button className="me-2" variant="outline-dark" style={{ color: '#707070', borderColor: '#707070' }}>
              <img src={CanaryIcon} alt="Canary" />
            </Button>
            <Button
              className="me-2"
              variant="dark"
              style={{ color: '#C4C4C4', backgroundColor: '#222222', borderColor: '#222222' }}
            >
              <img src={ListIcon} alt="List" />
            </Button>
            <Button className="me-2" variant="outline-dasrk" style={{ color: '#707070', borderColor: '#707070' }}>
              <img src={GridIcon} alt="Grid" />
            </Button>
          </ButtonToolbar>
        </Col>
        <Col xs={4} className="offset-4">
          <ButtonToolbar aria-label="List format" className="float-end">
            <Button
              className="me-2"
              variant="dark"
              style={{ fontWeight: 700, color: '#C4C4C4', backgroundColor: '#222222', borderColor: '#222222' }}
            >
              Lowest&nbsp;&nbsp;&nbsp;&nbsp;▾
            </Button>
            <Button className="me-2" variant="outline-dark" style={{ color: '#707070', borderColor: 'transparent' }}>
              Newest&nbsp;&nbsp;&nbsp;&nbsp;▾
            </Button>
          </ButtonToolbar>
        </Col>
      </Row> */}
    </>
  )
}

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

const BidsList = ({ bids }: { bids: any }): JSX.Element => {
  return (
    <>
      <Filters />
      <Header />
      {bids.map((bid: any) => (
        <DataRow key={bid.who} bid={bid} />
      ))}
    </>
  )
}

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
