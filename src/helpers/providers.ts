export type Provider = { name: string; url: string; dev: boolean }

export const providers = [
  { name: 'Dwellir', url: 'wss://asset-hub-kusama-rpc.n.dwellir.com', dev: false },
  { name: 'Dwellir Tunisia', url: 'wss://statemine-rpc-tn.dwellir.com', dev: false },
  { name: 'IBP1', url: 'wss://sys.ibp.network/asset-hub-kusama', dev: false },
  { name: 'IBP2', url: 'wss://asset-hub-kusama.dotters.network', dev: false },
  { name: 'LuckyFriday', url: 'wss://rpc-asset-hub-kusama.luckyfriday.io', dev: false },
  { name: 'OnFinality', url: 'wss://assethub-kusama.api.onfinality.io/public-ws', dev: false },
  { name: 'Parity', url: 'wss://kusama-asset-hub-rpc.polkadot.io', dev: false },
  { name: 'RadiumBlock', url: 'wss://statemine.public.curie.radiumblock.co/ws', dev: false },
  { name: 'Stakeworld', url: 'wss://ksm-rpc.stakeworld.io/assethub', dev: false },
  { name: 'Local', url: 'ws://127.0.0.1:9444', dev: true },
  { name: 'Chopsticks', url: 'ws://127.0.0.1:8000', dev: true }
]
