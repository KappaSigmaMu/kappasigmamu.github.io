import { ApiPromise } from '@polkadot/api'
import { StorageKey } from '@polkadot/types'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { SuspendedList } from './components/SuspendedList'

type SuspendedPageProps = {
  api: ApiPromise | null
}

const extractAccountIds = (keys: StorageKey<[AccountId]>[]): AccountId[] => {
  return keys.map(({ args: [accountId] }) => accountId).filter((a) => !!a)
}

const SuspendedPage = ({ api }: SuspendedPageProps): JSX.Element => {
  const loading = !api?.query?.society

  if (loading) return (
    <Spinner animation="border" variant="primary" />
  )

  const [candidates, setCandidates] = useState<AccountId[]>([])
  const [members, setMembers] = useState<AccountId[]>([])

  useEffect(() => {
    api.query.society.suspendedMembers.keys()
      .then(extractAccountIds)
      .then(setMembers)
    
    api.query.society.suspendedCandidates.keys()
      .then(extractAccountIds)
      .then(setCandidates)
  }, [])

  return (<SuspendedList members={members} candidates={candidates} />)
}

export { SuspendedPage }
