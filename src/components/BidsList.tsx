import Identicon from '@polkadot/react-identicon'
import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap'
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
  <Row style={{ color: '#fff', lineHeight: 3 }}>
    <Col xs={1} className="text-center">#</Col>
    <Col xs={4} className="text-start">Wallet Hash</Col>
    <Col xs={5} className="text-start">Bid Kind</Col>
    <Col xs={2} className="text-end" style={{ paddingRight: 36 }}>Value</Col>
  </Row>
)

const DataRow = ({ item }: { item: any }) => (
  <Row
    key={item.who?.toString()}
    style={{ color: '#fff', lineHeight: 3, marginTop: 5, backgroundColor: '#343A40', borderRadius: 6 }}
  >
    <Col xs={1} className="text-center">
      <Identicon value={item.who} size={32} theme={'polkadot'} />
    </Col>
    <Col xs={4} className="text-start text-truncate">
      {truncateAccountId(item.who?.toString())}
    </Col>
    <Col xs={5} className="text-start text-truncate">
      {humanizeBidKind(item.kind)}
    </Col>
    <Col xs={2} className="text-end" style={{ paddingRight: 36 }}>
    {humanizeBidValue(item.kind)}
    </Col>
  </Row>

)

const BidsList = ({ data }: { data: any }): JSX.Element => {
  return (
    <>
      <Filters />
      <Header />
      {data.map((item: any) => (
        <DataRow key={item.who} item={item} />
      ))}
    </>
  )
}

export { BidsList }
