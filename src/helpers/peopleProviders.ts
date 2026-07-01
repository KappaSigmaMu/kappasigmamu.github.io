import { getProviderEndpoints, type Provider } from './providers'

export const peopleProductionProviders: Provider[] = [
  { name: 'Parity', url: 'wss://kusama-people-rpc.polkadot.io', dev: false },
  { name: 'Dwellir', url: 'wss://api-people-kusama.n.dwellir.com', dev: false }
]

export const peopleProviders = [...peopleProductionProviders]

export function getPeopleProviderEndpoints(override?: string | null, configured?: string): string[] {
  return getProviderEndpoints(override, configured, peopleProductionProviders)
}
