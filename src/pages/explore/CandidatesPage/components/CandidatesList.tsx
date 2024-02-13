import { ApiPromise } from '@polkadot/api'
import Identicon from '@polkadot/react-identicon'
import type { Option } from '@polkadot/types'
import type { SocietyVote, AccountId } from '@polkadot/types/interfaces'
import { WalletAccount } from '@talismn/connect-wallets'
import { useEffect, useRef, useState } from 'react'
import { Badge, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { CandidateDetailsOffcanvas } from './CandidateDetailsOffcanvas'
import { VoteButton } from './VoteButton'
import { useAccount } from '../../../../account/AccountContext'
import { AccountIdentity } from '../../../../components/AccountIdentity'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { FormatBalance } from '../../../../components/FormatBalance'
import { truncate } from '../../../../helpers/truncate'
import ApproveIcon from '../../../../static/approve-icon.svg'
import CheckAllIcon from '../../../../static/check-all-icon.svg'
import RejectIcon from '../../../../static/reject-icon.svg'
import { toastByStatus } from '../../helpers'

const StyledCol = styled(Col)`
  &:hover {
    cursor: pointer;
  }
`

type CandidatesListProps = {
  api: ApiPromise
  activeAccount: WalletAccount | undefined
  candidates: SocietyCandidate[]
  handleUpdate: () => void
}

const AlreadyVotedIcon = () => (
  <>
    <img src={CheckAllIcon} className="me-2" />
    <label style={{ color: '#6c757d' }}>Voted</label>
  </>
)

const CandidatesList = ({ api, activeAccount, candidates, handleUpdate }: CandidatesListProps): JSX.Element => {
  const [votes, setVotes] = useState<SocietyCandidate[]>([])
  const society = api?.query?.society

  const [selectedCandidate, setSelectedCandidate] = useState<AccountId | null>(null)
  const [showCandidateDetailsOffcanvas, setShowCandidateDetailsOffcanvas] = useState(false)

  const showMessage = (nextResult: ExtrinsicResult) => {
    toastByStatus[nextResult.status](nextResult.message, { id: nextResult.message })
  }

  const usePrevious = (value: any) => {
    const ref = useRef()
    useEffect(() => {
      ref.current = value
    })
    return ref.current
  }

  const { level } = useAccount()
  const isCandidate = (candidate: SocietyCandidate) => activeAccount?.address === candidate.accountId.toHuman()
  const isMember = level === 'cyborg'

  const prevActiveAccount = usePrevious(activeAccount)

  useEffect(() => {
    if (!activeAccount || candidates.length === 0) return

    candidates.forEach((candidate) => {
      society.votes(candidate.accountId, activeAccount!.address, (vote: Option<SocietyVote>) => {
        if (vote.isEmpty) {
          if (prevActiveAccount != activeAccount) setVotes([])
          return
        }

        setVotes((votes) => [...votes, candidate.accountId])
      })
    })
  }, [candidates, activeAccount, prevActiveAccount])

  const showCandidateDetails = (candidateId: AccountId) => {
    setSelectedCandidate(candidateId)
    setShowCandidateDetailsOffcanvas(true)
  }

  if (candidates.length === 0) return <>No candidates</>

  return (
    <>
      {selectedCandidate && (
        <CandidateDetailsOffcanvas
          api={api}
          candidateId={selectedCandidate}
          show={showCandidateDetailsOffcanvas}
          onClose={() => setShowCandidateDetailsOffcanvas(false)}
        />
      )}

      <DataHeaderRow>
        <Col xs={1} className="text-center">
          #
        </Col>
        <Col xs={2} className="text-start">
          Wallet Hash
        </Col>
        <Col className="text-start">Bid Kind</Col>
        <Col>Tally</Col>
        <Col>{isMember && 'Vote'}</Col>
      </DataHeaderRow>

      {candidates.map((candidate: SocietyCandidate) => (
        <StyledDataRow $isOwner={isCandidate(candidate)} key={candidate.accountId.toString()}>
          <Col xs={1} className="text-center">
            <Identicon value={candidate.accountId.toHuman()} size={32} theme={'polkadot'} />
          </Col>
          <StyledCol
            xs={2}
            className="text-start text-truncate"
            onClick={() => showCandidateDetails(candidate.accountId)}
          >
            <AccountIdentity api={api} accountId={candidate.accountId} />
          </StyledCol>
          <Col xs={1}>{candidate.kind.isDeposit ? 'Deposit' : 'Vouch'}</Col>
          <Col xs={2} className="text-start">
            {candidate.kind.isDeposit ? (
              <FormatBalance balance={candidate.bid} />
            ) : (
              <>
                Member: {truncate(candidate.kind.asVouch[0].toHuman(), 7)} | Tip:{' '}
                {<FormatBalance balance={candidate.kind.asVouch[1]}></FormatBalance>}
              </>
            )}
          </Col>
          <Col xs={3}>
            {candidate.tally.approvals.toHuman()} approvals and {candidate.tally.rejections.toHuman()} rejections
          </Col>
          <Col xs={3}>
            {isMember ? (
              <>
                <VoteButton
                  api={api}
                  showMessage={showMessage}
                  successText="Approval vote sent."
                  waitingText="Approval vote request sent. Waiting for response..."
                  vote={{
                    approve: true,
                    voterAccount: activeAccount!,
                    accountId: candidate.accountId,
                    type: 'candidate'
                  }}
                  icon={ApproveIcon}
                  handleUpdate={handleUpdate}
                >
                  <u>Approve</u>
                </VoteButton>
                <VoteButton
                  api={api}
                  showMessage={showMessage}
                  successText="Rejection vote sent."
                  waitingText="Rejection vote request sent. Waiting for response..."
                  vote={{
                    approve: false,
                    voterAccount: activeAccount!,
                    accountId: candidate.accountId,
                    type: 'candidate'
                  }}
                  icon={RejectIcon}
                  handleUpdate={handleUpdate}
                >
                  <u>Reject</u>
                </VoteButton>
              </>
            ) : (
              <>
                {isCandidate(candidate) && (
                  <div className="d-flex align-items-center justify-content-end h-100">
                    <Badge pill bg="primary">
                      You
                    </Badge>
                  </div>
                )}
              </>
            )}
            {votes.includes(candidate.accountId) ? <AlreadyVotedIcon /> : <></>}
          </Col>
        </StyledDataRow>
      ))}
    </>
  )
}

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => (props.$isOwner ? '#73003d' : '')};
  border: ${(props) => (props.$isOwner ? '2px solid #E6007A' : '')};
`

export { CandidatesList }
