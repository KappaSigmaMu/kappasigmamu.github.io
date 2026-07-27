import { useMemo } from 'react'
import { ASSET_HUB_BLOCK_TIME, extractTime, formatTime, RELAY_CHAIN_BLOCK_TIME, type TimeParts } from '../chain/format'

type Result = [number, string, TimeParts]

export function useBlockTime(
  blocks: number | bigint = 1,
  _apiOverride?: unknown,
  relayChain = false
): Result {
  return useMemo(() => {
    const blockTime = relayChain ? RELAY_CHAIN_BLOCK_TIME : ASSET_HUB_BLOCK_TIME
    const value = blockTime * Number(blocks)
    return [blockTime, `${value < 0 ? '+' : ''}${formatTime(value)}`, extractTime(Math.abs(value))]
  }, [blocks, relayChain])
}
