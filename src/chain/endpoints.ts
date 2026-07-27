import { getPeopleProviderEndpoints } from '../helpers/peopleProviders'
import { getProviderEndpoints } from '../helpers/providers'

export type ChainName = 'assetHub' | 'people'

const getQueryParam = (name: string): string | null => {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(name)
}

export const assetHubEndpoints = (): string[] =>
  getProviderEndpoints(getQueryParam('rpc'), process.env.REACT_APP_PROVIDER_SOCKET)

export const peopleEndpoints = (): string[] =>
  getPeopleProviderEndpoints(getQueryParam('peopleRpc'), process.env.REACT_APP_PEOPLE_PROVIDER_SOCKET)

export const endpointsFor = (chain: ChainName): string[] =>
  chain === 'assetHub' ? assetHubEndpoints() : peopleEndpoints()
