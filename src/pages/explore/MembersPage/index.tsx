import { DeriveSociety, DeriveSocietyMember } from '@polkadot/api-derive/types'
import Identicon from '@polkadot/react-identicon'
import type { AccountId, Balance, BlockNumber, StrikeCount } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'
import { useEffect, useState } from 'react'
import { Badge, Col, Spinner } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { truncateMiddle } from '../../../helpers/truncate'
import { useConsts } from '../../../hooks/useConsts'
import { useKusama } from '../../../kusama'

export interface SocietyMember {
  accountId: AccountId
  hasStrikes: boolean
  isDefenderVoter: boolean
  isFounder: boolean
  isHead: boolean
  isSkeptic: boolean
  isSuspended: boolean
  isWarned: boolean
  payouts?: [BlockNumber, Balance][]
  strikes: StrikeCount
  strikesCount: number
}

const buildSocietyMember = (
  members: DeriveSocietyMember[],
  info: DeriveSociety | null,
  maxStrikes: BN,
  ): SocietyMember[] => {
  return members.map((member) => {
    return {
      accountId: member.accountId,
      hasStrikes: !member.strikes.isEmpty,
      isDefenderVoter: !!member.isDefenderVoter,
      isFounder: !!info?.founder?.eq(member.accountId),
      isHead: !!info?.head?.eq(member.accountId),
      isSkeptic: !!member.vote?.isSkeptic,
      isSuspended: member.isSuspended,
      isWarned: !member.isSuspended && member.strikes.gt(maxStrikes),
      strikes: member.strikes,
      strikesCount: member.strikes.isEmpty ? 0 : member.strikes.toNumber()
    }
  })
}

const MembersList = ({ members }: { members: SocietyMember[] }): JSX.Element => (
  <>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={2} className="text-start">Wallet Hash</Col>
      <Col xs={2} className="text-end">Payouts</Col>
      <Col xs={7} className="text-end"></Col>
    </DataHeaderRow>
    {members.map((member: SocietyMember) => (
      <DataRow key={member.accountId.toString()}>
        <Col xs={1} className="text-center">
          <Identicon value={member.accountId} size={32} theme={'polkadot'} />
        </Col>
        <Col xs={2} className="text-start text-truncate">
          {truncateMiddle(member.accountId?.toString())}
        </Col>
        <Col xs={2} className="text-start text-truncate">

        </Col>
        <Col xs={7} className="text-end">
          {member.isFounder ? <Badge pill bg="primary" className="me-2">Founder</Badge> : <></>}
          {member.isHead ? <Badge pill bg="primary" className="me-2">Head</Badge> : <></>}
          {member.isDefenderVoter ? <Badge pill bg="primary" className="me-2">Defender</Badge> : <></>}
          {member.hasStrikes ? <Badge pill bg="danger" className="me-2">{member.strikesCount} Strikes</Badge> : <></>}
          {member.isSkeptic ? <Badge pill bg="danger" className="me-2">Skeptic</Badge> : <></>}
        </Col>
      </DataRow>
    ))}
  </>
)

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
    : <MembersList members={buildSocietyMember(members, info, maxStrikes)} />

  return (content)
}

export { MembersPage }
