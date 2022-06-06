import type { ApiPromise } from '@polkadot/api'
import type { AccountIndex as PAccountIndex } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'

const AccountIndex = ({ member, api } : { member: SocietyMember, api: ApiPromise }) => {
  const [index, setIndex] = useState<string>('')

  useEffect(() => {
    api.derive.accounts.idToIndex(member.accountId, (accountIndex: PAccountIndex) => {
      if (accountIndex) {
        const index = api.registry.createType('AccountIndex', accountIndex.toNumber()).toString()
        setIndex(index)
      }
    })
  }, [])

  return <>{index}</>
}

export { AccountIndex }
