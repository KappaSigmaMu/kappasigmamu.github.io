import { Col, Row } from 'react-bootstrap'
import { useSociety } from '@/chain/society/SocietyContext'
import { FormatBalance } from '@/components/FormatBalance'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'

const RoundPayout = () => {
  const { data: info, isLoading } = useSociety().info
  if (isLoading) return <LoadingSpinner center={false} small />
  return (
    <>
      <Row className="mb-3">
        <Col>
          <h4>Round Payout</h4>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormatBalance balance={info?.pot} />
        </Col>
      </Row>
    </>
  )
}

export { RoundPayout }
