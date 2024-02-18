import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useRef, useState } from 'react'
import { Badge, Col, Row } from 'react-bootstrap'
import { draw, PADD, SIZE } from './helpers/draw'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { AccountIndex } from '../../../components/AccountIndex'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { Identicon } from '../components/Identicon'
import { LoadingSpinner } from '../components/LoadingSpinner'

type ExamplesPageProps = {
  api: ApiPromise | null
}

const ExamplesPage = ({ api }: ExamplesPageProps): JSX.Element => {
  const society = api?.query?.society

  const [head, setHead] = useState<AccountId | null>(null)
  const [index, setIndex] = useState('')

  const handleIndex = (index: string) => {
    setIndex(index)
  }

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
        style={{ width: '100%', padding: '5vw', backgroundColor: 'white', marginBottom: '100px' }}
      >
        <div className="align-items-center" style={{ width: '70vw' }}>
          <DesignKusama accountId={head} accountIndex={index} />
        </div>
      </div>
    </>
  )
}

function DesignKusama({ accountId, accountIndex }: { accountId: AccountId; accountIndex: string }) {
  const canvasStyle = {
    display: 'block',
    margin: '0 auto',
    backgroundColor: 'white',
    letterSpacing: '0.015em'
  }

  const rows = accountIndex ? 3 : 2
  const height = SIZE * rows + PADD * 1
  const width = SIZE * 3 + PADD * 2

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect((): void => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')

      if (ctx) {
        draw(ctx, accountId, accountIndex)
      }
    }
  })

  return <canvas height={height} ref={canvasRef} style={canvasStyle} width={width} />
}

export { ExamplesPage }
