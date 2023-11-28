// import { ApiPromise } from "@polkadot/api"
// import Identicon from "@polkadot/react-identicon"
// import { Option } from "@polkadot/types"
// import { AccountId } from "@polkadot/types/interfaces"
// import { PalletSocietyVote } from "@polkadot/types/lookup"
// import { useEffect, useState } from "react"
// import { MemberIdentity } from "../../../../components/MemberIdentity"
// import { AccountHeader } from "../../components/AccountHeader"
// import { LoadingSpinner } from "../../components/LoadingSpinner"
// import { Offcanvas } from "../../components/Offcanvas"

// type VoteType = "Skeptic" | "Approve" | "Reject"
// type GroupedVotes = Record<VoteType, AccountId[]>

// type Props = {
//   api: ApiPromise,
//   show: boolean,
//   candidateId: AccountId,
//   onClose: () => void
// }

// export function CandidateDetailsOffcanvas({ api, candidateId, show, onClose }: Props) {
//   const [votes, setVotes] = useState<GroupedVotes | null>(null)

//   useEffect(() => {
//     // TODO: cache members and member->candidate map
//     api.query.society.members().then(async (memberIds) => {
//       const candidateMemberMap = memberIds.map((memberId) => [candidateId, memberId])
//       const votesResponse = await api.query.society.votes.multi(candidateMemberMap)
//       setVotes(groupVotes(candidateMemberMap, votesResponse))
//     })
//   }, [])

//   return (
//     <Offcanvas placement="end" show={show} onClose={onClose} header={<h3>Candidate</h3>}>
//       <div className="mb-3">
//         <AccountHeader accountId={candidateId} />
//       </div>
//       {votes ? <CanvasBody api={api} votes={votes} /> : <LoadingSpinner />}
//     </Offcanvas>
//   )
// }

// function CanvasBody({ api, votes }: { api: ApiPromise, votes: GroupedVotes }) {
//   return <>
//     {Object.entries(votes).map(([type, memberIds]) => (
//       memberIds.length === 0
//         ? <></>
//         : <VoterList api={api} type={type} memberIds={memberIds} key={type} />
//     ))}
//   </>
// }

// function VoterList({ api, type, memberIds }: { api: ApiPromise, type: string, memberIds: AccountId[] }) {
//   return (
//     <div className="mt-4">
//       <h4>{type}s</h4>
//       {memberIds.map((id) => (
//         <div key={id.toString()} className="mb-2 ms-2">
//           <Identicon value={id} size={22} theme="polkadot" className="me-2" />
//           <MemberIdentity api={api} memberAccountId={id} />
//         </div>
//       ))}
//     </div>
//   )
// }

// function groupVotes(
//   candidateMemberMap: AccountId[][],
//   votesResponse: Option<PalletSocietyVote>[]
// ): GroupedVotes {
//   const initial = { "Approve": [], "Reject": [], "Skeptic": [] }
//   return votesResponse.reduce((grouped, vote, idx) => {
//     if (vote.isNone) return grouped

//     const type = vote.unwrap().type

//     return {
//       ...grouped,
//       // Associate voter id to vote based on list position
//       [type]: Array.of(candidateMemberMap[idx][1], ...grouped[type])
//     }
//   }, initial)
// }
export {}
