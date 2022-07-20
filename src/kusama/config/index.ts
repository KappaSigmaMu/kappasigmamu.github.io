/* eslint-disable @typescript-eslint/no-var-requires */

// Make sure you copied `./src/kusama/config/development.json.sample` to `./src/kusama/config/development.json`
// Use `"PROVIDER_SOCKET": "wss://kusama-rpc.polkadot.io"` if you want to connect to production RPC
const configEnv = require(`./${process.env.NODE_ENV}.json`)

interface KusamaConfig {
  APP_NAME: string,
  PROVIDER_SOCKET: string,
  DEVELOPMENT_KEYRING: boolean,
  RPC: Record<string, any>,
  env: EnvConfig
}  

interface EnvConfig {
  isDev: boolean
}

const config: KusamaConfig = { 
  env: { isDev: process.env.NODE_ENV === 'development' }, 
  ...configEnv
}

export { config }
