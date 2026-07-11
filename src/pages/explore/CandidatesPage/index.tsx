import { useState } from 'react'
import { CandidatesList } from './components/CandidatesList'
import { useAccount } from '../../../account/AccountContext'
import { useAssetHub } from '../../../chain/ChainProvider'
import { useChainQuery } from '../../../chain/hooks'
import { buildSocietyCandidatesArray } from '../../../chain/society/derived'
import { getSocietyCandidates } from '../../../chain/society/queries'
import { ChainError } from '../components/ChainError'
import { LoadingSpinner } from '../components/LoadingSpinner'

const CandidatesPage = ({ handleUpdateTotal }: { handleUpdateTotal: () => void }): JSX.Element => {
  const { api } = useAssetHub()
  const { activeAccount } = useAccount()
  const [trigger, setTrigger] = useState(false)
  const state = useChainQuery(() => (api ? getSocietyCandidates(api) : undefined), [api, trigger])
  const candidates = state.data ? buildSocietyCandidatesArray(state.data) : null
  const handleUpdate = () => { handleUpdateTotal(); setTrigger((previous) => !previous) }
  if (state.error) return <ChainError error={state.error} onRetry={state.refetch} />
  return candidates === null ? <LoadingSpinner /> : <CandidatesList activeAccount={activeAccount} candidates={candidates} handleUpdate={handleUpdate} />
}

export { CandidatesPage }
