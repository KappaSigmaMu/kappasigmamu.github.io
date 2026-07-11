import { Button, Col, Row } from 'react-bootstrap'
import { useAccount } from '../../account/AccountContext'
import { useAssetHub } from '../../chain/ChainProvider'
import { useChainQuery } from '../../chain/hooks'
import { getSocietyBids } from '../../chain/society/queries'
import { isSameAddress } from '../../chain/ss58'
import { FormatBalance } from '../FormatBalance'

const Bid = () => {
  const { api } = useAssetHub()
  const { activeAccount } = useAccount()
  const { data: bids } = useChainQuery(() => (api ? getSocietyBids(api) : undefined), [api])
  const bid = bids?.find((item) => isSameAddress(item.who, activeAccount?.address))

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h4>My Bid</h4>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <FormatBalance balance={bid?.value} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button>Update</Button>
        </Col>
      </Row>
    </>
  )
}

export { Bid }
