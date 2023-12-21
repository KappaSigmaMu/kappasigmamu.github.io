export type Provider = { name: string; url: string; dev: boolean }

export const providers = [
  { name: '1RPC', url: 'wss://1rpc.io/ksm', dev: false },
  { name: 'Blockops', url: 'wss://kusama-public-rpc.blockops.network/ws', dev: false },
  { name: 'Dwellir Tunisia', url: 'wss://kusama-rpc-tn.dwellir.com', dev: false },
  { name: 'Dwellir', url: 'wss://kusama-rpc.dwellir.com', dev: false },
  { name: 'Geometry', url: 'wss://kusama.geometry.io/websockets', dev: false },
  { name: 'IBP', url: 'wss://rpc.ibp.network/kusama', dev: false },
  { name: 'IBP Dotters', url: 'wss://rpc.dotters.network/kusama', dev: false },
  { name: 'LuckyFriday', url: 'wss://rpxc-kusama.luckyfriday.io', dev: false },
  { name: 'OnFinality', url: 'wss://kusama.api.onfinality.io/public-ws', dev: false },
  { name: 'RadiumBlock', url: 'wss://kusama.public.curie.radiumblock.co/ws', dev: false },
  { name: 'StakeWorld', url: 'wss://ksm-rpc.stakeworld.io', dev: false },
  { name: 'Local', url: 'ws://127.0.0.1:9444', dev: true },
  { name: 'Chopsticks', url: 'ws://127.0.0.1:8000', dev: true }
]
