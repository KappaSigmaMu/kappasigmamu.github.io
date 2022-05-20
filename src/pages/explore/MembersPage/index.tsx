import { ApiPromise } from '@polkadot/api'
import { DeriveSociety, DeriveSocietyMember } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useConsts } from '../../../hooks/useConsts'
import { buildSocietyMembersArray } from '../helpers'
import { MembersList } from './components/MembersList'

type MembersPageProps = {
  api: ApiPromise | null
}

const MembersPage = ({ api }: MembersPageProps): JSX.Element => {
  const loading = !api?.derive.society
  const [members, setMembers] = useState<SocietyMember[]>([])
  const { maxStrikes } = useConsts()

  if (loading) return (
    <Spinner animation="border" variant="primary" />
  )

  useEffect(() => {
    api.derive.society.info().then((info: DeriveSociety) => {
      api.derive.society.members().then((responseMembers: DeriveSocietyMember[]) => {
        setMembers(buildSocietyMembersArray(responseMembers, info, maxStrikes))
      })
    })
  }, [])

  return (
    <MembersList members={members} />
  )
}

export { MembersPage }
