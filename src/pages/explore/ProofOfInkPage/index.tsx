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
  backgroundColor: 'white',
  letterSpacing: '0.015em'
}

// TODO: fix me - 3 if index is set, 2 if not
const HEIGHT = SIZE * 3 + PADD * 1
const WIDTH = SIZE * 3 + PADD * 2

type ProofOfInkPageProps = {
  api: ApiPromise | null
}

const ProofOfInkPage = ({ api }: ProofOfInkPageProps): JSX.Element => {
  const society = api?.query?.society

  const [head, setHead] = useState<AccountId | null>(null)
  const [marginLeft, setMarginLeft] = useState('')
  const [index, setIndex] = useState('')

  const handleIndex = (index: string) => {
    setIndex(index)
  }

  useEffect(() => {
    const containerElement = document.querySelector('.container')

    if (containerElement) {
      const style = window.getComputedStyle(containerElement)
      setMarginLeft(style.marginLeft)
    }
  }, [])

  useEffect(() => {
    society?.head().then((head) => setHead(head.unwrap()))
  }, [society])

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
          <AccountIdentity api={api!} accountId={head} hideNotSet />
        </Col>
        <Col xs={2} className="text-start text-truncate">
          <AccountIndex api={api!} accountId={head} callback={handleIndex} />
        </Col>
        <Col xs={2} className="text-end">
          <Badge pill bg="primary" className="me-2 p-2">
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

      <div
        className="d-flex justify-content-center"
        style={{ width: '100vw', padding: '5vw', backgroundColor: 'white', marginLeft: `-${marginLeft}` }}
      >
        <div className="align-items-center" style={{ width: '70vw' }}>
          <DesignKusama accountId={head} accountIndex={index} />
        </div>
      </div>

      <div style={{ marginTop: '200px' }}></div>
    </>
  )
}

function DesignKusama({ accountId, accountIndex }: { accountId: AccountId; accountIndex: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect((): void => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')

      if (ctx) {
        draw(ctx, accountId, accountIndex)
      }
    }
  })

  return <canvas height={HEIGHT} ref={canvasRef} style={CANVAS_STYLE} width={WIDTH} />
}

export { ProofOfInkPage }
