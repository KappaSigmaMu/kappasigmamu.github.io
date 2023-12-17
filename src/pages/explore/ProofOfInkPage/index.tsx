import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useRef, useState } from 'react'
import { Row } from 'react-bootstrap'
import { draw, PADD, SIZE } from './helpers/draw'
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

  return head === null ? (
    <LoadingSpinner />
  ) : (
    <>
      <Row className="d-flex align-items-center">Current head is: {head.toHuman()}</Row>
      <br />
      <Row className="d-flex align-items-center">Proof-of-ink examples (auto-generated based on the current head):</Row>
      <br />
      <DesignKusama accountId={head} />
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
