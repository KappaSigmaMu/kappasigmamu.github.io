import { ApiPromise } from '@polkadot/api'
import { AccountId32 } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { MembersList } from './components/MembersList'
import { useAccount } from '../../../account/AccountContext'
import { useConsts } from '../../../hooks/useConsts'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { buildSocietyMembersArray, deriveMembersInfo } from '../helpers'

type MembersPageProps = {
  api: ApiPromise | null
}

const MembersPage = ({ api }: MembersPageProps): JSX.Element => {
  const { activeAccount } = useAccount()
  const [members, setMembers] = useState<SocietyMember[] | null>(null)
  const [trigger, setTrigger] = useState(false)
  const society = api?.derive.society

  const { graceStrikes } = useConsts()

  const handleUpdate = () => {
    setTrigger((prev) => !prev) // Toggle the trigger to query the defender again after voting
  }

  let defender: AccountId32
  let skeptic: AccountId32

  useEffect(() => {
    setTrigger(true)
    society?.info().then((info: ExtendedDeriveSociety) => {
      api?.query.society.defending().then((defending) => {
        // Safe unwrap: only set defender/skeptic if defending has a value
        if (defending.isSome) {
          const defendingValue = defending.unwrap()
          defender = defendingValue[0]
          skeptic = defendingValue[1]
          info.defender = defender
          info.skeptic = skeptic
        }

        deriveMembersInfo(api).then((responseMembers: ExtendedDeriveSociety[]) => {
          setMembers(buildSocietyMembersArray(responseMembers, info, graceStrikes))
        })
      })
    })
  }, [trigger, society])

  if (members === null) return <LoadingSpinner />

  return <MembersList api={api!} members={members} activeAccount={activeAccount} handleUpdate={handleUpdate} />
}

export { MembersPage }
