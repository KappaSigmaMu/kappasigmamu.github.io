/* eslint-disable @typescript-eslint/no-var-requires */

import configCommon from './common.json'
import types from './types.json'

const configEnv = require(`./${process.env.NODE_ENV}.json`)

const envVarNames = ['PROVIDER_SOCKET', 'DEVELOPMENT_KEYRING']

const config = { ...configCommon, ...configEnv, ...envVarNames, types }

export { config }
