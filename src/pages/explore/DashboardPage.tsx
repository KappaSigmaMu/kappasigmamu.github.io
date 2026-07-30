import { useMemo, useState } from 'react'
import { Badge, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaChevronRight, FaRegThumbsDown, FaRegThumbsUp, FaTriangleExclamation } from 'react-icons/fa6'
import { distinctUntilChanged } from 'rxjs'
import styled from 'styled-components'
import { DropButton } from './CandidatesPage/components/DropButton'
import { VoteButton } from './CandidatesPage/components/VoteButton'
import { Identicon } from './components/Identicon'
import { selectNextRoundBidderIds } from './dashboardHelpers'
import { toastByStatus } from './helpers'
import { useAccount } from '../../account/AccountContext'
import { useAssetHub } from '../../chain/ChainProvider'
import type { TimeParts } from '../../chain/format'
import { useChainQuery, useChainSub } from '../../chain/hooks'
import { getAccountIndex } from '../../chain/indices'
import { buildSocietyCandidatesArray, buildSocietyMembersArray } from '../../chain/society/derived'
import { useSociety } from '../../chain/society/SocietyContext'
import { isSameAddress } from '../../chain/ss58'
import type { AccountId, ExtrinsicResult, SocietyCandidate } from '../../chain/types'
import { AccountIdentity } from '../../components/AccountIdentity'
import { FormatBalance } from '../../components/FormatBalance'
import { LinkWithQuery } from '../../components/LinkWithQuery'
import { calculateChallengePercentage } from '../../components/rotation-bar/helpers/periods'
import { mapBidToRow, type BidRow } from '../../helpers/bidKind'
import { useConsts } from '../../hooks/useConsts'
import { useRelayChainBlockNumber } from '../../hooks/useRelayChainBlockNumber'

type FeaturedMember = {
  accountId: AccountId
  label: 'Defender' | 'Head' | 'Candidate Skeptic' | 'Defender Skeptic'
  tone: 'pink' | 'yellow'
  showVotes: boolean
  warning?: string
}

