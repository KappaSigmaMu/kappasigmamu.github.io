import { ApiPromise } from '@polkadot/api'
import { DeriveSociety, DeriveSocietyMember } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { useConsts } from '../../../hooks/useConsts'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { buildSocietyMembersArray } from '../helpers'
import { MembersList } from './components/MembersList'

type MembersPageProps = {
  api: ApiPromise | null
}

const MembersPage = ({ api }: MembersPageProps): JSX.Element => {
  const society = api?.derive.society
  const [members, setMembers] = useState<SocietyMember[] | null>(null)
  const { maxStrikes } = useConsts()

  useEffect(() => {
    society?.info().then((info: DeriveSociety) => {
      society?.members().then((responseMembers: DeriveSocietyMember[]) => {
        setMembers(buildSocietyMembersArray(responseMembers, info, maxStrikes))
      })
    })
  }, [society])

  return (
    members === null 
      ? <LoadingSpinner />
      : <MembersList api={api!} members={members} />
  )
}

export { MembersPage }
