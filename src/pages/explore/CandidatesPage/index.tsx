import { ApiPromise } from '@polkadot/api'
import { DeriveSocietyCandidate } from '@polkadot/api-derive/types'
import Identicon from '@polkadot/react-identicon'
import { Col, Spinner } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { FormatBalance } from '../../../components/FormatBalance'
import { truncateMiddle } from '../../../helpers/truncate'

type CandidatesPageProps = {
  api: ApiPromise | null,
  candidates: SocietyCandidate[]
}

const CandidatesPage = ({ api, candidates }: CandidatesPageProps): JSX.Element => {
  const loading = !api?.query?.society
  const content = loading
    ? <Spinner animation="border" variant="primary" />
    : <>
      <DataHeaderRow>
        <Col xs={1} className="text-start">#</Col>
        <Col xs={3} className="text-start">Wallet Hash</Col>
        <Col className="text-start">Bid Kind</Col>
        <Col></Col>
        <Col></Col>
      </DataHeaderRow>

      {candidates.length > 0
        ? candidates.map((candidate: DeriveSocietyCandidate) => (
          <DataRow key={candidate.accountId.toString()}>
            <Col xs={1} className="text-start">
              <Identicon value={candidate.accountId} size={32} theme={'polkadot'} />
            </Col>
            <Col xs={3} className="text-start text-truncate">
              {truncateMiddle(candidate.accountId?.toString())}
            </Col>
            <Col>
              {candidate.kind.isDeposit
                ? 'Deposit'
                : 'Vouch'
              }
            </Col>
            <Col className="text-start">
              {candidate.kind.isDeposit
                ? <FormatBalance balance={candidate.value} />
                : <p>
                    Vouching Member: {candidate.kind.asVouch[0].toHuman()} -
                    Vouching Tip: {candidate.kind.asVouch[1].toHuman()}
                  </p>
              }
            </Col>
            <Col>
              Skeptics
            </Col>
          </ DataRow>
        ))
        : 'NONE'
      }
    </>

  return (content)
}

export { CandidatesPage }
