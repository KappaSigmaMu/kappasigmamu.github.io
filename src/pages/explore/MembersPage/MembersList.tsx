import Identicon from '@polkadot/react-identicon'
import { Badge, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { truncateMiddle } from '../../../helpers/truncate'

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => props.isDefender ? '#73003d' : ''};
  border: ${(props) => props.isDefender ? '2px solid #E6007A' : ''};

`

const MembersList = ({ members }: { members: SocietyMember[] }): JSX.Element => {
  return (<>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={3} className="text-start">Wallet Hash</Col>
      <Col xs={8} className="text-end"></Col>
    </DataHeaderRow>
    {members.map((member: SocietyMember) => (
      <StyledDataRow key={member.accountId.toString()} isDefender={member.isDefender}>
        <Col xs={1} className="text-center">
          <Identicon value={member.accountId} size={32} theme={'polkadot'} />
        </Col>
        <Col xs={3} className="text-start text-truncate">
          {truncateMiddle(member.accountId?.toString())}
        </Col>
        <Col xs={8} className="text-end">
          {member.isDefender
            && <Badge pill bg="primary" className="me-2 p-2">Defender</Badge>}
          {member.isFounder
            && <Badge pill bg="dark" className="me-2 p-2">Founder</Badge>}
          {member.isHead
            && <Badge pill bg="dark" className="me-2 p-2">Society Head</Badge>}
          {member.isSkeptic
            && <Badge pill bg="danger" className="me-2 p-2">Round Skeptic</Badge>}
        </Col>
      </StyledDataRow>
    ))}
  </>)
}

export { MembersList }
