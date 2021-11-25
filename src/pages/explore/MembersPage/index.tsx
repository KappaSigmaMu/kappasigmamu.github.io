import { DeriveSociety, DeriveSocietyMember } from '@polkadot/api-derive/types'
import Identicon from '@polkadot/react-identicon'
import type { AccountId, Balance, BlockNumber, StrikeCount } from '@polkadot/types/interfaces'
import { BN, formatNumber } from '@polkadot/util'
import { useEffect, useState } from 'react'
import { Accordion, Badge, Card, Col, Spinner, useAccordionButton } from 'react-bootstrap'
import styled from 'styled-components'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { truncateMiddle } from '../../../helpers/truncate'
import { useBlockTime } from '../../../hooks/useBlockTime'
import { useConsts } from '../../../hooks/useConsts'
import { useKusama } from '../../../kusama'
import { FormatBalance } from './FormatBalance'

export interface SocietyMember {
  accountId: AccountId
  hasPayouts: boolean
  hasStrikes: boolean
  isDefenderVoter: boolean
  isFounder: boolean
  isHead: boolean
  isSkeptic: boolean
  isSuspended: boolean
  isWarned: boolean
  payouts: [BlockNumber, Balance][]
  strikes: StrikeCount
  strikesCount: number
}

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

const BlockTime = ({ block }: { block: BlockNumber }) => {
  const { api } = useKusama()
  const [, time] = useBlockTime(block, api)

  return (<>
    <span>{time}</span>
    &nbsp;
    <span>(#{formatNumber(block)})</span>
  </>)
}

const StyledAccordion = styled(Accordion)`

`

const PayoutsAccordionToggle = ({ children, eventKey }: { children: any, eventKey: any }) => (
  <a href="javascript:void(0)" onClick={useAccordionButton(eventKey)} >
    {children}
  </a>
)

const PayoutsAccordion = ({ payouts }: { payouts: [BlockNumber, Balance][] }) => (
  <StyledAccordion>
    <PayoutsAccordionToggle eventKey="0">{payouts.length} payouts</PayoutsAccordionToggle>
    <Accordion.Collapse eventKey="0">
      <Card.Body>
        {payouts.map((payout: [BlockNumber, Balance], index: number) => {
          const [block, balance] = payout
          return(
            <div key={index}>
              <p className="mb-0">
                <FormatBalance balance={balance} />
              </p>
              <p className="mb-0">
                <BlockTime block={block} />
              </p>
            </div>
          )
        })}
      </Card.Body>
    </Accordion.Collapse>
  </StyledAccordion>
)

const MembersList = ({ members }: { members: SocietyMember[] }): JSX.Element => {
  return (<>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={2} className="text-start">Wallet Hash</Col>
      <Col xs={3} className="text-start">Payouts</Col>
      <Col xs={6} className="text-end"></Col>
    </DataHeaderRow>
    {members.map((member: SocietyMember) => (
      <DataRow key={member.accountId.toString()}>
        <Col xs={1} className="text-center">
          <Identicon value={member.accountId} size={32} theme={'polkadot'} />
        </Col>
        <Col xs={2} className="text-start text-truncate">
          {truncateMiddle(member.accountId?.toString())}
        </Col>
        <Col xs={3} className="text-start">
          {member.hasPayouts ? <PayoutsAccordion payouts={member.payouts} /> : <></>}
        </Col>
        <Col xs={6} className="text-end">
          {member.isFounder ? <Badge pill bg="primary" className="me-2">Founder</Badge> : <></>}
          {member.isHead ? <Badge pill bg="primary" className="me-2">Head</Badge> : <></>}
          {member.isDefenderVoter ? <Badge pill bg="primary" className="me-2">Defender</Badge> : <></>}
          {member.hasStrikes ? <Badge pill bg="danger" className="me-2">{member.strikesCount} Strikes</Badge> : <></>}
          {member.isSkeptic ? <Badge pill bg="danger" className="me-2">Skeptic</Badge> : <></>}
        </Col>
      </DataRow>
    ))}
  </>)
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
