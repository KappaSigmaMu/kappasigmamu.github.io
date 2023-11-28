// import { ApiPromise } from '@polkadot/api'
// import Identicon from '@polkadot/react-identicon'
// import type { Option } from '@polkadot/types'
// import type { SocietyVote, AccountId } from '@polkadot/types/interfaces'
// import { useEffect, useRef, useState } from 'react'
// import { Button, Col } from 'react-bootstrap'
// import { DataHeaderRow, DataRow } from '../../../../components/base'
// import { FormatBalance } from '../../../../components/FormatBalance'
// import { truncate, truncateMiddle } from '../../../../helpers/truncate'
// import ApproveIcon from '../../../../static/approve-icon.svg'
// import CheckAllIcon from '../../../../static/check-all-icon.svg'
// import RejectIcon from '../../../../static/reject-icon.svg'
// import { StyledAlert } from '../../components/StyledAlert'
// import { CandidateDetailsOffcanvas } from './CandidateDetailsOffcanvas'
// import { VoteButton } from './VoteButton'

// type CandidatesListProps = {
//   api: ApiPromise,
//   activeAccount: accountType,
//   candidates: SocietyCandidate[]
// }

// type VoteResult = {
//   success: boolean
//   message: string
// }

// const AlreadyVotedIcon = () => (
//  <>
//     <img src={CheckAllIcon} className="me-2" />
//     <label style={{ color: '#6c757d' }}>Voted</label>
//   </>     
// )

// const CandidatesList = ({ api, activeAccount, candidates }: CandidatesListProps): JSX.Element => {
//   const [showAlert, setShowAlert] = useState(false)
//   const [votes, setVotes] = useState<SocietyCandidate[]>([])
//   const [voteResult, setVoteResult] = useState<VoteResult>({ success: false, message: '' })
//   const society = api?.query?.society
  
//   const [selectedCandidate, setSelectedCandidate] = useState<AccountId | null>(null)
//   const [showCandidateDetailsOffcanvas, setShowCandidateDetailsOffcanvas] = useState(false)
//   const showMessage = (result: VoteResult) => {
//     setVoteResult(result)
//     setShowAlert(true)
//   }

//   const usePrevious = (value: any) => {
//     const ref = useRef()
//     useEffect(() => {
//       ref.current = value
//     })
//     return ref.current
//   }

//   const prevActiveAccount = usePrevious(activeAccount)

//   useEffect(() => {
//     if (candidates.length === 0) return

//     candidates.forEach((candidate) => {
//       society.votes(candidate.accountId, activeAccount.address, (vote: Option<SocietyVote>) => {
//         if (vote.isEmpty) {
//           if (prevActiveAccount != activeAccount) setVotes([])
//           return
//         }
        
//         setVotes([candidate.accountId, ...votes])
//       })
//     })
//   }, [activeAccount, prevActiveAccount])

//   const showCandidateDetails = (candidateId: AccountId) => {
//     setSelectedCandidate(candidateId)
//     setShowCandidateDetailsOffcanvas(true)
//   }

//   if (candidates.length === 0) return (
//     <>No candidates</>
//   )

//   return (<>
//     {selectedCandidate &&
//       <CandidateDetailsOffcanvas
//         api={api}
//         candidateId={selectedCandidate}
//         show={showCandidateDetailsOffcanvas}
//         onClose={() => setShowCandidateDetailsOffcanvas(false)} />}

//     <StyledAlert
//       success={voteResult.success}
//       onClose={() => setShowAlert(false)}
//       show={showAlert}
//       dismissible>
//       {voteResult.message}
//     </StyledAlert>

//     <DataHeaderRow>
//       <Col xs={1} className="text-center">#</Col>
//       <Col xs={3} className="text-start">Wallet Hash</Col>
//       <Col className="text-start">Bid Kind</Col>
//       <Col></Col>
//       <Col></Col>
//     </DataHeaderRow>

//     {candidates.map((candidate: SocietyCandidate) => (
//       <DataRow key={candidate.accountId.toString()}>
//         <Col xs={1} className="text-center">
//           <Identicon value={candidate.accountId} size={32} theme={'polkadot'} />
//         </Col>
//         <Col xs={3} className="text-start text-truncate">
//           {truncateMiddle(candidate.accountId?.toString())}
//         </Col>
//         <Col xs={1}>
//           {candidate.kind.isDeposit ? 'Deposit' : 'Vouch'}
//         </Col>
//         <Col xs={2} className="text-start">
//           {candidate.kind.isDeposit
//             ? <FormatBalance balance={candidate.value} />
//             : (<>
//               Member: {truncate(candidate.kind.asVouch[0].toHuman(), 7)} |
//               Tip: {<FormatBalance balance={candidate.kind.asVouch[1]}></FormatBalance>}
//             </>)}
//         </Col>
//         <Col xs={2} onClick={() => showCandidateDetails(candidate.accountId)}>
//           <Button variant="link">Votes</Button>
//         </Col>
//         <Col xs={3}>
//           {votes.includes(candidate.accountId)
//             ? <AlreadyVotedIcon />
//             : <>
//                 <VoteButton
//                   api={api}
//                   showMessage={showMessage}
//                   successText="Approval vote sent."
//                   waitingText="Approval vote request sent. Waiting for response..."
//                   vote={{ approve: true, voterAccount: activeAccount, candidateId: candidate.accountId }}
//                   icon={ApproveIcon}>
//                   <u>Approve</u>
//                 </VoteButton>
//                 <VoteButton
//                   api={api}
//                   showMessage={showMessage}
//                   successText="Rejection vote sent."
//                   waitingText="Rejection vote request sent. Waiting for response..."
//                   vote={{ approve: false, voterAccount: activeAccount, candidateId: candidate.accountId }}
//                   icon={RejectIcon}>
//                   <u>Reject</u>
//                 </VoteButton>
//               </>
//           }
//         </Col>
//       </DataRow>))}
//   </>)
// }

// export { CandidatesList }
export {}