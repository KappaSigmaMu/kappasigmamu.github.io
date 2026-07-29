import { useAssetHub } from '../ChainProvider'
import { useChainQuery } from '../hooks'
import { useSociety } from './SocietyContext'

export type SocietyConsts = {
  candidateDeposit: bigint
  challengePeriod: number
  maxCandidateIntake: number
  graceStrikes: number
  palletId: string
  periodSpend: bigint
  rotationPeriod: number
  votingPeriod: number
  claimPeriod: number
  wrongSideDeduction: bigint
}

const DEFAULT_CONSTS: SocietyConsts = {
  candidateDeposit: 0n,
  challengePeriod: 0,
  maxCandidateIntake: 0,
  graceStrikes: 0,
  palletId: '',
  periodSpend: 0n,
  rotationPeriod: 0,
  votingPeriod: 0,
  claimPeriod: 0,
  wrongSideDeduction: 0n
}

export function useSocietyConsts() {
  const { api } = useAssetHub()
  const { info } = useSociety()
  const state = useChainQuery(
    () =>
      api
        ? Promise.all([
            api.constants.Society.PalletId(),
            api.constants.Society.GraceStrikes(),
            api.constants.Society.PeriodSpend(),
            api.constants.Society.VotingPeriod(),
            api.constants.Society.ClaimPeriod(),
            api.constants.Society.ChallengePeriod()
          ]).then(([palletId, graceStrikes, periodSpend, votingPeriod, claimPeriod, challengePeriod]) => ({
            palletId,
            graceStrikes,
            periodSpend,
            votingPeriod,
            claimPeriod,
            rotationPeriod: votingPeriod + claimPeriod,
            challengePeriod,
            maxCandidateIntake: info.data?.parameters?.max_intake ?? 0,
            candidateDeposit: info.data?.parameters?.candidate_deposit ?? 0n,
            wrongSideDeduction: 0n
          }))
        : undefined,
    [api, info.data?.parameters]
  )

  return {
    ...state,
    error: state.error ?? info.error,
    isLoading: state.isLoading || info.isLoading,
    refetch: () => {
      state.refetch()
      info.refetch()
    },
    ...(state.data ?? DEFAULT_CONSTS)
  }
}
