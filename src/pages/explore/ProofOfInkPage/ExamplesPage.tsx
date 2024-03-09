import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useRef, useState } from 'react'
import { Badge, Col, Row } from 'react-bootstrap'
import { styled } from 'styled-components'
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
      <DataHeaderRow className="d-none d-lg-flex text-center">
        <Col lg={1} className="text-center">
          #
        </Col>
        <Col lg={5} className="text-center text-lg-start">
          Wallet Hash
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Index
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Identity
        </Col>
        <Col lg={2}></Col>
      </DataHeaderRow>

      <StyledDataRow>
        <Col lg={1} className="text-center">
          <Identicon value={head.toHuman()} size={32} theme={'polkadot'} />
        </Col>
        <Col lg={5} className="text-center text-lg-start text-truncate">
          {head.toHuman()}
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          <AccountIndex api={api!} accountId={head} callback={handleIndex} />
        </Col>
        <Col lg={2} className="text-center text-lg-start text-truncate">
          <AccountIdentity api={api!} accountId={head} hideNotSet />
        </Col>
        <Col lg={2} className="text-center text-lg-end">
          <Badge pill bg="primary" className="me-2 p-2">
            Society Head
          </Badge>
        </Col>
      </StyledDataRow>

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
    letterSpacing: '0.015em',
    width: '100%'
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

const StyledDataRow = styled(DataRow)`
  @media (max-width: 992px) {
    padding-block: 12px;
    margin-inline: 2px;
  }
`

export { ExamplesPage }
