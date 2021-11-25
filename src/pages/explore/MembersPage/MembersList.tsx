import Identicon from '@polkadot/react-identicon'
import { Badge, Col } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { truncateMiddle } from '../../../helpers/truncate'
import { PayoutsAccordion } from './components/PayoutsAccordion'

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

export { MembersList }
