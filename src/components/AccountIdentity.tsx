import type { ApiPromise } from '@polkadot/api'
import type { DeriveAccountRegistration } from '@polkadot/api-derive/types'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { truncateMiddle } from '../helpers/truncate'

const AccountIdentity = ({
  accountId,
  api,
  hideNotSet
}: {
  accountId: AccountId
  api: ApiPromise
  hideNotSet?: boolean
}) => {
  const [id, setId] = useState<string>('')

  useEffect(() => {
    api.derive.accounts.identity(accountId, (identity: DeriveAccountRegistration) => {
      identity.display && setId(identity.display)
    })
  }, [])

  if (!id && hideNotSet) return <></>
  if (id) return <>{id}</>
  return <>{truncateMiddle(accountId?.toString(), 20)}</>
}

export { AccountIdentity }
