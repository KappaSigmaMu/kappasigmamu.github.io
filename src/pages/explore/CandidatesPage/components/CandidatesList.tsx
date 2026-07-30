import type { WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { Badge, Col } from 'react-bootstrap'
import { distinctUntilChanged } from 'rxjs'
import styled from 'styled-components'
import { CandidateDetailsOffcanvas } from './CandidateDetailsOffcanvas'
import { DropButton } from './DropButton'
import { VoteButton } from './VoteButton'
import { useAccount } from '@/account/AccountContext'
import { useAssetHub } from '@/chain/ChainProvider'
import { useChainQuery, useChainSub } from '@/chain/hooks'
import { isSameAddress } from '@/chain/ss58'
import type { AccountId, ExtrinsicResult, SocietyCandidate } from '@/chain/types'
import { AccountIdentity } from '@/components/AccountIdentity'
import { DataHeaderRow, DataRow } from '@/components/base'
import { FormatBalance } from '@/components/FormatBalance'
import { Identicon } from '@/pages/explore/components/Identicon'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'
import { toastByStatus } from '@/pages/explore/helpers'

const StyledCol = styled(Col)`
  &:hover {
    cursor: pointer;
  }
`
type Props = { activeAccount: WalletAccount | undefined; candidates: SocietyCandidate[]; handleUpdate: () => void }

const CandidatesList = ({ activeAccount, candidates, handleUpdate }: Props): JSX.Element => {
  const { api } = useAssetHub()
  const { level, isLevelLoading, isSignerLoading } = useAccount()
  const [selectedCandidate, setSelectedCandidate] = useState<AccountId | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [disabledAction, setDisabledAction] = useState(false)
  const roundState = useChainSub(
    () =>
      api?.query.Society.RoundCount.watchValue({ at: 'best' }).pipe(
        distinctUntilChanged((previous, current) => previous.value === current.value)
      ),
    [api]
  )
  const voteState = useChainQuery(
    () =>
      api && activeAccount
        ? api.query.Society.Votes.getValues(candidates.map(({ accountId }) => [accountId, activeAccount.address]))
        : undefined,
    [api, activeAccount, candidates]
  )
  const roundCount = roundState.data?.value ?? 0
  const voted = voteState.data ?? []
  const showMessage = (result: ExtrinsicResult) => {
    setDisabledAction(result.status === 'loading')
    if (result.status === 'success') voteState.refetch()
    toastByStatus[result.status](result.message, { id: result.message })
  }
  const isCandidate = (candidate: SocietyCandidate) => isSameAddress(activeAccount?.address, candidate.accountId)
  const isDroppable = (candidate: SocietyCandidate) =>
    candidate.tally.rejections >= Math.max(candidate.tally.approvals * 2, 1) && roundCount > candidate.round + 1
  const showCandidateDetails = (candidateId: AccountId) => {
    setSelectedCandidate(candidateId)
    setShowDetails(true)
  }

  if ((activeAccount && (isLevelLoading || isSignerLoading)) || roundState.isLoading || voteState.isLoading)
    return <LoadingSpinner />
  if (candidates.length === 0) return <>No candidates</>

  return (
    <div data-test="candidates-list">
      {selectedCandidate && (
        <div data-test="candidate-detail-panel">
          <CandidateDetailsOffcanvas
            candidateId={selectedCandidate}
            show={showDetails}
            onClose={() => setShowDetails(false)}
          />
        </div>
      )}
      <DataHeaderRow className="d-none d-lg-flex text-center">
        <Col lg={1}>#</Col>
        <Col lg={2}>Wallet Hash</Col>
        <Col lg={1} className="d-none d-lg-inline">
          Bid Kind
        </Col>
        <Col lg={2}>Amount</Col>
        <Col lg={3}>Tally</Col>
        <Col lg={2}>{level === 'cyborg' && 'Vote'}</Col>
        <Col lg={1}>Status</Col>
      </DataHeaderRow>
      {candidates.map((candidate, index) => (
        <StyledDataRow
          className="text-center"
          $isOwner={isCandidate(candidate)}
          key={candidate.accountId}
          data-test={`candidate-row-${candidate.accountId}`}
        >
          <Col lg={1} className="text-center">
            <Identicon value={candidate.accountId} size={32} theme="polkadot" />
          </Col>
          <StyledCol lg={2} className="text-truncate" onClick={() => showCandidateDetails(candidate.accountId)}>
            <AccountIdentity accountId={candidate.accountId} />
          </StyledCol>
          <Col lg={1} className="d-none d-lg-inline">
            {candidate.kindType === 'Deposit' ? 'Deposit' : 'Vouch'}
          </Col>
          <Col lg={2}>
            <FormatBalance balance={candidate.bid} />
          </Col>
          <Col lg={3} data-test={`vote-tally-${candidate.accountId}`}>
            {candidate.tally.approvals} approvals and {candidate.tally.rejections} rejections
          </Col>
          <Col lg={2} className="d-flex align-items-center justify-content-center">
            {level === 'cyborg' && (
              <>
                <VoteButton
                  disabled={disabledAction}
                  showMessage={showMessage}
                  successText="Approval vote sent."
                  waitingText="Request sent. Waiting for response..."
                  vote={{
                    approve: true,
                    voterAccount: activeAccount!,
                    accountId: candidate.accountId,
                    type: 'candidate'
                  }}
                  icon="approve"
                  handleUpdate={handleUpdate}
                  data-test={`candidate-approve-button-${candidate.accountId}`}
                />
                <VoteButton
                  disabled={disabledAction}
                  showMessage={showMessage}
                  successText="Rejection vote sent."
                  waitingText="Request sent. Waiting for response..."
                  vote={{
                    approve: false,
                    voterAccount: activeAccount!,
                    accountId: candidate.accountId,
                    type: 'candidate'
                  }}
                  icon="reject"
                  handleUpdate={handleUpdate}
                  data-test={`candidate-reject-button-${candidate.accountId}`}
                />
              </>
            )}
            {isDroppable(candidate) && (
              <DropButton
                disabled={disabledAction}
                showMessage={showMessage}
                successText="Candidate dropped."
                waitingText="Request sent. Waiting for response..."
                drop={{ callerAccount: activeAccount!, accountId: candidate.accountId }}
                handleUpdate={handleUpdate}
                data-test={`candidate-drop-button-${candidate.accountId}`}
              />
            )}
          </Col>
          <Col lg={1} className="d-flex align-items-center justify-content-center">
            {voted[index] && (
              <Badge bg="secondary" text="black" data-test={`candidate-voted-badge-${candidate.accountId}`}>
                Voted
              </Badge>
            )}
            {isCandidate(candidate) && <Badge bg="primary">You</Badge>}
          </Col>
        </StyledDataRow>
      ))}
    </div>
  )
}

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => (props.$isOwner ? '#73003d' : '')};
  border: ${(props) => (props.$isOwner ? '2px solid #E6007A' : '')};
  @media (max-width: 992px) {
    padding-block: 12px;
    margin-inline: 2px;
  }
`
export { CandidatesList }
