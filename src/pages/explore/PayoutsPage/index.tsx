import { ApiPromise } from '@polkadot/api'
import { AccountId32 } from '@polkadot/types/interfaces'
import { PalletSocietyPayoutRecord } from '@polkadot/types/lookup'
import { useEffect, useState } from 'react'
import { PayoutsList } from './components/PayoutsList'
import { useAccount } from '../../../account/AccountContext'
import { useConsts } from '../../../hooks/useConsts'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { buildSocietyMembersArray, deriveMembersInfo } from '../helpers'

type PayoutsPageProps = {
  api: ApiPromise | null
}

const PayoutsPage = ({ api }: PayoutsPageProps): JSX.Element => {
  const { activeAccount } = useAccount()
  const [members, setMembers] = useState<ExtendedSocietyMember[] | null>(null)
  const [trigger, setTrigger] = useState(false)
  const society = api?.derive.society

  const { graceStrikes } = useConsts()

  const handleUpdate = () => {
    setTrigger((prev) => !prev)
  }

  let defender: AccountId32
  let skeptic: AccountId32

  useEffect(() => {
    const fetchData = async () => {
      if (!api || !society) return

      const info: ExtendedDeriveSociety = await society.info()
      const defending = await api.query.society.defending()

      defender = defending.unwrap()[0]
      skeptic = defending.unwrap()[1]

      info.defender = defender
      info.skeptic = skeptic

      const responseMembers: ExtendedDeriveSociety[] = await deriveMembersInfo(api)
      const membersArray = buildSocietyMembersArray(responseMembers, info, graceStrikes)

      const extendedMembers: ExtendedSocietyMember[] = await Promise.all(
        membersArray.map(async (member) => {
          const payoutsCodec = (await api.query.society.payouts(member.accountId)) as PalletSocietyPayoutRecord

          const payouts = payoutsCodec.payouts.toArray()
          const highestBlockNumber = payouts.length > 0 ? Math.max(...payouts.map((payout) => payout[0].toNumber())) : 0
          const totalBalance = payouts.reduce((sum: number, payout) => sum + payout[1].toBn().toNumber(), 0)

          return {
            ...member,
            extendedPayouts: {
              block: highestBlockNumber,
              pending: totalBalance,
              paid: payoutsCodec.paid
            }
          }
        })
      )

      const sortedMembers = extendedMembers.sort((a, b) => {
        const blockA = a.extendedPayouts.block === 0 ? Number.MAX_SAFE_INTEGER : a.extendedPayouts.block
        const blockB = b.extendedPayouts.block === 0 ? Number.MAX_SAFE_INTEGER : b.extendedPayouts.block

        const blockComparison = blockA - blockB
        if (blockComparison !== 0) {
          return blockComparison
        }

        const pendingComparison = b.extendedPayouts.pending - a.extendedPayouts.pending
        if (pendingComparison !== 0) {
          return pendingComparison
        }

        return b.extendedPayouts.paid.toBn().cmp(a.extendedPayouts.paid.toBn())
      })

      setMembers(sortedMembers)
    }

    fetchData()
  }, [trigger, society, api, graceStrikes])

  if (members === null) return <LoadingSpinner />

  return <PayoutsList api={api!} members={members} activeAccount={activeAccount} handleUpdate={handleUpdate} />
}

export { PayoutsPage }
