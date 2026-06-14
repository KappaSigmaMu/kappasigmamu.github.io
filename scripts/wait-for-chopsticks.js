const http = require('http')

const endpoint = new URL(process.env.CHOPSTICKS_RPC_URL || 'http://localhost:8000')
const timeoutMs = Number(process.env.CHOPSTICKS_READY_TIMEOUT_MS || 120000)
const retryDelayMs = 1000
const startedAt = Date.now()

const requestMetadata = () =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'state_getMetadata',
      params: [],
    })
    const request = http.request(
      endpoint,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body),
        },
      },
      (response) => {
        let responseBody = ''

        response.setEncoding('utf8')
        response.on('data', (chunk) => {
          responseBody += chunk
        })
        response.on('end', () => {
          try {
            const payload = JSON.parse(responseBody)
            if (response.statusCode !== 200 || payload.error || !payload.result?.startsWith('0x')) {
              reject(new Error(payload.error?.message || `HTTP ${response.statusCode}`))
              return
            }
            resolve()
          } catch (error) {
            reject(error)
          }
        })
      }
    )

    request.setTimeout(10000, () => request.destroy(new Error('request timed out')))
    request.on('error', reject)
    request.end(body)
  })

const waitUntilReady = async () => {
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await requestMetadata()
      console.log(`Chopsticks RPC is ready at ${endpoint}`)
      return
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      console.log(`Waiting for Chopsticks RPC: ${reason || 'unknown RPC error'}`)
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
    }
  }

  throw new Error(`Chopsticks RPC did not become ready within ${timeoutMs}ms`)
}

waitUntilReady().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
