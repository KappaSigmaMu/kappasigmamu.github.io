import { ApiPromise } from '@polkadot/api'
import Identicon from '@polkadot/react-identicon'
import { useState } from 'react'
import { Col } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { FormatBalance } from '../../../../components/FormatBalance'
import { truncate, truncateMiddle } from '../../../../helpers/truncate'
import ApproveIcon from '../../../../static/approve-icon.svg'
import RejectIcon from '../../../../static/reject-icon.svg'
import { StyledAlert } from '../../components/StyledAlert'
import { VoteButton } from './VoteButton'

type CandidatesListProps = {
  api: ApiPromise,
  activeAccount: accountType,
  candidates: SocietyCandidate[]
}

type VoteResult = {
  success: boolean
  message: string
}

const CandidatesList = ({ api, activeAccount, candidates }: CandidatesListProps): JSX.Element => {
  const [showAlert, setShowAlert] = useState(false)
  const [voteResult, setVoteResult] = useState<VoteResult>({ success: false, message: '' })
  const showMessage = (result: VoteResult) => {
    setVoteResult(result)
    setShowAlert(true)
  }

  if (candidates.length === 0) return (
    <>No candidates</>
  )

  return (<>
    <StyledAlert
      success={voteResult.success}
      onClose={() => setShowAlert(false)}
      show={showAlert}
      dismissible>
      {voteResult.message}
    </StyledAlert>

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
        <Col xs={2} className="text-start">
          {candidate.kind.isDeposit
            ? <FormatBalance balance={candidate.value} />
            : (<>
              Member: {truncate(candidate.kind.asVouch[0].toHuman(), 7)} |
              Tip: {<FormatBalance balance={candidate.kind.asVouch[1]}></FormatBalance>}
            </>)}
        </Col>
        <Col xs={2}>
          Skeptics
        </Col>
        <Col xs={3}>
          <VoteButton
            api={api}
            showMessage={showMessage}
            successText="Approval vote sent."
            waitingText="Approval vote request sent. Waiting for response..."
            vote={{ approve: true, voterAccount: activeAccount, candidateId: candidate.accountId }}
            icon={ApproveIcon}>
            <u>Approve</u>
          </VoteButton>
          <VoteButton
            api={api}
            showMessage={showMessage}
            successText="Rejection vote sent."
            waitingText="Rejection vote request sent. Waiting for response..."
            vote={{ approve: false, voterAccount: activeAccount, candidateId: candidate.accountId }}
            icon={RejectIcon}>
            <u>Reject</u>
          </VoteButton>
        </Col>
      </DataRow>))}
  </>)
}

export { CandidatesList }
