import { SuspendedList } from './components/SuspendedList'
import { useAssetHub } from '../../../chain/ChainProvider'
import { useChainQuery } from '../../../chain/hooks'
import { getSocietySuspendedMembers } from '../../../chain/society/queries'
import { ChainError } from '../components/ChainError'
import { LoadingSpinner } from '../components/LoadingSpinner'

const SuspendedPage = (): JSX.Element => {
  const { api } = useAssetHub(); const state = useChainQuery(() => api ? getSocietySuspendedMembers(api) : undefined, [api])
  if (state.error) return <ChainError error={state.error} onRetry={state.refetch} />
  return state.data ? <SuspendedList members={state.data} /> : <LoadingSpinner />
}

export { SuspendedPage }
