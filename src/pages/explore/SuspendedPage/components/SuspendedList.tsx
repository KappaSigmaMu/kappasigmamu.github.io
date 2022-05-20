import Identicon from '@polkadot/react-identicon'
import { AccountId } from '@polkadot/types/interfaces'
import { arrayFlatten } from '@polkadot/util'
import { Col, Badge } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { truncateMiddle } from '../../../../helpers/truncate'

type SuspendedListProps = { 
  candidates: AccountId[]
  members: AccountId[] 
}

const SuspendedList = ({ candidates, members }: SuspendedListProps): JSX.Element => {
  const accountIds = arrayFlatten([members, candidates])

  if (accountIds.length === 0) return (
    <>No suspended members or candidates</>
  )
  
  return (<>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={3} className="text-start">Wallet Hash</Col>
      <Col xs={8} className="text-end"></Col>
    </DataHeaderRow>
    {accountIds.map((accountId: AccountId) => {
      const isMember = members.indexOf(accountId) >= 0
      return (
        <DataRow key={accountId.toString()}>
          <Col xs={1} className="text-center">
            <Identicon value={accountId} size={32} theme="polkadot" />
          </Col>
          <Col xs={3} className="text-start text-truncate">
            {truncateMiddle(accountId.toString())}
          </Col>
          <Col xs={8} className="text-end">
            <Badge pill bg={isMember ? "primary" : "dark"} className="me-2 p-2">
              {isMember ? <>Member</> : <>Candidate</>}
            </Badge>
          </Col>
        </DataRow>
      )
    })}
  </>)
}

export { SuspendedList }
