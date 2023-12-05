import type { ApiPromise } from '@polkadot/api'
import { DeriveSocietyCandidate, DeriveSocietyMember } from '@polkadot/api-derive/types'
import { BN } from '@polkadot/util'

async function buildSocietyCandidatesArray(
  api: ApiPromise,
  candidates: DeriveSocietyCandidate[]
): Promise<SocietyCandidate[]> {
  const candidatesMap: Record<string, SocietyCandidate> = {}
  candidates.forEach((candidate: DeriveSocietyCandidate) => {
    candidatesMap[candidate.accountId.toString()] = {
      accountId: candidate.accountId,
      kind: candidate.kind,
      value: candidate.value,
      isSuspended: candidate.isSuspended,
      voters: [],
      skeptics: []
    }
  })

  const candidateVotes = candidates.length
    ? await Promise.all(candidates.map(({ accountId }) =>
      api.query.society.votes.entries(accountId)
    ))
    : []

  candidateVotes.forEach((votes): void => {
    votes.forEach(([votesStorage, voteOption]) => {
      const [candidateAccountId, voterAccountId] = votesStorage.args

      if (voteOption.isSome) {
        const key = voterAccountId.toString()
        const vote = voteOption.unwrap()

        console.info(vote)

        // if (vote.isSkeptic) {
        //   !candidatesMap[candidateAccountId.toString()].skeptics.includes(key) &&
        //   candidatesMap[candidateAccountId.toString()].skeptics.push(key)
        // } else {
          !candidatesMap[candidateAccountId.toString()].voters.includes(key) &&
          candidatesMap[candidateAccountId.toString()].voters.push(key)
        // }
      }
    })
  })

  return Object.values(candidatesMap)
}

const buildSocietyMembersArray = (
  members: DeriveSocietyMember[],
  info: ExtendedDeriveSociety | null,
  graceStrikes: BN,
  ): SocietyMember[] => {

  const membersArray = members.map((member) => ({
    accountId: member.accountId,
    hasPayouts: member.payouts.length > 0,
    hasStrikes: !member.strikes.isEmpty,
    isDefender: !!info?.defender?.eq(member.accountId),
    isDefenderVoter: !!member.isDefenderVoter,
    isFounder: !!info?.founder?.eq(member.accountId),
    isHead: !!info?.head?.eq(member.accountId),
    isSkeptic: !!info?.skeptic?.eq(member.accountId),
    isSuspended: member.isSuspended,
    isWarned: !member.isSuspended && member.strikes.gt(graceStrikes),
    payouts: member.payouts,
    strikes: member.strikes,
    strikesCount: member.strikes.isEmpty ? 0 : member.strikes.toNumber(),
    vouching: member.vouching,
    vote: member.vote
  }))

  return membersArray.sort(sortSocietyMembersArray)
}

const sortSocietyMembersArray = (a: SocietyMember, b: SocietyMember): number => (
  a.isDefender !== b.isDefender
    ? a.isDefender ? -1 : 1
    : a.isHead !== b.isHead
      ? (a.isHead ? -1 : 1)
      : a.isFounder !== b.isFounder
        ? (a.isFounder ? -1 : 1)
        : a.isSkeptic !== b.isSkeptic
          ? (a.isSkeptic ? -1 : 1)
          : a.isDefenderVoter !== (b.isDefenderVoter)
            ? (a.isDefenderVoter ? -1 : 1)
            : 1
)

export { buildSocietyCandidatesArray, buildSocietyMembersArray }