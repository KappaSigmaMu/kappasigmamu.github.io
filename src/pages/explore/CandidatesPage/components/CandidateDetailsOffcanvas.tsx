import { ApiPromise } from "@polkadot/api"
import { AccountId } from "@polkadot/types/interfaces"
import { useEffect, useState } from "react"
import { MemberIdentity } from "../../../../components/MemberIdentity"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { Offcanvas } from "../../components/Offcanvas"

type VoteType = {
  memberId: AccountId,
  type: 'Skeptic' | 'Approve' | 'Reject'
}

type Props = {
  api: ApiPromise,
  show: boolean,
  candidateId: AccountId,
  onClose: () => void
}

export function CandidateDetailsOffcanvas({ api, candidateId, show, onClose }: Props) {
  const [votes, setVotes] = useState<VoteType[] | null>(null)

  useEffect(() => {
    // TODO: cache members and member->candidate map
    api.query.society.members().then(async (memberIds) => {
      const candidateMemberMap = memberIds.map((memberId) => [candidateId, memberId])
      const votesResponse = await api.query.society.votes.multi(candidateMemberMap)
      setVotes(votesResponse.flatMap((vote, idx): VoteType[] => {
        if (vote.isNone) return []
        // Associate voter id to vote based on list position
        return [{ memberId: candidateMemberMap[idx][1], type: vote.unwrap().type }]
      }))
    })
  }, [])

  return (
    <Offcanvas placement="end" show={show} onClose={onClose}>
      {votes ? <CanvasBody api={api} votes={votes} /> : <LoadingSpinner />}
    </Offcanvas>
  )
}

function CanvasBody({ api, votes }: { api: ApiPromise, votes: VoteType[] }) {
  // TODO: group
  return (<>
    {votes.map((vote) => (<>
      <span>{vote.type}:&nbsp;</span>
      <MemberIdentity api={api} memberAccountId={vote.memberId} />
      <br />
    </>))}
  </>)
}
