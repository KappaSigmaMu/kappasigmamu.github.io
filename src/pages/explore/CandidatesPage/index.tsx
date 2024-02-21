import { ApiPromise } from '@polkadot/api'
import { StorageKey } from '@polkadot/types'
import { useEffect, useState } from 'react'
import { CandidatesList } from './components/CandidatesList'
import { useAccount } from '../../../account/AccountContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { buildSocietyCandidatesArray } from '../helpers'
import { PalletSocietyCandidacy } from '@polkadot/types/lookup'

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
    api?.query.society.candidates.keys().then((response: StorageKey[]) => {
      const candidatePromises = response.map((storageKey) => {
        const [candidateAddress] = storageKey.toHuman() as Array<string>
        return api?.query.society.candidates(candidateAddress).then((candidate) => {
          if (!candidate.toHuman()) return

          const accountId = api.createType('AccountId', candidateAddress)
          return { accountId, option: candidate }
        })
      })

      Promise.all(candidatePromises).then((candidates) => {
        setCandidates(buildSocietyCandidatesArray(candidates.filter((candidate) => candidate !== undefined)))
      })
    })
  }, [trigger, api])

  return candidates === null ? (
    <LoadingSpinner />
  ) : (
    <CandidatesList api={api!} activeAccount={activeAccount} candidates={candidates} handleUpdate={handleUpdate} />
  )
}

export { CandidatesPage }
