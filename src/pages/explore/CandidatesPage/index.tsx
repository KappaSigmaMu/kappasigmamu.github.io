import { CandidatesList } from './components/CandidatesList'
import { useAccount } from '../../../account/AccountContext'
import { buildSocietyCandidatesArray } from '../../../chain/society/derived'
import { useSociety } from '../../../chain/society/SocietyContext'
import { ChainError } from '../components/ChainError'
import { LoadingSpinner } from '../components/LoadingSpinner'

const CandidatesPage = (): JSX.Element => {
  const { activeAccount } = useAccount()
  const state = useSociety().candidates
  const candidates = state.data ? buildSocietyCandidatesArray(state.data) : null
  if (state.error) return <ChainError error={state.error} onRetry={state.refetch} />
  return candidates === null ? (
    <LoadingSpinner />
  ) : (
    <CandidatesList activeAccount={activeAccount} candidates={candidates} handleUpdate={() => undefined} />
  )
}

export { CandidatesPage }
