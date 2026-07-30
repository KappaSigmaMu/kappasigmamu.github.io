import { useMemo } from 'react'
import { PayoutsList } from './components/PayoutsList'
import { useAccount } from '@/account/AccountContext'
import { buildSocietyMembersWithPayouts } from '@/chain/society/derived'
import type { SocietyMemberSnapshot } from '@/chain/society/queries'
import { useSociety, useSocietyPayouts } from '@/chain/society/SocietyContext'
import { useConsts } from '@/hooks/useConsts'
import { ChainError } from '@/pages/explore/components/ChainError'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'

const PayoutsPage = (): JSX.Element => {
  const { activeAccount } = useAccount()
  const { graceStrikes } = useConsts()
  const { memberEntries, info } = useSociety()
  const payouts = useSocietyPayouts()
  const members = useMemo(
    () => {
      if (
        memberEntries.isLoading ||
        info.isLoading ||
        payouts.isLoading ||
        !memberEntries.data ||
        !info.data ||
        !payouts.data
      )
        return null
      const payoutByAccount = new Map(payouts.data.map(({ accountId, payout }) => [accountId, payout]))
      const snapshots: SocietyMemberSnapshot[] = memberEntries.data.map(({ accountId, member }) => {
        const payout = payoutByAccount.get(accountId)
        return {
          accountId,
          rank: member.rank,
          strikes: member.strikes,
          vouching: member.vouching,
          payouts: payout?.payouts ?? [],
          paid: payout?.paid ?? 0n,
          isDefenderVoter: false,
          isSuspended: false
        }
      })
      return buildSocietyMembersWithPayouts(snapshots, info.data, graceStrikes)
    },
    [memberEntries, info, payouts, graceStrikes]
  )
  const error = memberEntries.error ?? info.error ?? payouts.error
  if (error)
    return (
      <ChainError
        error={error}
        onRetry={() => {
          memberEntries.refetch()
          info.refetch()
          payouts.refetch()
        }}
      />
    )
  if (!members) return <LoadingSpinner />
  return (
    <PayoutsList
      members={members}
      activeAccount={activeAccount}
      handleUpdate={payouts.refetch}
    />
  )
}

export { PayoutsPage }
