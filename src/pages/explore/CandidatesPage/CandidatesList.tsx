import { DeriveSocietyCandidate } from '@polkadot/api-derive/types'
import Identicon from '@polkadot/react-identicon'
import { Col } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../components/base'

const CandidatesList = ({ candidates }: { candidates: any }): JSX.Element => (
  <>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={1} className="text-center">Suspended</Col>
      <Col xs={1} className="text-center">Value</Col>
      <Col xs={1} className="text-center">Deposit</Col>
    </DataHeaderRow>

    {candidates.length > 0
      ? candidates.map((candidate: DeriveSocietyCandidate) => (
        <DataRow key={candidate.accountId.toString()}>
          <Col xs={1} className="text-center">
            <Identicon value={candidate.accountId} size={32} theme={'polkadot'} />
          </Col>
          <Col xs={1} className="text-center">
            {candidate.isSuspended ? 'true' : 'false'}
          </Col>
          <Col xs={1} className="text-center">
            {candidate.value.toHuman()}
          </Col>
          <Col xs={1} className="text-center">
            {candidate.kind.isDeposit
              ? <p>{candidate.kind.asDeposit.toHuman()}</p>
              : <p>
                  Vouching Member: {candidate.kind.asVouch[0].toHuman()} -
                  Vouching Tip: {candidate.kind.asVouch[1].toHuman()}
                </p>
            }
          </Col>
        </ DataRow>
      ))
      : 'NONE'
    }

  </>
)

export { CandidatesList }
