import { accountId } from '@polkadot/api-derive/accounts'
import { DeriveAccountInfo, DeriveSociety, DeriveSocietyMember } from '@polkadot/api-derive/types'
import { ApiPromise } from '@polkadot/api/promise'
import { AccountId } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'
import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useConsts } from '../../../hooks/useConsts'
import { useKusama } from '../../../kusama'
import { MembersList } from './MembersList'

const societyMembersArraySorter = (a: SocietyMember, b: SocietyMember): number => (
  a.isDefender !== b.isDefender
    ? a.isDefender ? -1 : 1
    : a.isHead !== b.isHead
      ? (a.isHead ? -1 : 1)
      : a.isFounder !== b.isFounder
        ? (a.isFounder ? -1 : 1)
        : a.isSkeptic !== b.isSkeptic
          ? (a.isSkeptic ? -1 : 1)
          : a.isDefenderVoter !== (b.isDefenderVoter)
            ? (a.isDefenderVoter ? -1 : 1)
            : 1
)

const societyMembersArrayBuilder = (
  members: DeriveSocietyMember[],
  indices: Record<string, string>,
  info: DeriveSociety | null,
  maxStrikes: BN,
  ): SocietyMember[] => {

  const membersArray = members.map((member) => ({
    accountId: member.accountId,
    hasPayouts: member.payouts.length > 0,
    hasStrikes: !member.strikes.isEmpty,
    isDefender: !!info?.defender?.eq(member.accountId),
    isDefenderVoter: !!member.isDefenderVoter,
    isFounder: !!info?.founder?.eq(member.accountId),
    isHead: !!info?.head?.eq(member.accountId),
    isSkeptic: !!member.vote?.isSkeptic,
    isSuspended: member.isSuspended,
    isWarned: !member.isSuspended && member.strikes.gt(maxStrikes),
    payouts: member.payouts,
    strikes: member.strikes,
    strikesCount: member.strikes.isEmpty ? 0 : member.strikes.toNumber(),
    index: indices[member.accountId.toString()]
  }))

  return membersArray.sort(societyMembersArraySorter)
}
const MembersPage = (): JSX.Element => {
  const { api } = useKusama()
  const { maxStrikes } = useConsts()

  const [members, setMembers] = useState<DeriveSocietyMember[] | []>([])
  const [info, setInfo] = useState<DeriveSociety | null>(null)
  const [indices, setIndices] = useState<Record<string, string>>({})

  const loading = !api?.query?.society

  useEffect(() => {
    if (!loading) {
      api.derive.society.members().then((response: DeriveSocietyMember[]) => {
        setMembers(response)
      })

      api.derive.society.info().then((response: DeriveSociety) => {
        setInfo(response)
      })
    }
  }, [api?.query?.society])

  useEffect(() => {
    if (!loading) {
      members.map(
        member => {
          api.derive.accounts.info(member.accountId).then((accountInfo: DeriveAccountInfo) => {
            const newIndices = Object.assign(
              indices,
              { [member.accountId.toString()]: accountInfo.accountIndex?.toString() }
            )
            setIndices(newIndices)
          })
        }
      )
    }
  }, [members])

  const content = loading
    ? <Spinner animation="border" variant="primary" />
    : <MembersList members={societyMembersArrayBuilder(members, indices, info, maxStrikes)} />

  return (content)
}

export { MembersPage }
