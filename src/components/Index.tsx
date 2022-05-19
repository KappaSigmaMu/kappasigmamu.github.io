import { DeriveAccountInfo } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { useKusama } from '../kusama'

const Index = ({ member } : { member: SocietyMember }) => {
  const { api } = useKusama()
  const [index, setIndex] = useState<string | undefined>()

  useEffect(() => {
    api?.derive.accounts.info(member.accountId, (accountInfo: DeriveAccountInfo) => {
      const index = accountInfo.accountIndex?.toString()
      index && setIndex(index)
    })
  }, [])

  return <>{index}</>
}

export { Index }
