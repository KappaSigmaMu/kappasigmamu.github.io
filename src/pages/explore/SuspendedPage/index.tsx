import { SuspendedList } from './components/SuspendedList'
import { useSociety } from '@/chain/society/SocietyContext'
import { ChainError } from '@/pages/explore/components/ChainError'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'

const SuspendedPage = (): JSX.Element => {
  const state = useSociety().suspendedMembers
  if (state.error) return <ChainError error={state.error} onRetry={state.refetch} />
  return state.data ? <SuspendedList members={state.data} /> : <LoadingSpinner />
}

export { SuspendedPage }
