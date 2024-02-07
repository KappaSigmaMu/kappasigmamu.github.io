import type { ApiPromise } from '@polkadot/api'
import { StorageKey, u32 } from '@polkadot/types'
import type { AccountId, AccountId32 } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'
import toast from 'react-hot-toast'
import { combineLatest, firstValueFrom, map, of } from 'rxjs'

function buildSocietyCandidatesArray(response: any): SocietyCandidate[] {
  return response.map((item: any) => ({
    accountId: item[0].args[0] as AccountId,
    kind: item[1].unwrap().kind,
    bid: item[1].unwrap().bid,
    tally: item[1].unwrap().tally,
    skepticStruck: item[1].unwrap().skepticStruck
  }))
}

const toastByStatus = {
  success: (message: string, params: object) => {
    toast.dismiss('Awaiting signature...')
    toast.dismiss('Request sent. Waiting for response...')
    return toast.success(message, params)
  },
  loading: (message: string, params: object) => {
    toast.dismiss('Awaiting signature...')
    return toast.loading(message, params)
  },
  error: (message: string, params: object) => {
    toast.dismiss('Awaiting signature...')
    return toast.error(message, params)
  }
}

const buildSocietyMembersArray = (
  members: ExtendedDeriveSociety[],
  info: ExtendedDeriveSociety | null,
  graceStrikes: BN
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
    vote: member.vote,
    rank: member.rank
  }))

  return membersArray.sort(sortSocietyMembersArray)
}

const sortSocietyMembersArray = (a: SocietyMember, b: SocietyMember): number => {
  if (a.isDefender !== b.isDefender) {
    return a.isDefender ? -1 : 1
  }
  if (a.isSkeptic !== b.isSkeptic) {
    return a.isSkeptic ? -1 : 1
  }
  if (a.isHead !== b.isHead) {
    return a.isHead ? -1 : 1
  }
  if (a.isFounder !== b.isFounder) {
    return a.isFounder ? -1 : 1
  }
  if (a.rank.toNumber() > 0 !== b.rank.toNumber() > 0) {
    return a.rank.toNumber() > 0 ? -1 : 1
  }
  if (a.isDefenderVoter !== b.isDefenderVoter) {
    return a.isDefenderVoter ? -1 : 1
  }
  return 0
}

async function deriveMembersInfo(api: ApiPromise): Promise<ExtendedDeriveSociety[]> {
  const currentChallengeRound: u32 = (await api.query.society.challengeRoundCount()) as u32

  const memberKeys = (await api.query.society.members.keys()) as StorageKey<[AccountId32]>[]
  const accountIds: AccountId[] = memberKeys.map((account) => account.args[0] as AccountId32)

  return firstValueFrom(
    combineLatest([
      of(accountIds),
      api.query.society.members.multi(accountIds),
      api.query.society.payouts.multi(accountIds),
      api.query.society.defenderVotes.multi(accountIds.map((accountId) => [currentChallengeRound, accountId])),
      api.query.society.suspendedMembers.multi(accountIds)
    ]).pipe(
      map(([accountIds, members, payouts, defenderVotes, suspendedMembers]) =>
        accountIds
          .map((accountId, index) =>
            members[index].isSome
              ? {
                  accountId,
                  isDefenderVoter: defenderVotes[index].isSome,
                  isSuspended: suspendedMembers[index].isSome,
                  member: members[index].unwrap(),
                  payouts: payouts[index].payouts
                }
              : null
          )
          .filter((m): m is NonNullable<typeof m> => !!m)
          .map(({ accountId, isDefenderVoter, isSuspended, member, payouts }) => ({
            accountId,
            isDefenderVoter,
            isSuspended,
            payouts,
            strikes: member.strikes,
            vouching: member.vouching.unwrapOr(undefined),
            rank: member.rank
          }))
      )
    )
  )
}

export { toastByStatus, buildSocietyCandidatesArray, buildSocietyMembersArray, deriveMembersInfo }
