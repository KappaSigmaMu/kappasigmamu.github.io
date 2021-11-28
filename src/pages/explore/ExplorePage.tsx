import { DeriveSociety, DeriveSocietyMember } from '@polkadot/api-derive/types'
import { BN } from '@polkadot/util'
import { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Route, Routes } from 'react-router-dom'
import { useConsts } from '../../hooks/useConsts'
import { useKusama } from '../../kusama'
import { BiddersPage } from './BiddersPage'
import { CandidatesPage } from './CandidatesPage'
import { NavigationBar } from './components/NavigationBar'
import { MembersPage } from './MembersPage'

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
  }))

  return membersArray.sort(societyMembersArraySorter)
}

const ExplorePage = (): JSX.Element => {
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

  return (
    <Container>
      <Row>
        <Col>
          <NavigationBar />
        </Col>
      </Row>
      <Row>
        <Col>
          <Routes>
            <Route path="/" element={<>TODO EXPLORE PAGE</>}/>
            <Route path="/bidders" element={<BiddersPage />}/>
            <Route path="/members" element={
              <MembersPage
                api={api}
                members={societyMembersArrayBuilder(members, info, maxStrikes)}
              />
            }/>
            <Route path="/candidates" element={<CandidatesPage />}/>
            <Route path="/suspended" element={<>TODO SUSPENDED PAGE</>}/>
          </Routes>
        </Col>
      </Row>
    </Container>
  )
}

export { ExplorePage }
