import type { ApiPromise } from '@polkadot/api'
import type { DeriveAccountRegistration } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { truncateMiddle } from '../helpers/truncate'

const MemberIdentity = ({ member, api }: { member: SocietyMember, api: ApiPromise }) => {
  const [id, setId] = useState<string>('')

  useEffect(() => {
    api.derive.accounts.identity(member.accountId, (identity: DeriveAccountRegistration) => {
      identity.display && setId(identity.display)
    })
  }, [])

  return <>{id ? id : truncateMiddle(member.accountId?.toString())}</>
}

export { MemberIdentity }
