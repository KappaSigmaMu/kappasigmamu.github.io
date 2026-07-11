import { useEffect, useRef, useState } from 'react'
import { Badge, Col, Row } from 'react-bootstrap'
import { styled } from 'styled-components'
import { draw, PADD, SIZE } from './helpers/draw'
import { useAssetHub } from '../../../chain/ChainProvider'
import { useChainQuery } from '../../../chain/hooks'
import type { AccountId } from '../../../chain/types'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { AccountIndex } from '../../../components/AccountIndex'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { ChainError } from '../components/ChainError'
import { Identicon } from '../components/Identicon'
import { LoadingSpinner } from '../components/LoadingSpinner'

const ExamplesPage = (): JSX.Element => {
  const { api } = useAssetHub(); const state = useChainQuery(() => api?.query.Society.Head.getValue(), [api]); const [index, setIndex] = useState(''); const head = state.data
  if (state.error) return <ChainError error={state.error} onRetry={state.refetch} />
  if (!head) return <LoadingSpinner />
  return <><DataHeaderRow className="d-none d-lg-flex text-center"><Col lg={1} className="text-center">#</Col><Col lg={5} className="text-center text-lg-start">Wallet Hash</Col><Col lg={2} className="text-center text-lg-start">Index</Col><Col lg={2} className="text-center text-lg-start">Identity</Col><Col lg={2}></Col></DataHeaderRow><StyledDataRow><Col lg={1} className="text-center"><Identicon value={head} size={32} theme="polkadot" /></Col><Col lg={5} className="text-center text-lg-start text-truncate">{head}</Col><Col lg={2} className="text-center text-lg-start"><AccountIndex accountId={head} callback={setIndex} /></Col><Col lg={2} className="text-center text-lg-start text-truncate"><AccountIdentity accountId={head} hideNotSet /></Col><Col lg={2} className="text-center text-lg-end"><Badge pill bg="primary" className="me-2 p-2">Society Head</Badge></Col></StyledDataRow><br /><Row className="justify-content-center"><h1 className="text-center">Proof-of-Ink Examples</h1></Row><Row className="justify-content-center"><h6 className="text-center">(auto-generated based on the current head)</h6></Row><br /><div className="d-flex justify-content-center" style={{ width: '100%', padding: '5vw', backgroundColor: 'white', marginBottom: '100px' }}><div className="align-items-center" style={{ width: '70vw' }}><DesignKusama accountId={head} accountIndex={index} /></div></div></>
}

function DesignKusama({ accountId, accountIndex }: { accountId: AccountId; accountIndex: string }) { const rows = accountIndex ? 3 : 2; const canvasRef = useRef<HTMLCanvasElement | null>(null); useEffect(() => { const ctx = canvasRef.current?.getContext('2d'); if (ctx) draw(ctx, accountId, accountIndex) }, [accountId, accountIndex]); return <canvas height={SIZE * rows + PADD} ref={canvasRef} style={{ display: 'block', margin: '0 auto', backgroundColor: 'white', letterSpacing: '0.015em', width: '100%' }} width={SIZE * 3 + PADD * 2} /> }
const StyledDataRow = styled(DataRow)`@media (max-width: 992px) { padding-block: 12px; margin-inline: 2px; }`
export { ExamplesPage }
