import { ApiPromise } from '@polkadot/api'
import { useBlockTime } from '../../../hooks/useBlockTime'

// const isVotingPeriod = (
//   votingPeriod: number,
//   claimPeriod: number,
//   currentBlock: number
// ) => {
//   const rotationPeriod = votingPeriod + claimPeriod
//   const phase = currentBlock % rotationPeriod

//   if (phase < votingPeriod) {
//     return {
//       type: "Voting",
//       elapsed: phase,
//       more: votingPeriod - phase,
//     }
//   } else {
//     return {
//       type: "Claim",
//       elapsed: phase - votingPeriod,
//       more: rotationPeriod - phase,
//     }
//   }
// }

export function calculateVotingPercentage(
  currentBlock: number,
  votingPeriod: number,
  claimPeriod: number,
  api: ApiPromise | null | undefined
) {
  const periodBlocksDone = currentBlock % (votingPeriod + claimPeriod)
  const periodBlocksLeft = votingPeriod - periodBlocksDone
  const percentageDone = 100 - (periodBlocksLeft * 100) / votingPeriod
  const [, , time] = useBlockTime(periodBlocksLeft, api)

  return { percentageDone, time }
}

export function calculateChallengePercentage(
  currentBlock: number,
  period: number,
  api: ApiPromise | null | undefined
) {
  const periodBlocksDone = currentBlock % period
  const periodBlocksLeft = period - periodBlocksDone
  const percentageDone = 100 - (periodBlocksLeft * 100) / period
  const [, , time] = useBlockTime(periodBlocksLeft, api)

  return { percentageDone, time }
}

export function isVotingPeriod(
  votingPeriod: number,
  claimPeriod: number,
  currentBlock: number
) {
  const rotationPeriod = votingPeriod + claimPeriod
  const phase = currentBlock % rotationPeriod

  return phase < votingPeriod
}
