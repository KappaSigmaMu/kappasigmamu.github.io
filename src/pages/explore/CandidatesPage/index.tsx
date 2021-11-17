import { DeriveSocietyCandidate } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useKusama } from '../../../kusama'
import { CandidatesList } from './CandidatesList'

const CandidatesPage = (): JSX.Element => {
  const { api } = useKusama()
  const [candidates, setCandidates] = useState<DeriveSocietyCandidate[] | []>([])

  const loading = !api?.query?.society

  useEffect(() => {
    if (!loading) {
      api.derive.society.candidates().then((response: DeriveSocietyCandidate[]) => {
        setCandidates(response)
      })
    }
  }, [api?.query?.society])

  const content = loading
    ? <Spinner animation="border" variant="primary" />
    : <CandidatesList candidates={candidates} />

  return (content)
}

export { CandidatesPage }
