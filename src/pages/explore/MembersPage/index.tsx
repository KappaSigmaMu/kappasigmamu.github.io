import { useMemo } from 'react'
import { MembersList } from './components/MembersList'
import { useAccount } from '@/account/AccountContext'
import { buildSocietyMembersArray } from '@/chain/society/derived'
import { useSociety } from '@/chain/society/SocietyContext'
import { useConsts } from '@/hooks/useConsts'
import { ChainError } from '@/pages/explore/components/ChainError'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'

const MembersPage = (): JSX.Element => {
  const { activeAccount } = useAccount()
  const { graceStrikes } = useConsts()
  const { memberSnapshots, info } = useSociety()
  const members = useMemo(
    () =>
      memberSnapshots.data && info.data
        ? buildSocietyMembersArray(memberSnapshots.data, info.data, graceStrikes)
        : null,
    [memberSnapshots.data, info.data, graceStrikes]
  )
  const error = memberSnapshots.error ?? info.error
  if (error)
    return (
      <ChainError
        error={error}
        onRetry={() => {
          memberSnapshots.refetch()
          info.refetch()
        }}
      />
    )
  if (!members) return <LoadingSpinner />
  return (
    <MembersList
      members={members}
      activeAccount={activeAccount}
      handleUpdate={() => undefined}
    />
  )
}

export { MembersPage }
