import { ksmAssetHub, ksmPeople } from '@polkadot-api/descriptors'
import { createClient, type PolkadotClient, type TypedApi } from 'polkadot-api'
import { getWsProvider, type StatusChange } from 'polkadot-api/ws'
import { endpointsFor, type ChainName } from './endpoints'

export type AssetHubApi = TypedApi<typeof ksmAssetHub>
export type PeopleApi = TypedApi<typeof ksmPeople>
export type ChainApi = AssetHubApi | PeopleApi
export type ChainClient = PolkadotClient

export type ClientWithProvider = {
  client: ChainClient
  endpoint: string | null
}

export function createChainClient(
  chain: ChainName,
  onStatusChanged: (status: StatusChange) => void
): ClientWithProvider {
  const endpoints = endpointsFor(chain)
  const provider = getWsProvider(endpoints, { onStatusChanged })
  return {
    client: createClient(provider),
    endpoint: endpoints[0] ?? null
  }
}

export function getTypedApi(chain: 'assetHub', client: ChainClient): AssetHubApi
export function getTypedApi(chain: 'people', client: ChainClient): PeopleApi
export function getTypedApi(chain: ChainName, client: ChainClient): ChainApi {
  return (chain === 'assetHub' ? client.getTypedApi(ksmAssetHub) : client.getTypedApi(ksmPeople)) as ChainApi
}
