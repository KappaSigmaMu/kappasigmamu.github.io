// import { ApiPromise } from '@polkadot/api'
// import { DeriveSocietyCandidate } from '@polkadot/api-derive/types'
// import { useEffect, useState } from 'react'
// import { useAccount } from '../../../account/AccountContext'
// import { LoadingSpinner } from '../components/LoadingSpinner'
// import { buildSocietyCandidatesArray } from '../helpers'
// import { CandidatesList } from './components/CandidatesList'

// type CandidatesPageProps = {
//   api: ApiPromise | null
// }

// const CandidatesPage = ({ api }: CandidatesPageProps): JSX.Element => {
//   const { activeAccount } = useAccount()
//   const society = api?.derive?.society
//   const [candidates, setCandidates] = useState<SocietyCandidate[] | null>(null)

//   useEffect(() => {
//     society?.candidates((responseCandidates: DeriveSocietyCandidate[]) => {
//       buildSocietyCandidatesArray(api!, responseCandidates)
//         .then(setCandidates)
//         .catch(console.error)
//     })
//   }, [society])

//   return (
//     candidates === null
//       ? <LoadingSpinner />
//       : <CandidatesList api={api!} activeAccount={activeAccount} candidates={candidates} />
//   )
// }

// export { CandidatesPage }
export {}