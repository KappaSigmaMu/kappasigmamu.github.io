import Identicon from '@polkadot/react-identicon'
import { AccountId } from '@polkadot/types/interfaces'
import { Col, Badge } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { FormatBalance } from '../../../../components/FormatBalance'
import { truncate, truncateMiddle } from '../../../../helpers/truncate'

type SuspendedListProps = { 
  candidates: SuspendedCandidate[]
  members: AccountId[] 
}

const SuspendedList = ({ candidates, members }: SuspendedListProps): JSX.Element => {
  if (candidates.length === 0 && members.length === 0) return (
    <>No suspended members or candidates</>
  )
  
  return (<>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={3} className="text-start">Wallet Hash</Col>
      <Col xs={8} className="text-start">Bid Kind</Col>
    </DataHeaderRow>
    {members.map((accountId: AccountId) => (
      <DataRow key={accountId.toString()}>
        <Col xs={1} className="text-center">
          <Identicon value={accountId} size={32} theme="polkadot" />
        </Col>
        <Col xs={3} className="text-start text-truncate">
          {truncateMiddle(accountId.toString())}
        </Col>
        <Col xs={8} className="text-end">
          <Badge pill bg="primary" className="me-2 p-2">
            Member
          </Badge>
        </Col>
      </DataRow>
    ))}
    {candidates.map((candidate: SuspendedCandidate) => (
      <DataRow key={candidate.accountId.toString()}>
      <Col xs={1} className="text-center">
        <Identicon value={candidate.accountId} size={32} theme="polkadot" />
      </Col>
      <Col xs={3} className="text-start text-truncate">
        {truncateMiddle(candidate.accountId.toString())}
      </Col>
      <Col xs={1}>
        {candidate.bid.isDeposit ? <>Deposit</> : <>Vouch</>}
      </Col>
      <Col xs={4}>
        {candidate.bid.isDeposit 
          ? <FormatBalance balance={candidate.balance} /> 
          : (<>
              Member: {truncate(candidate.bid.asVouch[0].toHuman(), 7)} |
              Tip: {<FormatBalance balance={candidate.bid.asVouch[1]}></FormatBalance>}
             </>)}
      </Col>
      <Col xs={3} className="text-end">
        <Badge pill bg="dark" className="me-2 p-2">
          Candidate
        </Badge>
      </Col>
    </DataRow>
    ))}
  </>)
}

export { SuspendedList }
