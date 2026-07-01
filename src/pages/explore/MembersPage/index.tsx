import { ApiPromise } from '@polkadot/api'
import type { Option } from '@polkadot/types'
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

  useEffect(() => {
    const fetchData = async () => {
      if (!api || !society) return

      const info: ExtendedDeriveSociety = await society.info()
      const defendingCodec = await api.query.society.defending()
      const defending = defendingCodec as Option<any>

      if (defending.isSome) {
        const defendingValue = defending.unwrap()
        info.defender = defendingValue[0]
        info.skeptic = defendingValue[1]
      }

      const responseMembers: ExtendedDeriveSociety[] = await deriveMembersInfo(api)
      setMembers(buildSocietyMembersArray(responseMembers, info, graceStrikes))
    }

    fetchData()
  }, [trigger, society, api, graceStrikes])

  if (members === null) return <LoadingSpinner />

  return <MembersList api={api!} members={members} activeAccount={activeAccount} handleUpdate={handleUpdate} />
}

export { MembersPage }
