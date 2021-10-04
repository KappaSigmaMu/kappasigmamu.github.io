/* eslint-disable @typescript-eslint/no-var-requires */

const configEnv = require(`./${process.env.NODE_ENV}.json`)
const config = { ...configEnv }

export { config }
