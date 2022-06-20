import Identicon from '@polkadot/react-identicon'
import { Col } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { FormatBalance } from '../../../../components/FormatBalance'
import { truncate, truncateMiddle } from '../../../../helpers/truncate'

const CandidatesList = ({ candidates }: { candidates: SocietyCandidate[] }): JSX.Element => {
  if (candidates.length === 0) return (
    <>No candidates</>
  )
  
  return (<>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={3} className="text-start">Wallet Hash</Col>
      <Col className="text-start">Bid Kind</Col>
      <Col></Col>
      <Col></Col>
    </DataHeaderRow>
    
    {candidates.map((candidate: SocietyCandidate) => (
      <DataRow key={candidate.accountId.toString()}>
        <Col xs={1} className="text-center">
          <Identicon value={candidate.accountId} size={32} theme={'polkadot'} />
        </Col>
        <Col xs={3} className="text-start text-truncate">
          {truncateMiddle(candidate.accountId?.toString())}
        </Col>
        <Col xs={1}>
          {candidate.kind.isDeposit ? 'Deposit' : 'Vouch'}
        </Col>
        <Col xs={4} className="text-start">
          {candidate.kind.isDeposit
            ? <FormatBalance balance={candidate.value} />
            : (<>
                Member: {truncate(candidate.kind.asVouch[0].toHuman(), 7)} |
                Tip: {<FormatBalance balance={candidate.kind.asVouch[1]}></FormatBalance>}
               </>)}
        </Col>
        <Col xs={3}>
          Skeptics
        </Col>
      </DataRow>))}
  </>)
}

export { CandidatesList }
