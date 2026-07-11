import { useState } from 'react'
import { MembersList } from './components/MembersList'
import { useAccount } from '../../../account/AccountContext'
import { useAssetHub } from '../../../chain/ChainProvider'
import { useChainQuery } from '../../../chain/hooks'
import { getSocietyMembersWithInfo } from '../../../chain/society/derived'
import { useConsts } from '../../../hooks/useConsts'
import { ChainError } from '../components/ChainError'
import { LoadingSpinner } from '../components/LoadingSpinner'

const MembersPage = (): JSX.Element => {
  const { api } = useAssetHub(); const { activeAccount } = useAccount(); const { graceStrikes } = useConsts(); const [trigger, setTrigger] = useState(false)
  const state = useChainQuery(() => api ? getSocietyMembersWithInfo(api, graceStrikes) : undefined, [api, graceStrikes, trigger])
  if (state.error) return <ChainError error={state.error} onRetry={state.refetch} />
  if (!state.data) return <LoadingSpinner />
  return <MembersList members={state.data} activeAccount={activeAccount} handleUpdate={() => setTrigger((previous) => !previous)} />
}

export { MembersPage }
