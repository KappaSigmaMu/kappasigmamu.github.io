import { useAssetHub } from '../../../../chain/ChainProvider'
import { useChainQuery } from '../../../../chain/hooks'
import { getSocietyMembersEntries, getSocietyVotes } from '../../../../chain/society/queries'
import type { AccountId, SocietyVote } from '../../../../chain/types'
import { AccountIdentity } from '../../../../components/AccountIdentity'
import { AccountHeader } from '../../components/AccountHeader'
import { ChainError } from '../../components/ChainError'
import { Identicon } from '../../components/Identicon'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { Offcanvas } from '../../components/Offcanvas'

type VoteType = 'Skeptic' | 'Approve' | 'Reject'
type GroupedVotes = Record<VoteType, AccountId[]>
type Props = { show: boolean; candidateId: AccountId; onClose: () => void }

export function CandidateDetailsOffcanvas({ candidateId, show, onClose }: Props) {
  const { api } = useAssetHub()
  const members = useChainQuery(() => (api ? getSocietyMembersEntries(api) : undefined), [api])
  const votes = useChainQuery(() => (api ? getSocietyVotes(api, candidateId) : undefined), [api, candidateId])
  const grouped = members.data && votes.data ? groupVotes(members.data.map(({ accountId }) => accountId), votes.data) : null
  return <Offcanvas placement="end" show={show} onClose={onClose} header={<h3>Candidate</h3>}><div className="mb-3"><AccountHeader accountId={candidateId} /></div>{members.error || votes.error ? <ChainError error={members.error ?? votes.error!} onRetry={() => { members.refetch(); votes.refetch() }} /> : grouped ? <CanvasBody votes={grouped} /> : <LoadingSpinner />}</Offcanvas>
}

function CanvasBody({ votes }: { votes: GroupedVotes }) { return <>{Object.entries(votes).map(([type, memberIds]) => memberIds.length === 0 ? null : <VoterList type={type} memberIds={memberIds} key={type} />)}</> }
function VoterList({ type, memberIds }: { type: string; memberIds: AccountId[] }) { return <div className="mt-4"><h4>{type}s</h4>{memberIds.map((id) => <div key={id} className="mb-2 ms-2"><Identicon value={id} size={22} theme="polkadot" className="me-2" /><AccountIdentity accountId={id} /></div>)}</div> }

function groupVotes(memberIds: AccountId[], votes: Array<SocietyVote | undefined>): GroupedVotes {
  const grouped: GroupedVotes = { Approve: [], Reject: [], Skeptic: [] }
  votes.forEach((vote, index) => { if (vote) grouped[vote.approve ? 'Approve' : 'Reject'].push(memberIds[index]) })
  return grouped
}
