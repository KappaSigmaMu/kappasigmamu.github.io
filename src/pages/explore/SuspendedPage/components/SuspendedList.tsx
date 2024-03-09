import { AccountId } from '@polkadot/types/interfaces'
import { Col, Badge } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { Identicon } from '../../components/Identicon'
import { styled } from 'styled-components'

type SuspendedListProps = {
  members: AccountId[]
}

const SuspendedList = ({ members }: SuspendedListProps): JSX.Element => {
  if (members.length === 0) return <>No suspended members</>

  return (
    <>
      <DataHeaderRow className="d-none d-lg-flex text-center">
        <Col lg={1} className="text-center">
          #
        </Col>
        <Col lg={7} className="text-center text-lg-start">
          Wallet Hash
        </Col>
        <Col lg={4} className="text-center text-lg-start"></Col>
      </DataHeaderRow>

      {members.map((accountId: AccountId) => (
        <StyledDataRow key={accountId.toString()}>
          <Col lg={1} className="text-center">
            <Identicon value={accountId.toHuman()} size={32} theme="polkadot" />
          </Col>
          <Col lg={7} className="text-center text-lg-start text-truncate">
            {accountId.toString()}
          </Col>
          <Col lg={4} className="text-center text-lg-end">
            <Badge pill bg="danger" className="me-2 p-2">
              Suspended Member
            </Badge>
          </Col>
        </StyledDataRow>
      ))}
    </>
  )
}

const StyledDataRow = styled(DataRow)`
  @media (max-width: 992px) {
    padding-block: 12px;
    margin-inline: 2px;
  }
`

export { SuspendedList }