const DashboardPage = (): JSX.Element => {
  const { api } = useAssetHub()
  const { activeAccount } = useAccount()
  const { bids, candidates: candidateState, memberSnapshots, info, totals } = useSociety()
  const { challengePeriod, graceStrikes, maxCandidateIntake, periodSpend } = useConsts()
  const relayBlock = useRelayChainBlockNumber()
  const roundState = useChainSub(
    () =>
      api?.query.Society.RoundCount.watchValue({ at: 'best' }).pipe(
        distinctUntilChanged((previous, current) => previous.value === current.value)
      ),
    [api]
  )

  const bidders = useMemo(() => bids.data?.map(mapBidToRow) ?? null, [bids.data])
  const candidates = useMemo(
    () => (candidateState.data ? buildSocietyCandidatesArray(candidateState.data) : null),
    [candidateState.data]
  )
  const candidateVoteState = useChainQuery(
    () =>
      api && activeAccount && candidates
        ? api.query.Society.Votes.getValues(
            candidates.map(({ accountId }) => [accountId, activeAccount.address])
          )
        : undefined,
    [api, activeAccount, candidates]
  )
  const head = info.data?.head
  const headAddress = head?.toString()
  const headIndexState = useChainQuery(
    () => (api && head ? getAccountIndex(api, head) : undefined),
    [api, headAddress]
  )
  const [disabledVote, setDisabledVote] = useState(false)
  const members = useMemo(
    () =>
      memberSnapshots.data
        ? buildSocietyMembersArray(memberSnapshots.data, info.data ?? null, graceStrikes)
        : null,
    [memberSnapshots.data, info.data, graceStrikes]
  )
  const defenderTally = useMemo(
    () =>
      (members ?? []).reduce(
        (tally, member) => {
          if (member.vote) member.vote.approve ? tally.approvals++ : tally.rejections++
          return tally
        },
        { approvals: 0, rejections: 0 }
      ),
    [members]
  )
  const defenderVoted = Boolean(
    activeAccount &&
      memberSnapshots.data?.some(
        (member) => member.isDefenderVoter && isSameAddress(member.accountId, activeAccount.address)
      )
  )
  const featuredMembers = useMemo(() => {
    if (!info.data) return null
    const roles: Array<Omit<FeaturedMember, 'accountId'> & { accountId?: AccountId }> = [
      { accountId: info.data.defender, label: 'Defender', tone: 'pink', showVotes: true },
      {
        accountId: info.data.defenderSkeptic,
        label: 'Defender Skeptic',
        tone: 'yellow',
        showVotes: false,
        warning: "If they don't vote for the Defender, they become the Defender next round."
      },
      { accountId: info.data.skeptic, label: 'Candidate Skeptic', tone: 'yellow', showVotes: false }
    ]
    return roles.flatMap((role) => (role.accountId ? [{ ...role, accountId: role.accountId }] : []))
  }, [info.data])
  const nextPot = (info.data?.pot ?? 0n) + periodSpend
  const availableMemberships = Math.max(
    0,
    (info.data?.parameters?.max_members ?? 0) - (totals.data?.members ?? 0)
  )
  const nextRoundBidderIds = useMemo(
    () =>
      selectNextRoundBidderIds(
        bidders ?? [],
        nextPot,
        Math.min(maxCandidateIntake, availableMemberships)
      ),
    [bidders, nextPot, maxCandidateIntake, availableMemberships]
  )
  const challengeInfo =
    relayBlock !== null && challengePeriod > 0
      ? calculateChallengePercentage(relayBlock, challengePeriod)
      : null
  const challengeProgress = Math.min(100, Math.max(0, challengeInfo?.percentageDone ?? 0))
  const challengeTime = challengeInfo ? formatRemainingTime(challengeInfo.time) : '—'
  const showVoteMessage = (result: ExtrinsicResult) => {
    setDisabledVote(result.status === 'loading')
    if (result.status === 'success') candidateVoteState.refetch()
    toastByStatus[result.status](result.message, { id: result.message })
  }

  return (
    <Dashboard data-test="explore-dashboard">
      <OverviewHeader>
        <OverviewTitle>ROUND OVERVIEW</OverviewTitle>
        <OverviewStatus>
          <StatusLabels>
            <span>Challenge Period</span>
            <InlineRound data-test="dashboard-round">
              <span>ROUND</span>
              <RoundNumber>{roundState.data?.value ?? <Spinner animation="border" size="sm" />}</RoundNumber>
            </InlineRound>
          </StatusLabels>
          <ProgressTrack
            aria-label="Challenge period progress"
            aria-valuenow={Math.round(challengeProgress)}
            aria-valuetext={`${challengeTime} remaining`}
            role="progressbar"
          >
            <ProgressValue $percentage={challengeProgress} />
            <ProgressTime data-test="dashboard-challenge-time">{challengeTime} remaining</ProgressTime>
          </ProgressTrack>
        </OverviewStatus>
      </OverviewHeader>

      <DashboardGrid>
        <DashboardCard $area="pot" data-test="dashboard-pot">
          <CardHeader>
            <CardTitle>Pot</CardTitle>
            <HeaderLink to="/explore/bidders">
              Place bid <FaChevronRight aria-hidden="true" />
            </HeaderLink>
          </CardHeader>
          <CardBody>
            <PotBalances>
              <PotValue>
                <PotLabel>Current</PotLabel>
                <BalanceLine>
                  <PrimaryBalance>
                    {info.isLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <FormatBalance balance={info.data?.pot} withCurrency={false} />
                    )}
                  </PrimaryBalance>
                  <BalanceUnit>KSM</BalanceUnit>
                </BalanceLine>
              </PotValue>
              <PotValue>
                <PotLabel>Next Update</PotLabel>
                <BalanceLine>
                  <NextBalance>
                    {info.isLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <FormatBalance balance={nextPot} withCurrency={false} />
                    )}
                  </NextBalance>
                  <BalanceUnit>KSM</BalanceUnit>
                </BalanceLine>
              </PotValue>
            </PotBalances>
          </CardBody>
        </DashboardCard>

        <DashboardCard $area="bidders" data-test="dashboard-bidders">
          <LinkedCardHeader title={`Bidders (${totals.data?.bidders ?? 0})`} to="/explore/bidders" label="View all" />
          <Rows>
            {bidders === null ? (
              <LoadingRow />
            ) : bidders.length ? (
              bidders.slice(0, 3).map((bid) => (
                <BidderRow key={bid.who} bid={bid} willFit={nextRoundBidderIds.has(bid.who)} />
              ))
            ) : (
              <EmptyRow>No bidders yet</EmptyRow>
            )}
          </Rows>
        </DashboardCard>

        <CenterColumn>
          <DashboardCard $area="candidates" data-test="dashboard-candidates">
            <LinkedCardHeader
              title={`Candidates (${totals.data?.candidates ?? 0})`}
              to="/explore/candidates"
              label="View all"
            />
            <Rows>
              {candidates === null ? (
                <LoadingRow />
              ) : candidates.length ? (
                candidates.map((candidate, index) => (
                  <CandidateRow
                    key={candidate.accountId}
                    candidate={candidate}
                    currentRound={roundState.data?.value ?? 0}
                    disabledVote={disabledVote}
                    handleUpdate={candidateState.refetch}
                    showVoteMessage={showVoteMessage}
                    voted={Boolean(candidateVoteState.data?.[index])}
                  />
                ))
              ) : (
                <EmptyRow>No candidates this round</EmptyRow>
              )}
            </Rows>
          </DashboardCard>

          <DashboardCard $area="proof" data-test="dashboard-proof-of-ink">
            <LinkedCardHeader title="Proof of Ink Examples" to="/explore/poi/examples" label="Generate" />
            <Rows>
              {info.isLoading ? (
                <LoadingRow />
              ) : head ? (
                <ProofHeadRow>
                  <HeadIdentity>
                    <AccountRow accountId={head} />
                    <HeadIndex data-test="society-head-index">
                      {headIndexState.isLoading ? (
                        null
                      ) : headIndexState.error ? (
                        '(index unavailable)'
                      ) : headIndexState.data ? (
                        <>Index: {headIndexState.data}</>
                      ) : (
                        '(index not set)'
                      )}
                    </HeadIndex>
                  </HeadIdentity>
                  <HeadDetails>
                    {!headIndexState.isLoading && !headIndexState.error && !headIndexState.data && (
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="society-head-index-warning-tooltip">
                            The Society Head has not set up an index yet.
                          </Tooltip>
                        }
                      >
                        <WarningTrigger
                          aria-label="The Society Head has not set up an index yet."
                          data-test="society-head-index-warning"
                          type="button"
                        >
                          <FaTriangleExclamation aria-hidden="true" />
                        </WarningTrigger>
                      </OverlayTrigger>
                    )}
                    <Badge pill bg="dark" className="p-2" data-test="society-head-badge">
                      Society Head
                    </Badge>
                  </HeadDetails>
                </ProofHeadRow>
              ) : (
                <EmptyRow>(head not set)</EmptyRow>
              )}
            </Rows>
          </DashboardCard>
        </CenterColumn>

        <RightColumn>
          <DashboardCard $area="members" data-test="dashboard-members">
            <LinkedCardHeader
              title={`Members (${totals.data?.members ?? 0})`}
              to="/explore/members"
              label="View all"
            />
            <Rows>
              {featuredMembers === null ? (
                <LoadingRow />
              ) : featuredMembers.length ? (
                featuredMembers.map((member) => (
                  <MemberRow
                    key={member.accountId}
                    disabledVote={disabledVote}
                    member={member}
                    showVoteMessage={showVoteMessage}
                    tally={defenderTally}
                    voted={member.showVotes && defenderVoted}
                  />
                ))
              ) : (
                <EmptyRow>No members yet</EmptyRow>
              )}
            </Rows>
          </DashboardCard>

          <DashboardCard $area="suspended" data-test="dashboard-suspended">
            <LinkedCardHeader
              title={`Suspended Members (${totals.data?.suspendedMembers ?? 0})`}
              to="/explore/suspended"
              label="View all"
            />
          </DashboardCard>

        </RightColumn>
      </DashboardGrid>
    </Dashboard>
  )
}

