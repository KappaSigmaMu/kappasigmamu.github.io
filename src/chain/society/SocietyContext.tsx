import React, { useContext, useMemo } from 'react'
import { combineLatest, distinctUntilChanged, filter, map } from 'rxjs'
import { useAssetHub } from '../ChainProvider'
import { useChainSub, type ChainRequestState } from '../hooks'
import type { AccountId, SocietyBid, SocietyInfo, SocietyPayoutRecord, SocietyVote } from '../types'
import type {
  SocietyCandidateEntry,
  SocietyMemberEntry,
  SocietyMemberSnapshot,
  SocietyTotals
} from './queries'

type SocietyContextValue = {
  bids: ChainRequestState<SocietyBid[]>
  candidates: ChainRequestState<SocietyCandidateEntry[]>
  memberEntries: ChainRequestState<SocietyMemberEntry[]>
  memberSnapshots: ChainRequestState<SocietyMemberSnapshot[]>
  suspendedMembers: ChainRequestState<AccountId[]>
  info: ChainRequestState<SocietyInfo>
  totals: ChainRequestState<SocietyTotals>
}

const missingProvider = () => {
  throw new Error('SocietyProvider is missing')
}

const emptyRequest = <T,>(): ChainRequestState<T> => ({
  data: undefined,
  error: null,
  isLoading: true,
  refetch: missingProvider
})

const SocietyContext = React.createContext<SocietyContextValue>({
  bids: emptyRequest(),
  candidates: emptyRequest(),
  memberEntries: emptyRequest(),
  memberSnapshots: emptyRequest(),
  suspendedMembers: emptyRequest(),
  info: emptyRequest(),
  totals: emptyRequest()
})

const firstError = (...requests: Array<ChainRequestState<unknown>>): Error | null =>
  requests.find(({ error }) => error)?.error ?? null

const sameStorageValue = <T,>(previous: { value: T }, current: { value: T }) => previous.value === current.value

