import { Button, Col, Row } from 'react-bootstrap'
import { useAccount } from '../../account/AccountContext'
import { useSociety } from '../../chain/society/SocietyContext'
import { isSameAddress } from '../../chain/ss58'
import { LoadingSpinner } from '../../pages/explore/components/LoadingSpinner'
import { FormatBalance } from '../FormatBalance'

const Bid = () => {
  const { activeAccount } = useAccount()
  const { data: bids, isLoading } = useSociety().bids
  const bid = bids?.find((item) => isSameAddress(item.who, activeAccount?.address))

  if (isLoading) return <LoadingSpinner center={false} small />

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