const formatRemainingTime = ({ days, hours, minutes, seconds }: TimeParts): string => {
  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

const LinkedCardHeader = ({ title, to, label }: { title: string; to: string; label: string }) => (
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    <HeaderLink to={to}>
      {label} <FaChevronRight aria-hidden="true" />
    </HeaderLink>
  </CardHeader>
)

const AccountRow = ({ accountId, size = 28 }: { accountId: AccountId | string; size?: number }) => (
  <Account>
    <Identicon value={accountId} size={size} theme="polkadot" />
    <AccountLabel title={accountId.toString()}>
      <AccountIdentity accountId={accountId} truncateLength={13} />
    </AccountLabel>
  </Account>
)

const AccountVoting = ({ accountId, children }: { accountId: AccountId; children: React.ReactNode }) => (
  <VotingAccount>
    <AccountRow accountId={accountId} />
    <VotingLine>
      <VoteConnector aria-hidden="true" />
      {children}
    </VotingLine>
  </VotingAccount>
)

const BidderRow = ({ bid, willFit }: { bid: BidRow; willFit: boolean }) => (
  <ListRow>
    <AccountRow accountId={bid.who} />
    <RowBalance $willFit={willFit}><FormatBalance balance={bid.value} /></RowBalance>
  </ListRow>
)

const VoteTally = ({ approvals, rejections }: { approvals: number; rejections: number }) => (
  <Votes>
    <span><FaRegThumbsUp aria-label="Approvals" /> {approvals}</span>
    <span><FaRegThumbsDown aria-label="Rejections" /> {rejections}</span>
  </Votes>
)

type VoteRowProps = {
  disabledVote: boolean
  showVoteMessage: (result: ExtrinsicResult) => void
  voted: boolean
}

const CandidateRow = ({
  candidate,
  currentRound,
  disabledVote,
  handleUpdate,
  showVoteMessage,
  voted
}: {
  candidate: SocietyCandidate
  currentRound: number
  handleUpdate: () => void
} & VoteRowProps) => {
  const { activeAccount, level } = useAccount()
  const isDroppable =
    candidate.tally.rejections >= Math.max(candidate.tally.approvals * 2, 1) &&
    currentRound > candidate.round + 1
  return (
    <VotingListRow>
      <AccountVoting accountId={candidate.accountId}>
        {level === 'cyborg' ? (
          <VoteActions>
            <VoteAction>
              <VoteButton
                disabled={disabledVote}
                showMessage={showVoteMessage}
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
              <span>{candidate.tally.approvals}</span>
            </VoteAction>
            <VoteAction>
              <VoteButton
                disabled={disabledVote}
                showMessage={showVoteMessage}
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
              <span>{candidate.tally.rejections}</span>
            </VoteAction>
          </VoteActions>
        ) : (
          <VoteTally approvals={candidate.tally.approvals} rejections={candidate.tally.rejections} />
        )}
        {voted && (
          <Badge bg="secondary" text="black" data-test={`candidate-voted-badge-${candidate.accountId}`}>
            Voted
          </Badge>
        )}
        {isSameAddress(activeAccount?.address, candidate.accountId) && <Badge bg="primary">You</Badge>}
      </AccountVoting>
      <EntryRound $isDroppable={isDroppable}>
        <span>Entry Round</span>
        <EntryRoundValue>
          <strong>{candidate.round}</strong>
          {isDroppable && (
            <KickAction>
              <DropButton
                className="p-0"
                disabled={disabledVote}
                showMessage={showVoteMessage}
                successText="Candidate dropped."
                waitingText="Request sent. Waiting for response..."
                drop={{ callerAccount: activeAccount!, accountId: candidate.accountId }}
                handleUpdate={handleUpdate}
                data-test={`candidate-drop-button-${candidate.accountId}`}
              />
            </KickAction>
          )}
        </EntryRoundValue>
      </EntryRound>
    </VotingListRow>
  )
}

const MemberRow = ({
  disabledVote,
  member,
  showVoteMessage,
  tally,
  voted
}: { member: FeaturedMember; tally: { approvals: number; rejections: number } } & VoteRowProps) => {
  const { activeAccount, level } = useAccount()
  return (
    <VotingListRow>
      {member.showVotes ? (
        <AccountVoting accountId={member.accountId}>
          {level === 'cyborg' ? (
            <VoteActions>
              <VoteAction>
                <VoteButton
                  disabled={disabledVote}
                  showMessage={showVoteMessage}
                  successText="Approval vote sent."
                  waitingText="Request sent. Waiting for response..."
                  vote={{ approve: true, voterAccount: activeAccount!, accountId: member.accountId, type: 'defender' }}
                  icon="approve"
                  handleUpdate={() => undefined}
                  data-test="defender-approve-button"
                />
                <span>{tally.approvals}</span>
              </VoteAction>
              <VoteAction>
                <VoteButton
                  disabled={disabledVote}
                  showMessage={showVoteMessage}
                  successText="Rejection vote sent."
                  waitingText="Request sent. Waiting for response..."
                  vote={{ approve: false, voterAccount: activeAccount!, accountId: member.accountId, type: 'defender' }}
                  icon="reject"
                  handleUpdate={() => undefined}
                  data-test="defender-reject-button"
                />
                <span>{tally.rejections}</span>
              </VoteAction>
            </VoteActions>
          ) : (
            <VoteTally approvals={tally.approvals} rejections={tally.rejections} />
          )}
          {voted && <Badge bg="secondary" text="black">Voted</Badge>}
        </AccountVoting>
      ) : (
        <AccountRow accountId={member.accountId} />
      )}
      <Roles>
        {member.warning && (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="defender-skeptic-warning-tooltip">{member.warning}</Tooltip>}
          >
            <WarningTrigger aria-label={member.warning} data-test="defender-skeptic-warning" type="button">
              <FaTriangleExclamation aria-hidden="true" />
            </WarningTrigger>
          </OverlayTrigger>
        )}
        <RoleBadge pill className="p-2" $tone={member.tone}>
          {member.label}
        </RoleBadge>
      </Roles>
    </VotingListRow>
  )
}

