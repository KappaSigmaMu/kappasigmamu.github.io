import { DeriveSocietyMember } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useKusama } from '../../../kusama'
import { MembersList } from './MembersList'

const MembersPage = (): JSX.Element => {
  const { api } = useKusama()
  const [members, setMembers] = useState<DeriveSocietyMember[] | []>([])

  const loading = !api?.query?.society

  useEffect(() => {
    if (!loading) {
      api.derive.society.members().then((response: DeriveSocietyMember[]) => {
        setMembers(response)
      })
    }
  }, [api?.query?.society])

  const content = loading ? <Spinner animation="border" variant="primary" /> : <MembersList members={members} />

  return (content)
}

export { MembersPage }
