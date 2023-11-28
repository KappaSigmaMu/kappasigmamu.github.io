// import { ApiPromise } from '@polkadot/api'
// import { AccountId } from '@polkadot/types/interfaces'
// import { useEffect, useState } from 'react'
// import { LoadingSpinner } from '../components/LoadingSpinner'
// import { SuspendedList } from './components/SuspendedList'
// // import { extractAccountIds, extractCandidates } from './helpers/data-extraction'

// type SuspendedPageProps = {
//   api: ApiPromise | null
// }

// const SuspendedPage = ({ api }: SuspendedPageProps): JSX.Element => {
//   const society = api?.query?.society

//   const [candidates, setCandidates] = useState<SuspendedCandidate[] | null>(null)
//   const [members, setMembers] = useState<AccountId[] | null>(null)

//   useEffect(() => {
//     society?.suspendedMembers.keys()
//       .then(extractAccountIds)
//       .then(setMembers)
    
//     // society?.suspendedCandidates.entries()
//     //   .then(extractCandidates)
//     //   .then(setCandidates)
//   }, [society])

//   return (
//     candidates === null || members === null
//     ? <LoadingSpinner />
//     : <SuspendedList members={members!} candidates={candidates!} />
//   )
// }

// export { SuspendedPage }
export {}