const LoadingRow = ({ compact = false }: { compact?: boolean }) => (
  <SpinnerRow $compact={compact}><Spinner animation="border" size="sm" /></SpinnerRow>
)

const Dashboard = styled.main`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 0 72px;

  @media (max-width: 991.98px) {
    padding: 30px 0 48px;
  }
`

const OverviewHeader = styled.header`
  display: grid;
  padding-bottom: 22px;
  border-bottom: 2px solid #495057;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: end;

  @media (max-width: 991.98px) {
    padding: 0 0 12px;
    grid-template-columns: 1fr;
    gap: 24px;
  }
`

const OverviewTitle = styled.h1`
  grid-column: 1 / span 2;
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.5rem);
  line-height: 1;

  @media (max-width: 991.98px) {
    grid-column: 1;
    font-size: 1.55rem;
    text-align: center;
  }
`

const OverviewStatus = styled.div`
  display: grid;
  grid-column: 3;
  gap: 8px;
  font-size: 1rem;

  @media (max-width: 991.98px) {
    grid-column: 1;
    font-size: 0.85rem;
  }
`

const StatusLabels = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ProgressTrack = styled.div`
  position: relative;
  width: 100%;
  height: 20px;
  overflow: hidden;
  border-radius: 3px;
  background: #495057;
`

