import type { StatusChange } from 'polkadot-api/ws'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { createChainClient, getTypedApi, type ChainApi, type ChainClient } from './client'
import { type ChainName } from './endpoints'
import { LoadingContainer } from '../components/LoadingContainer'

export enum ChainState {
  initializing,
  connecting,
  connected,
  disconnected,
  error,
  ready
}

export type ChainConnection = {
  api: ChainApi | null
  client: ChainClient | null
  state: ChainState
  error: Error | null
  activeProviderEndpoint: string | null
}

export type AssetHubConnection = Omit<ChainConnection, 'api'> & { api: import('./client').AssetHubApi | null }
export type PeopleConnection = Omit<ChainConnection, 'api'> & { api: import('./client').PeopleApi | null }

type ChainContextValue = Partial<Record<ChainName, ChainConnection>>

const ChainContext = React.createContext<ChainContextValue>({})

const initialConnection: ChainConnection = {
  api: null,
  client: null,
  state: ChainState.initializing,
  error: null,
  activeProviderEndpoint: null
}

const statusEndpoint = (status: StatusChange): string | null => ('uri' in status ? status.uri : null)

export function ChainProvider({
  chain,
  children,
  showLoading = false
}: {
  chain: ChainName
  children: React.ReactNode
  showLoading?: boolean
}) {
  const parentContext = useContext(ChainContext)
  const [connection, setConnection] = useState<ChainConnection>(initialConnection)

  useEffect(() => {
    let cancelled = false
    let client: ChainClient | null = null
    let statusVersion = 0

    const verifyConnection = (version: number) => {
      const currentClient = client
      if (!currentClient) return

      currentClient
        .getFinalizedBlock()
        .then(() => {
          if (!cancelled && version === statusVersion) {
            setConnection((previous) => ({ ...previous, state: ChainState.ready, error: null }))
          }
        })
        .catch((error: unknown) => {
          if (!cancelled && version === statusVersion) {
            setConnection((previous) => ({
              ...previous,
              state: ChainState.error,
              error: error instanceof Error ? error : new Error(String(error))
            }))
          }
        })
    }

    const updateStatus = (status: StatusChange) => {
      if (cancelled) return
      const version = ++statusVersion
      const endpoint = statusEndpoint(status)
      setConnection((previous) => ({
        ...previous,
        state:
          status.type === 'CONNECTED'
            ? ChainState.connected
            : status.type === 'CONNECTING'
            ? ChainState.connecting
            : status.type === 'CLOSE'
            ? ChainState.disconnected
            : ChainState.error,
        error: status.type === 'ERROR' ? new Error(String(status.event)) : null,
        activeProviderEndpoint: endpoint ?? previous.activeProviderEndpoint
      }))

      if (status.type === 'CONNECTED') verifyConnection(version)
    }

    setConnection({ ...initialConnection, state: ChainState.connecting })
    const created = createChainClient(chain, updateStatus)
    client = created.client
    const api = chain === 'assetHub' ? getTypedApi('assetHub', client) : getTypedApi('people', client)
    setConnection({
      api,
      client,
      state: ChainState.connecting,
      error: null,
      activeProviderEndpoint: created.endpoint
    })
    verifyConnection(statusVersion)

    return () => {
      cancelled = true
      client?.destroy()
    }
  }, [chain])

  const context = useMemo(() => ({ ...parentContext, [chain]: connection }), [parentContext, chain, connection])

  return (
    <ChainContext.Provider value={context}>
      {showLoading && <LoadingContainer state={connection} />}
      {children}
    </ChainContext.Provider>
  )
}

export function useChain(chain: ChainName): ChainConnection {
  return useContext(ChainContext)[chain] ?? initialConnection
}

export const useAssetHub = (): AssetHubConnection => useChain('assetHub') as AssetHubConnection
export const usePeople = (): PeopleConnection => useChain('people') as PeopleConnection
