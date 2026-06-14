import type { ApiPromise } from '@polkadot/api'
import type { Codec } from '@polkadot/types/types'
import { useEffect, useState } from 'react'

type RelayBlockSubscription = (callback: (value: Codec) => void) => Promise<() => void>

export function useRelayChainBlockNumber(api: ApiPromise | null): number | null {
  const [relayBlockNumber, setRelayBlockNumber] = useState<number | null>(null)

  useEffect(() => {
    if (!api) return

    let cancelled = false
    let unsubscribe: (() => void) | undefined

    const subscribe = async () => {
      const lastRelayChainBlockNumber = api.query.parachainSystem?.lastRelayChainBlockNumber as
        | RelayBlockSubscription
        | undefined

      const unsub = lastRelayChainBlockNumber
        ? await lastRelayChainBlockNumber((value) => {
            setRelayBlockNumber(Number(value.toString()))
          })
        : await api.rpc.chain.subscribeNewHeads((header) => {
            setRelayBlockNumber(header.number.toNumber())
          })

      if (cancelled) unsub()
      else unsubscribe = unsub
    }

    subscribe()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [api])

  return relayBlockNumber
}
