import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { SuspendedList } from './components/SuspendedList'
import { extractAccountIds, extractCandidates } from './helpers/data-extraction'

type SuspendedPageProps = {
  api: ApiPromise | null
}

const SuspendedPage = ({ api }: SuspendedPageProps): JSX.Element => {
  const loading = !api?.query?.society

  if (loading) return (
    <Spinner animation="border" variant="primary" />
  )

  const [candidates, setCandidates] = useState<SuspendedCandidate[]>([])
  const [members, setMembers] = useState<AccountId[]>([])

  useEffect(() => {
    api.query.society.suspendedMembers.keys()
      .then(extractAccountIds)
      .then(setMembers)
    
    api.query.society.suspendedCandidates.entries()
      .then(extractCandidates)
      .then(setCandidates)
  }, [])

  return (<SuspendedList members={members} candidates={candidates} />)
}

export { SuspendedPage }
