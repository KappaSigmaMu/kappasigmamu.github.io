import { useEffect, useState } from 'react'
import { MembersList } from './components/MembersList'
import { useAccount } from '../../../account/AccountContext'
import { useAssetHub } from '../../../chain/ChainProvider'
import { useChainQuery } from '../../../chain/hooks'
import { getSocietyMembersWithInfo } from '../../../chain/society/derived'
import { useConsts } from '../../../hooks/useConsts'
import { ChainError } from '../components/ChainError'
import { LoadingSpinner } from '../components/LoadingSpinner'

const MembersPage = (): JSX.Element => {
  const { api, client } = useAssetHub()
  const { activeAccount } = useAccount()
  const { graceStrikes } = useConsts()
  const [trigger, setTrigger] = useState(false)
  const [blockTrigger, setBlockTrigger] = useState(0)
  useEffect(() => {
    if (!client) return
    const sub = client.finalizedBlock$.subscribe({ next: () => setBlockTrigger((prev) => prev + 1) })
    return () => sub.unsubscribe()
  }, [client])
  const state = useChainQuery(
    () => (api ? getSocietyMembersWithInfo(api, graceStrikes) : undefined),
    [api, graceStrikes, trigger, blockTrigger]
  )
  if (state.error) return <ChainError error={state.error} onRetry={state.refetch} />
  if (!state.data) return <LoadingSpinner />
  return (
    <MembersList
      members={state.data}
      activeAccount={activeAccount}
      handleUpdate={() => setTrigger((previous) => !previous)}
    />
  )
}

export { MembersPage }
