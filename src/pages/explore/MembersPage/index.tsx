import { ApiPromise } from '@polkadot/api'
import { DeriveSocietyMember } from '@polkadot/api-derive/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { MemberDetailsOffCanvas } from './components/MemberDetailsOffcanvas'
import { MembersList } from './components/MembersList'
import { useConsts } from '../../../hooks/useConsts'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { buildSocietyMembersArray, deriveMembersInfo } from '../helpers'

type MembersPageProps = {
  api: ApiPromise | null
}

const MembersPage = ({ api }: MembersPageProps): JSX.Element => {
  const society = api?.derive.society
  const [members, setMembers] = useState<SocietyMember[] | null>(null)
  const [selectedMember, setSelectedMember] = useState<SocietyMember | null>(null)
  const { graceStrikes } = useConsts()
  const onClickMember = (member: SocietyMember) => {
    setSelectedMember(member)
  }
  let defender: AccountId32
  let skeptic: AccountId32

  useEffect(() => {
    society?.info().then((info: ExtendedDeriveSociety) => {
      api?.query.society.defending().then((defending) => {
        defender = defending.unwrap()[0]
        skeptic = defending.unwrap()[1]

        info.defender = defender
        info.skeptic = skeptic

        deriveMembersInfo(api).then((responseMembers: DeriveSocietyMember[]) => {
          setMembers(buildSocietyMembersArray(responseMembers, info, graceStrikes))
        })
      })
    })
  }, [society])

  if (members === null) return <LoadingSpinner />

  return (
    <>
      <MemberDetailsOffCanvas
        api={api!}
        accountId={selectedMember?.accountId}
        show={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
      />
      <MembersList api={api!} members={members} onClickMember={onClickMember} />
    </>
  )
}

export { MembersPage }
