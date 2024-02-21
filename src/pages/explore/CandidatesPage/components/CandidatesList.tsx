import { ApiPromise } from '@polkadot/api'
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
import { AlreadyVotedIcon } from '../../../../components/AlreadyVotedIcon'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { FormatBalance } from '../../../../components/FormatBalance'
import { truncate } from '../../../../helpers/truncate'
import { Identicon } from '../../components/Identicon'
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

const CandidatesList = ({ api, activeAccount, candidates, handleUpdate }: CandidatesListProps): JSX.Element => {
  const [votes, setVotes] = useState<SocietyCandidate[]>([])
  const society = api?.query?.society

  const [disabledVote, setDisabledVote] = useState<boolean>(false)
  const [selectedCandidate, setSelectedCandidate] = useState<AccountId | null>(null)
  const [showCandidateDetailsOffcanvas, setShowCandidateDetailsOffcanvas] = useState(false)

  const showMessage = (nextResult: ExtrinsicResult) => {
    setDisabledVote(nextResult.status === 'loading')
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

      <DataHeaderRow className="d-none d-lg-flex text-center">
        <Col lg={1}>#</Col>
        <Col lg={2}>Wallet Hash</Col>
        <Col lg={1} className="d-none d-lg-inline ">
          Bid Kind
        </Col>
        <Col lg={2}>Amount</Col>
        <Col lg={3}>Tally</Col>
        <Col lg={3}>{isMember && 'Vote'}</Col>
      </DataHeaderRow>

      {candidates.map((candidate: SocietyCandidate) => (
        <StyledDataRow className="text-center" $isOwner={isCandidate(candidate)} key={candidate.accountId.toString()}>
          <Col lg={1} className="text-center">
            <Identicon value={candidate.accountId.toHuman()} size={32} theme={'polkadot'} />
          </Col>
          <StyledCol lg={2} className=" text-truncate" onClick={() => showCandidateDetails(candidate.accountId)}>
            <AccountIdentity api={api} accountId={candidate.accountId} />
          </StyledCol>
          <Col lg={1} className="d-none d-lg-inline">
            {candidate.kind.isDeposit ? 'Deposit' : 'Vouch'}
          </Col>
          <Col lg={2}>
            <FormatBalance balance={candidate.bid.toNumber()} />
            {/* TODO: show member who vouched and tip amount
            {candidate.kind.isDeposit ? (
              <FormatBalance balance={candidate.bid.toNumber()} />
            ) : (
              <>
                Member: {truncate(candidate.kind.asVouch[0].toHuman(), 7)} | Tip:
                {<FormatBalance balance={candidate.kind.asVouch[1].toNumber()}></FormatBalance>}
              </>
            )}
            */}
          </Col>
          <Col lg={3}>
            {candidate.tally.approvals.toHuman()} approvals and {candidate.tally.rejections.toHuman()} rejections
          </Col>
          <Col lg={3} className="d-flex align-items-center justify-content-center">
            {isMember ? (
              <>
                <VoteButton
                  disabled={disabledVote}
                  api={api}
                  showMessage={showMessage}
                  successText="Approval vote sent."
                  waitingText="Request sent. Waiting for response..."
                  vote={{
                    approve: true,
                    voterAccount: activeAccount!,
                    accountId: candidate.accountId,
                    type: 'candidate'
                  }}
                  icon={'approve'}
                  handleUpdate={handleUpdate}
                ></VoteButton>
                <VoteButton
                  disabled={disabledVote}
                  api={api}
                  showMessage={showMessage}
                  successText="Rejection vote sent."
                  waitingText="Request sent. Waiting for response..."
                  vote={{
                    approve: false,
                    voterAccount: activeAccount!,
                    accountId: candidate.accountId,
                    type: 'candidate'
                  }}
                  icon={'reject'}
                  handleUpdate={handleUpdate}
                ></VoteButton>
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
  @media (max-width: 992px) {
    padding-block: 12px;
  }
`

export { CandidatesList }
