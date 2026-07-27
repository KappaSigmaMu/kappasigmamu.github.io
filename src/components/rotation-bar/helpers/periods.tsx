import { extractTime, RELAY_CHAIN_BLOCK_TIME, type TimeParts } from '../../../chain/format'

const timeForBlocks = (blocks: number): TimeParts => extractTime(Math.abs(RELAY_CHAIN_BLOCK_TIME * blocks))

export function calculateClaimPercentage(
  currentBlock: number,
  votingPeriod: number,
  claimPeriod: number,
  _api?: unknown
) {
  const intakePeriod = votingPeriod + claimPeriod

  const periodBlocksDone = (currentBlock % intakePeriod) - votingPeriod
  const periodBlocksLeft = claimPeriod - periodBlocksDone
  const percentageDone = 100 - (periodBlocksLeft * 100) / claimPeriod
  return { percentageDone, time: timeForBlocks(periodBlocksLeft) }
}

export function calculateVotingPercentage(
  currentBlock: number,
  votingPeriod: number,
  claimPeriod: number,
  _api?: unknown
) {
  const intakePeriod = votingPeriod + claimPeriod

  const periodBlocksDone = currentBlock % intakePeriod
  const periodBlocksLeft = votingPeriod - periodBlocksDone
  const percentageDone = 100 - (periodBlocksLeft * 100) / votingPeriod
  return { percentageDone, time: timeForBlocks(periodBlocksLeft) }
}

export function calculateChallengePercentage(currentBlock: number, period: number, _api?: unknown) {
  const periodBlocksDone = currentBlock % period
  const periodBlocksLeft = period - periodBlocksDone
  const percentageDone = 100 - (periodBlocksLeft * 100) / period
  return { percentageDone, time: timeForBlocks(periodBlocksLeft) }
}

export function isVotingPeriod(votingPeriod: number, claimPeriod: number, currentBlock: number) {
  const rotationPeriod = votingPeriod + claimPeriod
  const phase = currentBlock % rotationPeriod

  return phase < votingPeriod
}
