import { ApiPromise } from '@polkadot/api'
import { useEffect, useState } from 'react'
import { CandidatesList } from './components/CandidatesList'
import { useAccount } from '../../../account/AccountContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { buildSocietyCandidatesArray } from '../helpers'

type CandidatesPageProps = {
  api: ApiPromise | null
}

const CandidatesPage = ({ api }: CandidatesPageProps): JSX.Element => {
  const { activeAccount } = useAccount()
  const [candidates, setCandidates] = useState<SocietyCandidate[] | null>(null)
  const [trigger, setTrigger] = useState(false)

  const handleUpdate = () => {
    setTrigger((prev) => !prev) // Toggle the trigger to query candidates again after voting
  }

  useEffect(() => {
    setTrigger(true)
    api?.query.society.candidates.entries().then((response) => {
      setCandidates(buildSocietyCandidatesArray(response))
    })
  }, [trigger, api])

  return candidates === null ? (
    <LoadingSpinner />
  ) : (
    <CandidatesList api={api!} activeAccount={activeAccount} candidates={candidates} handleUpdate={handleUpdate} />
  )
}

export { CandidatesPage }
