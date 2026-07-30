import { useAssetHub } from '@/chain/ChainProvider'
import { useChainSub } from '@/chain/hooks'

export function useRelayChainBlockNumber(_apiOverride?: unknown): number | null {
  const { api } = useAssetHub()
  const state = useChainSub(
    () => api?.query.ParachainSystem.LastRelayChainBlockNumber.watchValue({ at: 'best' }),
    [api]
  )

  return state.data?.value ?? null
}
