import { ApiPromise } from '@polkadot/api'
import { DeriveSociety, DeriveSocietyMember } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { useConsts } from '../../../hooks/useConsts'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { buildSocietyMembersArray } from '../helpers'
import { MemberDetailsOffCanvas } from './components/MemberDetailsOffcanvas'
import { MembersList } from './components/MembersList'

type MembersPageProps = {
  api: ApiPromise | null
}

const MembersPage = ({ api }: MembersPageProps): JSX.Element => {
  const society = api?.derive.society
  const [members, setMembers] = useState<SocietyMember[] | null>(null)
  const [selectedMember, setSelectedMember] = useState<SocietyMember | null>(null)
  const { maxStrikes } = useConsts()
  const onClickMember = (member: SocietyMember) => {
    setSelectedMember(member)
  }

  useEffect(() => {
    society?.info().then((info: DeriveSociety) => {
      society?.members().then((responseMembers: DeriveSocietyMember[]) => {
        setMembers(buildSocietyMembersArray(responseMembers, info, maxStrikes))
      })
    })
  }, [society])

  if (members === null) return <LoadingSpinner />
  
  return (<>
    <MemberDetailsOffCanvas 
      api={api!} 
      accountId={selectedMember?.accountId} 
      show={selectedMember !== null}
      onClose={() => setSelectedMember(null)}
    />
    <MembersList api={api!} members={members} onClickMember={onClickMember} />
  </>)
}

export { MembersPage }
