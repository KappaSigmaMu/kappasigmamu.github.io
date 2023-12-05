import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { SuspendedList } from './components/SuspendedList'
import { extractAccountIds } from './helpers/data-extraction'
import { LoadingSpinner } from '../components/LoadingSpinner'

type SuspendedPageProps = {
  api: ApiPromise | null
}

const SuspendedPage = ({ api }: SuspendedPageProps): JSX.Element => {
  const society = api?.query?.society

  const [members, setMembers] = useState<AccountId[] | null>(null)

  useEffect(() => {
    society?.suspendedMembers.keys()
      .then(extractAccountIds)
      .then(setMembers)    
  }, [society])

  return (
    members === null
    ? <LoadingSpinner />
    : <SuspendedList members={members!} />
  )
}

export { SuspendedPage }
