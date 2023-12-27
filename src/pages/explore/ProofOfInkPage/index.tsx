import { ApiPromise } from '@polkadot/api'
import Identicon from '@polkadot/react-identicon'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useRef, useState } from 'react'
import { Badge, Col, Row } from 'react-bootstrap'
import { draw, PADD, SIZE } from './helpers/draw'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { AccountIndex } from '../../../components/AccountIndex'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { LoadingSpinner } from '../components/LoadingSpinner'

const CANVAS_STYLE = {
  display: 'block',
  margin: '0 auto',
  backgroundColor: 'white'
}

const HEIGHT = SIZE * 2 + PADD * 1
const WIDTH = SIZE * 3 + PADD * 2

type ProofOfInkPageProps = {
  api: ApiPromise | null
}

const ProofOfInkPage = ({ api }: ProofOfInkPageProps): JSX.Element => {
  const society = api?.query?.society

  const [head, setHead] = useState<AccountId | null>(null)

  useEffect(() => {
    society?.head().then((head) => setHead(head.unwrap()))
  }, [society])

  console.info(head)

  return head === null ? (
    <LoadingSpinner />
  ) : (
    <>
      <DataHeaderRow>
        <Col xs={1} className="text-center">
          #
        </Col>
        <Col xs={5} className="text-start">
          Wallet Hash
        </Col>
        <Col xs={2} className="text-start">
          Identity
        </Col>
        <Col xs={2} className="text-start">
          Index
        </Col>
        <Col xs={2} className="text-end"></Col>
      </DataHeaderRow>

      <DataRow>
        <Col xs={1} className="text-center">
          <Identicon value={head.toHuman()} size={32} theme={'polkadot'} />
        </Col>
        <Col xs={5} className="text-start text-truncate">
          {head.toHuman()}
        </Col>
        <Col xs={2} className="text-start text-truncate">
          <AccountIdentity api={api!} accountId={head} />
        </Col>
        <Col xs={2} className="text-start text-truncate">
          <AccountIndex api={api!} accountId={head} />
        </Col>
        <Col xs={2}>
          <Badge pill bg="dark" className="me-2 p-2">
            Society Head
          </Badge>
        </Col>
      </DataRow>

      <br />

      <Row className="justify-content-center">
        <h1 className="text-center">Proof-of-Ink Examples</h1>
      </Row>
      <Row className="justify-content-center">
        <h6 className="text-center">(auto-generated based on the current head)</h6>
      </Row>

      <br />

      <div className="align-items-center">
        <Row>
          <DesignKusama accountId={head} />
        </Row>
      </div>
    </>
  )
}

function DesignKusama({ accountId }: { accountId: AccountId }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect((): void => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')

      if (ctx) {
        draw(ctx, accountId)
      }
    }
  })

  return <canvas height={HEIGHT} ref={canvasRef} style={CANVAS_STYLE} width={WIDTH} />
}

export { ProofOfInkPage }
