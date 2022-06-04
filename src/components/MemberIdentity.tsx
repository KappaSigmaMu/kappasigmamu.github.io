import type { DeriveAccountRegistration } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { truncateMiddle } from '../helpers/truncate'
import { useKusama } from '../kusama'

const MemberIdentity = ({ member }: { member: SocietyMember }) => {
  const { api } = useKusama()
  const [id, setId] = useState<string>('')

  useEffect(() => {
    api?.derive.accounts.identity(member.accountId, (identity: DeriveAccountRegistration) => {
      identity.display && setId(identity.display)
    })
  }, [])

  return <>{id ? id : truncateMiddle(member.accountId?.toString())}</>
}

export { MemberIdentity }
