import type { ApiPromise } from '@polkadot/api'
import type { AccountId, AccountIndex as PAccountIndex } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'

const AccountIndex = ({
  accountId,
  api,
  callback
}: {
  accountId: AccountId
  api: ApiPromise
  callback?: (data: string) => void
}) => {
  const [index, setIndex] = useState<string>('')

  useEffect(() => {
    api.derive.accounts.idToIndex(accountId, (accountIndex: PAccountIndex) => {
      if (accountIndex) {
        const index = api.registry.createType('AccountIndex', accountIndex.toNumber()).toString()
        setIndex(index)
        if (callback) callback(index)
      }
    })
  }, [])

  return <>{index}</>
}

export { AccountIndex }
