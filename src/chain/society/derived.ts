import type { AssetHubApi } from '../client'
import { isSameAddress } from '../ss58'
import type { SocietyCandidate, SocietyInfo, SocietyMember } from '../types'
import { getSocietyCandidates, getSocietyInfo, getSocietyMembers, type SocietyMemberSnapshot } from './queries'

export function buildSocietyCandidatesArray(
  candidates: Awaited<ReturnType<typeof getSocietyCandidates>>
): SocietyCandidate[] {
  return candidates.map(({ accountId, candidate }) => ({
    accountId,
    round: candidate.round,
    kindType: candidate.kind.type,
    bid: candidate.bid,
    tally: candidate.tally,
    skepticStruck: candidate.skeptic_struck
  }))
}

const sortSocietyMembersArray = (a: SocietyMember, b: SocietyMember): number => {
  if (a.isDefender !== b.isDefender) return a.isDefender ? -1 : 1
  if (a.isSkeptic !== b.isSkeptic) return a.isSkeptic ? -1 : 1
  if (a.isHead !== b.isHead) return a.isHead ? -1 : 1
  if (a.isFounder !== b.isFounder) return a.isFounder ? -1 : 1
  if (a.rank > 0 !== b.rank > 0) return a.rank > 0 ? -1 : 1
  if (a.isDefenderVoter !== b.isDefenderVoter) return a.isDefenderVoter ? -1 : 1
  return 0
}

export function buildSocietyMembersArray(
  members: SocietyMemberSnapshot[],
  info: SocietyInfo | null,
  graceStrikes: number
): SocietyMember[] {
  return members
    .map((member) => ({
      accountId: member.accountId,
      hasPayouts: member.payouts.length > 0,
      hasStrikes: member.strikes > 0,
      isDefender: isSameAddress(member.accountId, info?.defender),
      isDefenderVoter: member.isDefenderVoter,
      isFounder: isSameAddress(member.accountId, info?.founder),
      isHead: isSameAddress(member.accountId, info?.head),
      isSkeptic: isSameAddress(member.accountId, info?.skeptic),
      isSuspended: member.isSuspended,
      isWarned: !member.isSuspended && member.strikes > graceStrikes,
      payouts: member.payouts,
      strikes: member.strikes,
      strikesCount: member.strikes,
      vouching: member.vouching
        ? { isBanned: member.vouching.type === 'Banned', isVouching: member.vouching.type === 'Vouching' }
        : undefined,
      vote: member.vote,
      rank: member.rank
    }))
    .sort(sortSocietyMembersArray)
}

export async function getSocietyMembersWithInfo(api: AssetHubApi, graceStrikes: number): Promise<SocietyMember[]> {
  const [info, members] = await Promise.all([getSocietyInfo(api), getSocietyMembers(api)])
  return buildSocietyMembersArray(members, info, graceStrikes)
}

export type SocietyMembersWithPayouts = SocietyMember & {
  extendedPayouts: { block: number; pending: bigint; paid: bigint }
}

export function buildSocietyMembersWithPayouts(
  rawMembers: SocietyMemberSnapshot[],
  info: SocietyInfo | null,
  graceStrikes: number
): SocietyMembersWithPayouts[] {
  const members = buildSocietyMembersArray(rawMembers, info, graceStrikes)
  const byAddress = new Map(rawMembers.map((member) => [member.accountId, member]))

  return members
    .map((member) => {
      const raw = byAddress.get(member.accountId)
      const payouts = raw?.payouts ?? []
      const block = payouts.length > 0 ? Math.max(...payouts.map(([payoutBlock]) => payoutBlock)) : 0
      const pending = payouts.reduce((total, [, amount]) => total + amount, 0n)

      return { ...member, extendedPayouts: { block, pending, paid: raw?.paid ?? 0n } }
    })
    .sort((a, b) => {
      const blockA = a.extendedPayouts.block === 0 ? Number.MAX_SAFE_INTEGER : a.extendedPayouts.block
      const blockB = b.extendedPayouts.block === 0 ? Number.MAX_SAFE_INTEGER : b.extendedPayouts.block
      return (
        blockA - blockB ||
        Number(b.extendedPayouts.pending - a.extendedPayouts.pending) ||
        Number(b.extendedPayouts.paid - a.extendedPayouts.paid)
      )
    })
}

export async function getSocietyMembersWithPayouts(
  api: AssetHubApi,
  graceStrikes: number
): Promise<SocietyMembersWithPayouts[]> {
  const [info, rawMembers] = await Promise.all([getSocietyInfo(api), getSocietyMembers(api)])
  return buildSocietyMembersWithPayouts(rawMembers, info, graceStrikes)
}
