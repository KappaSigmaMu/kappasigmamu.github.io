import type { ApiPromise } from '@polkadot/api'
import Identicon from '@polkadot/react-identicon'
import { Badge, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { AccountIdentity } from '../../../../components/AccountIdentity'
import { AccountIndex } from '../../../../components/AccountIndex'
import { DataHeaderRow, DataRow } from '../../../../components/base'

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => (props.$isDefender ? '#73003d' : '')};
  border: ${(props) => (props.$isDefender ? '2px solid #E6007A' : '')};
  &:hover {
    cursor: pointer;
  }
`

type MembersListProps = {
  api: ApiPromise
  members: SocietyMember[]
  onClickMember: (member: SocietyMember) => any
}

const MembersList = ({ members, api, onClickMember }: MembersListProps): JSX.Element => {
  // Likely impossible to happen but if it does, better to show a
  // clear message than an empty list which may look like a loading state
  if (members.length === 0) return <>No members</>

  return (
    <>
      <DataHeaderRow>
        <Col xs={1} className="text-center">
          #
        </Col>
        <Col xs={3} className="text-start">
          Wallet Hash
        </Col>
        <Col xs={3} className="text-start">
          Index
        </Col>
        <Col xs={5} className="text-end"></Col>
      </DataHeaderRow>
      {members.map((member: SocietyMember) => (
        <StyledDataRow
          key={member.accountId.toString()}
          $isDefender={member.isDefender}
          onClick={() => onClickMember(member)}
        >
          <Col xs={1} className="text-center">
            <Identicon value={member.accountId.toHuman()} size={32} theme={'polkadot'} />
          </Col>
          <Col xs={3} className="text-start text-truncate">
            <AccountIdentity api={api} accountId={member.accountId} />
          </Col>
          <Col xs={3} className="text-start text-truncate">
            <AccountIndex api={api} member={member} />
          </Col>
          <Col xs={5} className="text-end">
            {member.isDefender && (
              <Badge pill bg="primary" className="me-2 p-2">
                Defender
              </Badge>
            )}
            {member.isFounder && (
              <Badge pill bg="dark" className="me-2 p-2">
                Founder
              </Badge>
            )}
            {member.isHead && (
              <Badge pill bg="dark" className="me-2 p-2">
                Society Head
              </Badge>
            )}
            {member.isSkeptic && (
              <Badge pill bg="danger" className="me-2 p-2">
                Round Skeptic
              </Badge>
            )}
          </Col>
        </StyledDataRow>
      ))}
    </>
  )
}

export { MembersList }
