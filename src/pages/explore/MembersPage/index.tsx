import { DeriveSociety, DeriveSocietyMember } from '@polkadot/api-derive/types'
import { BN } from '@polkadot/util'
import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useConsts } from '../../../hooks/useConsts'
import { useKusama } from '../../../kusama'
import { MembersList } from './MembersList'

const societyMembersArraySorter = (a: SocietyMember, b: SocietyMember): number => (
  a.isHead !== b.isHead
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
  info: DeriveSociety | null,
  maxStrikes: BN,
  ): SocietyMember[] => {

  const membersArray = members.map((member) => ({
    accountId: member.accountId,
    hasPayouts: member.payouts.length > 0,
    hasStrikes: !member.strikes.isEmpty,
    isDefenderVoter: !!member.isDefenderVoter,
    isFounder: !!info?.founder?.eq(member.accountId),
    isHead: !!info?.head?.eq(member.accountId),
    isSkeptic: !!member.vote?.isSkeptic,
    isSuspended: member.isSuspended,
    isWarned: !member.isSuspended && member.strikes.gt(maxStrikes),
    payouts: member.payouts,
    strikes: member.strikes,
    strikesCount: member.strikes.isEmpty ? 0 : member.strikes.toNumber(),
  }))

  return membersArray.sort(societyMembersArraySorter)
}

const MembersPage = (): JSX.Element => {
  const { api } = useKusama()
  const { maxStrikes } = useConsts()

  const [members, setMembers] = useState<DeriveSocietyMember[] | []>([])
  const [info, setInfo] = useState<DeriveSociety | null>(null)

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

  const content = loading
    ? <Spinner animation="border" variant="primary" />
    : <MembersList members={societyMembersArrayBuilder(members, info, maxStrikes)} />

  return (content)
}

export { MembersPage }
