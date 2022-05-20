import { ApiPromise } from '@polkadot/api'
import { DeriveSocietyCandidate } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { buildSocietyCandidatesArray } from '../helpers'
import { CandidatesList } from './components/CandidatesList'

type CandidatesPageProps = {
  api: ApiPromise | null
}

const CandidatesPage = ({ api }: CandidatesPageProps): JSX.Element => {
  const loading = !api?.query?.society
  const [candidates, setCandidates] = useState<SocietyCandidate[]>([])

  if (loading) return (
    <Spinner animation="border" variant="primary" />
  )

  useEffect(() => {
    api.derive.society.candidates((responseCandidates: DeriveSocietyCandidate[]) => {
      buildSocietyCandidatesArray(api, responseCandidates)
        .then(setCandidates)
        .catch(console.error)
    })
  }, [])

  return (<CandidatesList candidates={candidates}/>)
}

export { CandidatesPage }
