import Identicon from '@polkadot/react-identicon'
import { AccountId } from '@polkadot/types/interfaces'
import { Col, Badge } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { truncateMiddle } from '../../../../helpers/truncate'

type SuspendedListProps = {
  members: AccountId[]
}

const SuspendedList = ({ members }: SuspendedListProps): JSX.Element => {
  if (members.length === 0) return <>No suspended members</>

  return (
    <>
      <DataHeaderRow>
        <Col xs={1} className="text-center">
          #
        </Col>
        <Col xs={3} className="text-start">
          Wallet Hash
        </Col>
        <Col xs={8} className="text-start"></Col>
      </DataHeaderRow>
      {members.map((accountId: AccountId) => (
        <DataRow key={accountId.toString()}>
          <Col xs={1} className="text-center">
            <Identicon value={accountId.toHuman()} size={32} theme="polkadot" />
          </Col>
          <Col xs={3} className="text-start text-truncate">
            {truncateMiddle(accountId.toString())}
          </Col>
          <Col xs={8} className="text-end">
            <Badge pill bg="danger" className="me-2 p-2">
              Suspended Member
            </Badge>
          </Col>
        </DataRow>
      ))}
    </>
  )
}

export { SuspendedList }
