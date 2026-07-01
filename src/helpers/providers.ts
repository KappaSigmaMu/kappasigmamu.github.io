export type Provider = { name: string; url: string; dev: boolean }

export const productionProviders: Provider[] = [
  { name: 'Parity', url: 'wss://kusama-asset-hub-rpc.polkadot.io', dev: false },
  { name: 'Dwellir', url: 'wss://asset-hub-kusama-rpc.n.dwellir.com', dev: false },
  { name: 'Dotters', url: 'wss://asset-hub-kusama.dotters.network', dev: false },
  { name: 'LuckyFriday', url: 'wss://rpc-asset-hub-kusama.luckyfriday.io', dev: false },
  { name: 'OnFinality', url: 'wss://assethub-kusama.api.onfinality.io/public-ws', dev: false },
  { name: 'IBP (legacy)', url: 'wss://sys.ibp.network/asset-hub-kusama', dev: false }
]

const developmentProviders: Provider[] = [
  { name: 'Local', url: 'ws://127.0.0.1:9444', dev: true },
  { name: 'Chopsticks', url: 'ws://127.0.0.1:8000', dev: true }
]

export const providers = [...productionProviders, ...developmentProviders]

export function getProviderEndpoints(
  override?: string | null,
  configured?: string,
  fallback: Provider[] = productionProviders
): string[] {
  if (override) return [override]

  const configuredEndpoints = configured
    ?.split(',')
    .map((endpoint) => endpoint.trim())
    .filter(Boolean)

  return configuredEndpoints?.length ? configuredEndpoints : fallback.map(({ url }) => url)
}
