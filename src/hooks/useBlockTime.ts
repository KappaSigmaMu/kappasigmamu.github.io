// @ts-nocheck
// Copied from: https://github.com/polkadot-js/apps/blob/master/packages/react-hooks/src/useBlockTime.ts

import type { ApiPromise } from '@polkadot/api'
import { BN, BN_ONE, BN_THOUSAND, BN_TWO, bnToBn, extractTime } from '@polkadot/util'
import type { Time } from '@polkadot/util/types'
import { useMemo } from 'react'
import { useKusama } from '../kusama'

type Result = [number, string, Time]

const DEFAULT_TIME = new BN(6_000)

const THRESHOLD = BN_THOUSAND

export function useBlockTime(blocks: number | BN = BN_ONE, apiOverride?: ApiPromise | null): Result {
  const { api } = useKusama()

  return useMemo((): Result => {
    const a = apiOverride || api
    const blockTime =
      a.consts.babe?.expectedBlockTime ||
      a.consts.difficulty?.targetBlockTime ||
      (a.consts.timestamp?.minimumPeriod.gte(THRESHOLD)
        ? a.consts.timestamp.minimumPeriod.mul(BN_TWO)
        : a.query.parachainSystem
        ? DEFAULT_TIME.mul(BN_TWO)
        : DEFAULT_TIME)
    const value = blockTime.mul(bnToBn(blocks)).toNumber()
    const time = extractTime(Math.abs(value))
    const { days, hours, minutes, seconds } = time
    const timeStr = [
      days ? (days > 1 ? `${days} days` : '1 day') : null,
      hours ? (hours > 1 ? `${hours} hrs` : '1 hr') : null,
      minutes ? (minutes > 1 ? `${minutes} mins` : '1 min') : null,
      seconds ? (seconds > 1 ? `${seconds} s` : '1 s') : null
    ]
      .filter((s): s is string => !!s)
      .slice(0, 2)
      .join(' ')

    return [blockTime.toNumber(), `${value < 0 ? '+' : ''}${timeStr}`, time]
  }, [api, apiOverride, blocks])
}
