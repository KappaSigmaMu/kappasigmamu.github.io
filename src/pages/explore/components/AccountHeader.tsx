import { AccountId } from '@polkadot/types/interfaces'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { Identicon } from './Identicon'
import { CopyButton } from '../../../components/CopyButton'

export function AccountHeader({ accountId }: { accountId: AccountId }) {
  return (
    <>
      <Row>
        <Col className="d-flex justify-content-center">
          <Identicon value={accountId.toHuman()} size={100} theme={'polkadot'} />
        </Col>
      </Row>
      <Row>
        <HashRow className="mx-auto">{accountId.toHuman()}</HashRow>
      </Row>
      <Row className="mt-3">
        <CopyButton content={accountId.toHuman()} />
      </Row>
    </>
  )
}

const HashRow = styled(Row)`
  margin-top: 30px;
  word-break: break-all;
  display: inline-block;
  width: 27ch;
  font-family: monospace;
`
