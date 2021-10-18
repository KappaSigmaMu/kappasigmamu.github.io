import type { DeriveSociety } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { FormattedKSM } from '../../helpers/FormattedKSM'
import { useKusama } from '../../kusama'

const RoundPayout = () => {
  const { api } = useKusama()
  const [info, setInfo] = useState<DeriveSociety | any>()

  useEffect(() => {
    if (api) {
      api.derive.society.info().then((response) => {
        setInfo(response)
      })
    }
  }, [api])

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h4>Round Payout</h4>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormattedKSM>{info?.pot.toHuman().substring(0, 5)}</FormattedKSM>
        </Col>
      </Row>
    </>
  )
}

export { RoundPayout }