export function SocietyProvider({ children }: { children: React.ReactNode }) {
  const { api } = useAssetHub()
  const bids = useChainSub(
    () =>
      api?.query.Society.Bids.watchValue({ at: 'best' }).pipe(
        distinctUntilChanged(sameStorageValue),
        map(({ value }) => value)
      ),
    [api]
  )
  const candidates = useChainSub(
    () =>
      api?.query.Society.Candidates.watchEntries({ at: 'best' }).pipe(
        filter(({ deltas }, index) => index === 0 || deltas !== null),
        map(({ entries }) =>
          entries.map(({ args: [accountId], value: candidate }) => ({ accountId, candidate }))
        )
      ),
    [api]
  )
  const memberEntries = useChainSub(
    () =>
      api?.query.Society.Members.watchEntries({ at: 'best' }).pipe(
        filter(({ deltas }, index) => index === 0 || deltas !== null),
        map(({ entries }) => entries.map(({ args: [accountId], value: member }) => ({ accountId, member })))
      ),
    [api]
  )
  const suspendedMembers = useChainSub(
    () =>
      api?.query.Society.SuspendedMembers.watchEntries({ at: 'best' }).pipe(
        filter(({ deltas }, index) => index === 0 || deltas !== null),
        map(({ entries }) => entries.map(({ args: [accountId] }) => accountId))
      ),
    [api]
  )
  const challengeRound = useChainSub(
    () =>
      api?.query.Society.ChallengeRoundCount.watchValue({ at: 'best' }).pipe(
        distinctUntilChanged(sameStorageValue),
        map(({ value }) => value)
      ),
    [api]
  )
  const defenderVotes = useChainSub(
    () =>
      api && challengeRound.data !== undefined
        ? api.query.Society.DefenderVotes.watchEntries(challengeRound.data, { at: 'best' }).pipe(
            filter(({ deltas }, index) => index === 0 || deltas !== null),
            map(({ entries }) =>
              entries.map(({ args: [, accountId], value: vote }) => ({ accountId, vote }))
            )
          )
        : undefined,
    [api, challengeRound.data]
  )
  const info = useChainSub(
    () =>
      api
        ? combineLatest({
            founder: api.query.Society.Founder.watchValue({ at: 'best' }).pipe(distinctUntilChanged(sameStorageValue)),
            head: api.query.Society.Head.watchValue({ at: 'best' }).pipe(distinctUntilChanged(sameStorageValue)),
            skeptic: api.query.Society.Skeptic.watchValue({ at: 'best' }).pipe(distinctUntilChanged(sameStorageValue)),
            pot: api.query.Society.Pot.watchValue({ at: 'best' }).pipe(distinctUntilChanged(sameStorageValue)),
            parameters: api.query.Society.Parameters.watchValue({ at: 'best' }).pipe(
              distinctUntilChanged(sameStorageValue)
            ),
            defending: api.query.Society.Defending.watchValue({ at: 'best' }).pipe(
              distinctUntilChanged(sameStorageValue)
            )
          }).pipe(
            map(({ founder, head, skeptic, pot, parameters, defending }) => ({
              founder: founder.value,
              head: head.value,
              skeptic: skeptic.value,
              pot: pot.value,
              parameters: parameters.value,
              defender: defending.value?.[0],
              defenderSkeptic: defending.value?.[1]
            }))
          )
        : undefined,
    [api]
  )

  const memberSnapshots = useMemo<ChainRequestState<SocietyMemberSnapshot[]>>(() => {
    const isLoading =
      memberEntries.isLoading || defenderVotes.isLoading || suspendedMembers.isLoading || challengeRound.isLoading
    const data =
      !isLoading && memberEntries.data && defenderVotes.data && suspendedMembers.data
        ? buildMemberSnapshots(memberEntries.data, defenderVotes.data, suspendedMembers.data)
        : undefined
    return {
      data,
      error: firstError(memberEntries, defenderVotes, suspendedMembers, challengeRound),
      isLoading,
      refetch: () => {
        memberEntries.refetch()
        defenderVotes.refetch()
        suspendedMembers.refetch()
        challengeRound.refetch()
      }
    }
  }, [memberEntries, defenderVotes, suspendedMembers, challengeRound])

  const totals = useMemo<ChainRequestState<SocietyTotals>>(() => {
    const isLoading =
      bids.isLoading ||
      candidates.isLoading ||
      memberEntries.isLoading ||
      suspendedMembers.isLoading ||
      info.isLoading
    const data =
      !isLoading && bids.data && candidates.data && memberEntries.data && suspendedMembers.data && info.data
        ? {
            bidders: bids.data.length,
            candidates: candidates.data.length,
            members: memberEntries.data.length,
            maxMembers: info.data.parameters?.max_members ?? 0,
            suspendedMembers: suspendedMembers.data.length
          }
        : undefined
    return {
      data,
      error: firstError(bids, candidates, memberEntries, suspendedMembers, info),
      isLoading,
      refetch: () => {
        bids.refetch()
        candidates.refetch()
        memberEntries.refetch()
        suspendedMembers.refetch()
        info.refetch()
      }
    }
  }, [bids, candidates, memberEntries, suspendedMembers, info])

  const value = useMemo(
    () => ({ bids, candidates, memberEntries, memberSnapshots, suspendedMembers, info, totals }),
    [bids, candidates, memberEntries, memberSnapshots, suspendedMembers, info, totals]
  )
  return <SocietyContext.Provider value={value}>{children}</SocietyContext.Provider>
}

function buildMemberSnapshots(
  members: SocietyMemberEntry[],
  defenderVotes: Array<{ accountId: AccountId; vote: SocietyVote }>,
  suspendedMembers: AccountId[]
): SocietyMemberSnapshot[] {
  const votes = new Map(defenderVotes.map(({ accountId, vote }) => [accountId, vote]))
  const suspended = new Set(suspendedMembers)
  return members.map(({ accountId, member }) => ({
    accountId,
    rank: member.rank,
    strikes: member.strikes,
    vouching: member.vouching,
    payouts: [],
    paid: 0n,
    vote: votes.get(accountId),
    isDefenderVoter: votes.has(accountId),
    isSuspended: suspended.has(accountId)
  }))
}

export function useSociety() {
  return useContext(SocietyContext)
}

export function useSocietyPayouts(): ChainRequestState<
  Array<{ accountId: AccountId; payout: SocietyPayoutRecord }>
> {
  const { api } = useAssetHub()
  return useChainSub(
    () =>
      api?.query.Society.Payouts.watchEntries({ at: 'best' }).pipe(
        filter(({ deltas }, index) => index === 0 || deltas !== null),
        map(({ entries }) => entries.map(({ args: [accountId], value: payout }) => ({ accountId, payout })))
      ),
    [api]
  )
}
