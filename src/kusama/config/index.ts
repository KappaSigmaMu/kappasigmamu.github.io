/* eslint-disable @typescript-eslint/no-var-requires */

// Make sure you copied `./src/kusama/config/development.json.sample` to `./src/kusama/config/development.json`
// Use `"PROVIDER_SOCKET": "wss://kusama-rpc.polkadot.io"` if you want to connect to production RPC
const configEnv = require(`./${process.env.NODE_ENV}.json`)
const config = { env: process.env.NODE_ENV, ...configEnv }

export { config }