const ProgressValue = styled.div<{ $percentage: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: ${(props) => props.$percentage}%;
  border-radius: inherit;
  background: #01ffff;
  transition: width 300ms ease;
`

const ProgressTime = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1;
  text-shadow: 0 1px 2px #212529;
`

const DashboardGrid = styled.div`
  display: grid;
  margin-top: 24px;
  grid-template-areas:
    'pot center right'
    'bidders center right';
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: start;

  @media (max-width: 991.98px) {
    margin-top: 20px;
    grid-template-areas:
      'pot'
      'bidders'
      'center'
      'right';
    grid-template-columns: 1fr;
    gap: 14px;
  }
`

const DashboardCard = styled.section<{ $area: string }>`
  grid-area: ${(props) => props.$area};
  overflow: hidden;
  border: 1px solid #495057;
  border-radius: 8px;
  background: #212529;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.22);
`

const RightColumn = styled.div`
  display: flex;
  grid-area: right;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 991.98px) {
    gap: 14px;
  }
`

const CenterColumn = styled(RightColumn)`
  grid-area: center;
`

const CardHeader = styled.header`
  display: flex;
  min-height: 56px;
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
  background: #343a40;

  @media (max-width: 991.98px) {
    min-height: 48px;
    padding: 0 12px;
  }
`

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 400;

  @media (max-width: 991.98px) {
    font-size: 0.9rem;
  }
`

const HeaderLink = styled(LinkWithQuery)`
  display: inline-flex;
  gap: 12px;
  align-items: center;
  color: #e4e5e6;
  font-size: 0.92rem;
  white-space: nowrap;

  svg { font-size: 0.8rem; }
`

const CardBody = styled.div`
  padding: 16px;

  @media (max-width: 991.98px) {
    padding: 12px;
  }
`

const InlineRound = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: flex-end;
  font-size: inherit;
  white-space: nowrap;
`

const RoundNumber = styled.strong`
  color: #01ffff;
  font-weight: 400;
`

const PotBalances = styled.div`
  display: grid;
  margin-bottom: 6px;
  grid-template-columns: 1fr 1fr;
`

const PotValue = styled.div`
  display: grid;
  min-width: 0;
  padding: 2px 10px 0;
  gap: 4px;
  text-align: center;

  &:first-child { border-right: 2px solid #343a40; }
`

const PotLabel = styled.span`
  color: #e1e3e5;
  font-size: 0.9rem;
`

const PrimaryBalance = styled.strong`
  color: #fff;
  font-size: clamp(1.25rem, 1.8vw, 1.65rem);
  line-height: 1.25;
`

const NextBalance = styled(PrimaryBalance)`
  color: #01ffff;
`

const BalanceUnit = styled.span`
  color: #ced4da;
  font-size: 0.72rem;
`

const BalanceLine = styled.div`
  display: flex;
  min-width: 0;
  gap: 6px;
  align-items: baseline;
  justify-content: center;
  white-space: nowrap;
`

const Rows = styled.div`
  display: flex;
  flex-direction: column;
`

const ListRow = styled.div`
  display: grid;
  min-height: 60px;
  padding: 10px 14px;
  border-top: 1px solid #495057;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 12px;
  align-items: center;

  &:first-child { border-top: 0; }

  @media (max-width: 1199.98px) {
    padding: 10px;
    gap: 8px;
  }

  @media (max-width: 991.98px) {
    min-height: 60px;
  }
`

const VotingListRow = styled(ListRow)`
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
`

const ProofHeadRow = styled(ListRow)`
  grid-template-columns: minmax(0, 1fr) auto;
`

const HeadIdentity = styled.div`
  display: grid;
  min-width: 0;
  gap: 5px;
`

const HeadDetails = styled.div`
  display: flex;
  gap: 3px;
  align-items: center;
`

const HeadIndex = styled.span`
  margin-left: 36px;
  color: #ced4da;
  font-size: 0.74rem;
  white-space: nowrap;
`

const VotingAccount = styled.div`
  display: grid;
  min-width: 0;
  gap: 5px;
`

const WarningTrigger = styled.button`
  display: inline-grid;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  place-items: center;
  background: transparent;
  color: #ffc629;
  line-height: 1;

  svg {
    display: block;
  }

  &:hover,
  &:focus-visible {
    color: #ffda68;
  }
`

const VotingLine = styled.div`
  display: flex;
  min-width: 0;
  margin-left: 13px;
  flex-wrap: wrap;
  gap: 7px;
  align-items: center;
`

const VoteConnector = styled.span`
  position: relative;
  flex: 0 0 auto;
  width: 14px;
  height: 9px;
  margin-top: -5px;
  border-bottom: 1px solid #6c757d;
  border-left: 1px solid #6c757d;

  &::after {
    position: absolute;
    right: -1px;
    bottom: -3px;
    width: 5px;
    height: 5px;
    border-top: 1px solid #6c757d;
    border-right: 1px solid #6c757d;
    content: '';
    transform: rotate(45deg);
  }
`

const VoteActions = styled.div`
  display: flex;
  gap: 9px;
  align-items: center;

  .btn {
    width: 22px;
    height: 22px;
    padding: 0;
  }
`

const VoteAction = styled.span`
  display: grid;
  grid-template-columns: 22px auto;
  gap: 5px;
  align-items: center;
  color: #e1e3e5;
  font-size: 0.82rem;
  line-height: 1;
`

const Account = styled.div`
  display: flex;
  min-width: 0;
  gap: 8px;
  align-items: center;

  > div, > svg { flex: 0 0 auto; }
`

const AccountLabel = styled.div`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  > div {
    min-width: 0;
    overflow: hidden;
    justify-content: flex-start !important;
    text-overflow: ellipsis;
  }
`

const RowBalance = styled.span<{ $willFit: boolean }>`
  color: ${(props) => (props.$willFit ? '#01ffff' : '#fff')};
  font-size: 0.84rem;
  white-space: nowrap;

  * { color: inherit; }
`

const EntryRound = styled.span<{ $isDroppable: boolean }>`
  display: grid;
  gap: 2px;
  justify-items: center;
  color: #fff;
  font-size: 0.66rem;
  line-height: 1.1;
  white-space: nowrap;

  span,
  strong {
    color: inherit;
  }

  strong {
    color: ${(props) => (props.$isDroppable ? '#ff168f' : '#fff')};
    font-size: 0.7rem;
    font-weight: 600;
  }
`

const EntryRoundValue = styled.span`
  display: flex;
  min-height: 20px;
  gap: 4px;
  align-items: center;
  justify-content: center;
`

const KickAction = styled.span`
  display: inline-grid;
  place-items: center;

  .btn {
    display: inline-grid;
    width: 18px;
    height: 18px;
    place-items: center;
    line-height: 1;
  }

  svg {
    display: block;
    width: 14px;
    height: 14px;
  }
`

const Votes = styled.div`
  display: flex;
  gap: 9px;
  font-size: 0.82rem;

  span { display: flex; gap: 7px; align-items: center; color: #e1e3e5; line-height: 1; }
  svg { display: block; }
  span:first-child svg { color: ${(props) => props.theme.colors.success}; }
  span:last-child svg { color: ${(props) => props.theme.colors.danger}; }
`

const Roles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: center;
  justify-content: center;
`

const RoleBadge = styled(Badge)<{ $tone: FeaturedMember['tone'] }>`
  background-color: ${(props) =>
    props.$tone === 'pink' ? props.theme.colors.primary : '#ffc629'} !important;
  color: ${(props) => (props.$tone === 'yellow' ? props.theme.colors.black : props.theme.colors.white)} !important;
  white-space: nowrap;
`

const SpinnerRow = styled.div<{ $compact: boolean }>`
  display: grid;
  min-height: ${(props) => (props.$compact ? '34px' : '72px')};
  place-items: center;
`

const EmptyRow = styled.div`
  min-height: 72px;
  padding: 24px 16px;
  color: #adb5bd;
  text-align: center;
`

export { DashboardPage }
