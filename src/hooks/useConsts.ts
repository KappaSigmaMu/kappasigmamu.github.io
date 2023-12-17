// @ts-nocheck
// Copied from: https://github.com/polkadot-js/apps/blob/master/packages/react-hooks/src/useBlockTime.ts

import type { BalanceOf, BlockNumber, u32, PalletId } from '@polkadot/api'
import { useMemo } from 'react'
import { useKusama } from '../kusama'

type SocietyConsts = {
  candidateDeposit: BalanceOf
  challengePeriod: BlockNumber
  maxCandidateIntake: u32
  graceStrikes: u32
  palletId: PalletId
  periodSpend: BalanceOf
  rotationPeriod: BlockNumber
  wrongSideDeduction: BalanceOf
}

export function useConsts(): SocietyConsts {
  const { api } = useKusama()

  return useMemo((): SocietyConsts => {
    const candidateDeposit: BalanceOf = api.consts.society.candidateDeposit
    const challengePeriod: BlockNumber = api.consts.society.challengePeriod
    const maxCandidateIntake: u32 = api.consts.society.maxCandidateIntake
    const graceStrikes: u32 = api.consts.society.graceStrikes
    const palletId: PalletId = api.consts.society.palletId
    const periodSpend: BalanceOf = api.consts.society.periodSpend
    const rotationPeriod: BlockNumber = api.consts.society.rotationPeriod
    const wrongSideDeduction: BalanceOf = api.consts.society.wrongSideDeduction

    return {
      candidateDeposit,
      challengePeriod,
      maxCandidateIntake,
      graceStrikes,
      palletId,
      periodSpend,
      rotationPeriod,
      wrongSideDeduction
    }
  })
}
