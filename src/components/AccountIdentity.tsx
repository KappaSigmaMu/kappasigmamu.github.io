import type { ApiPromise } from '@polkadot/api'
import type { DeriveAccountRegistration } from '@polkadot/api-derive/types'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { truncateMiddle } from '../helpers/truncate'

const AccountIdentity = ({ accountId, api }: { accountId: AccountId, api: ApiPromise }) => {
  const [id, setId] = useState<string>('')

  useEffect(() => {
    api.derive.accounts.identity(accountId, (identity: DeriveAccountRegistration) => {
      identity.display && setId(identity.display)
    })
  }, [])

  return <>{id ? id : truncateMiddle(accountId?.toString())}</>
}

export { AccountIdentity }
