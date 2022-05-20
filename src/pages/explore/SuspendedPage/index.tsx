import { ApiPromise } from '@polkadot/api'
import { useCall } from '@polkadot/react-hooks'
import Identicon from '@polkadot/react-identicon'
import { Spinner, Col } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { truncateMiddle } from '../../../helpers/truncate'
import { optExtractAccounts, optExtractCandidates } from './helpers/data-extraction'

type SuspendedPageProps = {
  api: ApiPromise | null,
  members: SocietyMember[],
  candidates: SocietyCandidate[]
}

// TODO:
// Add @polkadot/react-hooks package
// Copy code from polkadot apps
// Refactor calls to use useCall and useApi --> separate card/PR?
const SuspendedPage = ({ api }: SuspendedPageProps): JSX.Element => {
  const loading = !api?.query?.society

  if (loading) return (
    <Spinner animation="border" variant="primary" />
  )

  const society = api!.query.society

  const candidates = useCall<SocietyCandidateSuspend[]>(
    society!.suspendedCandidates!.entries!, 
    undefined, 
    optExtractCandidates
  )
  const members = useCall<AccountId[]>(society.suspendedMembers.keys, undefined, optExtractAccounts)
  
  return (<>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={3} className="text-start">Wallet Hash</Col>
      <Col xs={8} className="text-end"></Col>
    </DataHeaderRow>
    {members?.forEach((member: SocietyMember) => (
      <DataRow key={member.accountId.toString()}>
        <Col xs={1} className="text-center">
          <Identicon value={member.accountId} size={32} theme="polkadot" />
        </Col>
        <Col xs={3} className="text-start text-truncate">
          {truncateMiddle(member.accountId?.toString())}
        </Col>
        <Col xs={8} className="text-end">
        </Col>
      </DataRow>
    ))}
    {candidates.forEach((candidate: SocietyCandidateSuspend) => (
      <DataRow key={candidate.accountId.toString()}>
        <Col xs={1} className="text-center">
          <Identicon value={candidate.accountId} size={32} theme="polkadot" />
        </Col>
        <Col xs={3} className="text-start text-truncate">
          {truncateMiddle(candidate.accountId?.toString())}
        </Col>
        <Col xs={8} className="text-end">
        </Col>
      </DataRow>
    ))}
  </>)
}

export { SuspendedPage }
