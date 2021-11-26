import Identicon from '@polkadot/react-identicon'
import { Badge, Col } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../components/base'

const MembersList = ({ members }: { members: SocietyMember[] }): JSX.Element => {
  return (<>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={3} className="text-start">Wallet Hash</Col>
      <Col xs={8} className="text-end"></Col>
    </DataHeaderRow>
    {members.map((member: SocietyMember) => (
      <DataRow key={member.accountId.toString()}>
        <Col xs={1} className="text-center">
          <Identicon value={member.accountId} size={32} theme={'polkadot'} />
        </Col>
        <Col xs={3} className="text-start text-truncate">
          {member.accountId?.toString()}
        </Col>
        <Col xs={8} className="text-end">
          {member.isFounder
            ? <Badge bg="secondary" text="dark" className="me-2">society founder</Badge>
            : <></>
          }
          {member.isHead
            ? <Badge bg="primary" className="me-2">society head</Badge>
            : <></>
          }
          {member.isSkeptic
            ? <Badge bg="danger" className="me-2">round skeptic</Badge>
            : <></>
          }
        </Col>
      </DataRow>
    ))}
  </>)
}

export { MembersList }
