import type { AssetHubApi } from '../client'
import { isSameAddress } from '../ss58'
import type {
  SocietyBid,
  SocietyCandidateRecord,
  SocietyInfo,
  SocietyMemberRecord,
  SocietyPayoutRecord,
  SocietyVote,
  AccountId
} from '../types'

const society = (api: AssetHubApi) => api.query.Society

export const getSocietyBids = (api: AssetHubApi): Promise<SocietyBid[]> => society(api).Bids.getValue()

export type SocietyAccountLevel = 'human' | 'bidder' | 'candidate' | 'cyborg'
export type SocietyCandidateEntry = { accountId: AccountId; candidate: SocietyCandidateRecord }
export type SocietyMemberEntry = { accountId: AccountId; member: SocietyMemberRecord }

export function getAccountLevelFromCollections(
  address: string,
  bids: SocietyBid[],
  candidates: SocietyCandidateEntry[],
  members: SocietyMemberEntry[]
): SocietyAccountLevel {
  if (members.some(({ accountId }) => isSameAddress(accountId, address))) return 'cyborg'
  if (candidates.some(({ accountId }) => isSameAddress(accountId, address))) return 'candidate'
  if (bids.some(({ who }) => isSameAddress(who, address))) return 'bidder'
  return 'human'
}

export async function getAccountLevel(
  api: AssetHubApi,
  address: string
): Promise<SocietyAccountLevel> {
  const [bids, candidates, members] = await Promise.all([
    getSocietyBids(api),
    getSocietyCandidates(api),
    getSocietyMembersEntries(api)
  ])

  return getAccountLevelFromCollections(address, bids, candidates, members)
}

export const getSocietyCandidates = async (
  api: AssetHubApi
): Promise<SocietyCandidateEntry[]> =>
  (await society(api).Candidates.getEntries()).map(({ keyArgs: [accountId], value: candidate }) => ({
    accountId,
    candidate
  }))

export const getSocietyMembersEntries = (
  api: AssetHubApi
): Promise<SocietyMemberEntry[]> =>
  society(api)
    .Members.getEntries()
    .then((entries) => entries.map(({ keyArgs: [accountId], value: member }) => ({ accountId, member })))

export const getSocietySuspendedMembers = (api: AssetHubApi): Promise<AccountId[]> =>
  society(api)
    .SuspendedMembers.getEntries()
    .then((entries) => entries.map(({ keyArgs: [accountId] }) => accountId))

export const getSocietyVotes = (api: AssetHubApi, candidate: AccountId): Promise<Array<SocietyVote | undefined>> =>
  getSocietyMembersEntries(api).then((members) =>
    society(api).Votes.getValues(members.map(({ accountId }) => [candidate, accountId]))
  )

export type SocietyTotals = {
  bidders: number
  candidates: number
  members: number
  maxMembers: number
  suspendedMembers: number
}

export async function getSocietyTotals(api: AssetHubApi): Promise<SocietyTotals> {
  const [bids, candidates, memberCount, parameters, suspendedMembers] = await Promise.all([
    getSocietyBids(api),
    society(api).Candidates.getEntries(),
    society(api).MemberCount.getValue(),
    society(api).Parameters.getValue(),
    society(api).SuspendedMembers.getEntries()
  ])

  return {
    bidders: bids.length,
    candidates: candidates.length,
    members: memberCount,
    maxMembers: parameters?.max_members ?? 0,
    suspendedMembers: suspendedMembers.length
  }
}

export async function getSocietyInfo(api: AssetHubApi): Promise<SocietyInfo> {
  const [founder, head, skeptic, pot, parameters, defending] = await Promise.all([
    society(api).Founder.getValue(),
    society(api).Head.getValue(),
    society(api).Skeptic.getValue(),
    society(api).Pot.getValue(),
    society(api).Parameters.getValue(),
    society(api).Defending.getValue()
  ])

  return {
    founder,
    head,
    skeptic,
    defender: defending?.[0],
    defenderSkeptic: defending?.[1],
    pot,
    parameters
  }
}

export type SocietyMemberSnapshot = {
  accountId: AccountId
  rank: number
  strikes: number
  vouching?: SocietyMemberRecord['vouching']
  payouts: Array<[number, bigint]>
  paid: bigint
  vote?: SocietyVote
  isDefenderVoter: boolean
  isSuspended: boolean
}

export async function getSocietyMembers(api: AssetHubApi): Promise<SocietyMemberSnapshot[]> {
  const currentChallengeRound = await society(api).ChallengeRoundCount.getValue()
  const memberEntries = await getSocietyMembersEntries(api)
  const accountIds = memberEntries.map(({ accountId }) => accountId)

  const [payouts, defenderVotes, suspendedMembers] = await Promise.all([
    society(api).Payouts.getValues(accountIds.map((accountId) => [accountId])),
    society(api).DefenderVotes.getValues(accountIds.map((accountId) => [currentChallengeRound, accountId])),
    society(api).SuspendedMembers.getValues(accountIds.map((accountId) => [accountId]))
  ])

  return memberEntries.map(({ accountId, member }, index) => {
    const payout = payouts[index] as SocietyPayoutRecord
    const defenderVote = defenderVotes[index]
    const suspendedMember = suspendedMembers[index]

    return {
      accountId,
      rank: member.rank,
      strikes: member.strikes,
      vouching: member.vouching,
      payouts: payout?.payouts ?? [],
      paid: payout?.paid ?? 0n,
      vote: defenderVote,
      isDefenderVoter: defenderVote !== undefined,
      isSuspended: suspendedMember !== undefined
    }
  })
}
