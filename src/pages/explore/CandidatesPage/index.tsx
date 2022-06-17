import { ApiPromise } from '@polkadot/api'
import { DeriveSocietyCandidate } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { buildSocietyCandidatesArray } from '../helpers'
import { CandidatesList } from './components/CandidatesList'

type CandidatesPageProps = {
  api: ApiPromise | null
}

const CandidatesPage = ({ api }: CandidatesPageProps): JSX.Element => {
  const society = api?.derive?.society
  const [candidates, setCandidates] = useState<SocietyCandidate[] | null>(null)

  useEffect(() => {
    society?.candidates((responseCandidates: DeriveSocietyCandidate[]) => {
      buildSocietyCandidatesArray(api!, responseCandidates)
        .then(setCandidates)
        .catch(console.error)
    })
  }, [society])

  return (
    candidates === null 
    ? <LoadingSpinner />
    : <CandidatesList candidates={candidates}/>
  )
}

export { CandidatesPage }
