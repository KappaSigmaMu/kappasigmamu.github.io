/**
 * Proof-of-Ink backend.
 *
 * One service, replacing the earlier Cloudflare Worker + signer split. That split
 * existed only because workerd refuses runtime WASM instantiation and `@polkadot/api`
 * initialises `@polkadot/wasm-crypto` on import — so the gate ran in the Worker and
 * signing had to be delegated to a Node process next to it. Self-hosting removes the
 * constraint, and with it the second hop, the shared-secret between them, and the
 * hand-written xxhash storage-key derivation the Worker needed to read Society state.
 *
 * Routes:
 *   GET  /health     liveness plus ops-account status (no secrets)
 *   POST /authorize  verify uploader, then signed `store` + `enable_auto_renew`
 *   POST /dev-sign   local testing only; signs for dev seeds, refused unless enabled
 *
 * The image bytes pass through here so the ops account can sign `store` itself — a
 * feeless call for an authorized account, and the only path that works on Paseo. The
 * browser still proves ownership by signing the content hash, and this service asserts
 * the reconstructed envelope hashes to it, so the ops key can refuse an upload but
 * cannot substitute content for one it has approved.
 */
import { createServer } from 'node:http'
import { blake2b } from '@noble/hashes/blake2.js'
import { config } from './config.mjs'
import {
  connect,
  devSign,
  disconnect,
  enableAutoRenew,
  initKey,
  isReady,
  membershipStatus,
  opsAddress,
  opsAuthorization,
  opsBalance,
  storeSigned
} from './chain.mjs'
import { preflight, readJson, resolveOrigin, send } from './http.mjs'
import { startKeeper, stopKeeper } from './keeper.mjs'
import { decodeAddress, toHex, verifyOwnership } from './verify.mjs'

/**
 * Gate an upload, then store and auto-renew it as the ops account.
 *
 * Checks run cheapest-first, and each one exists for a specific reason:
 *   size      — bounds what a single upload can commit us to storing
 *   signature — proves the uploader holds the key, and binds them to these exact bytes
 *   membership— restricts uploads to Society members and candidates
 *
 * Path B: the ops account signs `store` itself against its account authorization — a
 * signed store from an authorized account is feeless and works on Paseo, where the
 * unsigned `authorize_preimage` path cannot. The image bytes pass through here, so the
 * gate reconstructs the envelope and asserts it hashes to the content hash the browser
 * signed: the ops key can refuse an upload but cannot substitute content for one it has
 * approved. The predecessor (Apillon) checked only the request Origin, which meant any
 * allowed page could overwrite any member's image — the flaw this replaces.
 */
async function handleAuthorize(request, response, origin) {
  const body = await readJson(request)

  if (
    !body.address ||
    !body.contentHash ||
    !body.signature ||
    typeof body.size !== 'number' ||
    typeof body.image !== 'string'
  ) {
    return send(response, 400, { error: 'Missing required fields' }, origin)
  }

  if (body.size <= 0 || body.size > config.maxImageBytes) {
    return send(response, 400, { error: `Size must be between 1 and ${config.maxImageBytes} bytes` }, origin)
  }

  if (!verifyOwnership(body.contentHash, body.signature, body.address)) {
    return send(response, 401, { error: 'Invalid signature' }, origin)
  }

  const status = await membershipStatus(body.address)
  if (status === 'none') {
    return send(response, 403, { error: 'Address is not a Society member or candidate' }, origin)
  }

  // Reconstruct the envelope byte-identically to the frontend packEnvelope: a 1-byte
  // version, the 32-byte owner public key, then the raw image bytes. Any drift here and
  // the stored CID would not match what the browser expects.
  const image = Buffer.from(body.image, 'base64')
  const publicKey = decodeAddress(body.address)

  const envelope = new Uint8Array(33 + image.length)
  envelope[0] = 1
  envelope.set(publicKey, 1)
  envelope.set(image, 33)

  // Bind the signed hash to the actual bytes. verifyOwnership proved the address signed
  // contentHash; this proves contentHash is the hash of these exact bytes, closing the
  // gap that would otherwise let the caller sign one hash and store different content.
  if (toHex(blake2b(envelope, { dkLen: 32 })) !== body.contentHash) {
    return send(response, 400, { error: 'Content hash does not match image bytes' }, origin)
  }

  const { blockHash, cid } = await storeSigned(envelope)
  await enableAutoRenew(body.contentHash)

  return send(response, 200, { authorized: true, status, cid, blockHash }, origin)
}

/**
 * Local-testing only: sign an arbitrary payload as a dev account.
 *
 * Stands in for a browser wallet so the end-to-end script can run headless. Refused
 * unless ALLOW_DEV_SIGNING is set, and it must never be enabled anywhere real — it
 * turns the service into a signing oracle for any dev seed.
 */
async function handleDevSign(request, response, origin) {
  if (!config.allowDevSigning) {
    return send(response, 404, { error: 'Not found' }, origin)
  }

  const body = await readJson(request)

  if (!body.seed?.startsWith('//') || !body.payload) {
    return send(response, 400, { error: 'dev seed (//Name) and payload required' }, origin)
  }

  const { address, publicKey, signature } = devSign(body.seed, body.payload)

  return send(response, 200, { address, publicKey, signature }, origin)
}

/**
 * Liveness and ops-account status.
 *
 * Unauthenticated and origin-free so a container healthcheck can reach it. It exposes
 * the ops address, balance and authorization expiry — all of which are already public
 * on chain — and never the seed.
 */
async function handleHealth(response) {
  if (!isReady()) {
    return send(response, 503, { status: 'connecting', ops: opsAddress() })
  }

  try {
    const authorization = await opsAuthorization()

    return send(response, 200, {
      status: 'ok',
      ops: opsAddress(),
      balance: await opsBalance(),
      authorization: authorization
        ? { blocksRemaining: authorization.blocksRemaining, expiration: authorization.expiration }
        : null
    })
  } catch (error) {
    return send(response, 503, { status: 'degraded', error: error.message })
  }
}

const routes = {
  'POST /authorize': handleAuthorize,
  'POST /dev-sign': handleDevSign
}

const server = createServer(async (request, response) => {
  const origin = resolveOrigin(request, config.allowedOrigins)
  const { pathname } = new URL(request.url, `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') return preflight(response, origin)

  // Healthcheck predates CORS: containers and probes send no Origin header.
  if (request.method === 'GET' && pathname === '/health') return handleHealth(response)

  if (!origin) return send(response, 403, { error: 'Unauthorized origin' })

  const handler = routes[`${request.method} ${pathname}`]
  if (!handler) return send(response, 404, { error: 'Not found' }, origin)

  // Every route below queries or signs on chain. Refusing here gives the browser an
  // honest "try again" rather than a request that hangs on a reconnecting socket.
  if (!isReady() && pathname !== '/dev-sign') {
    return send(response, 503, { error: 'Chain connection unavailable, retry shortly' }, origin)
  }

  try {
    await handler(request, response, origin)
  } catch (error) {
    console.error(`[error] ${pathname}: ${error.message}`)
    send(response, 500, { error: error.message }, origin)
  }
})

// Listen before connecting. The key must be valid to start at all, but a chain that is
// merely slow or briefly down should leave a running service reporting `connecting`,
// not a process that never binds a port.
const address = await initKey()

server.listen(config.port)

console.log(`poi-backend listening on :${config.port}`)
console.log(`  ops       : ${address}`)
console.log(`  origins   : ${config.allowedOrigins.join(', ')}`)
console.log(`  bulletin  : ${config.bulletinWs}`)
console.log(`  asset hub : ${config.assetHubWs}`)
if (config.allowDevSigning) console.warn('  WARNING   : dev signing is ENABLED — local use only')

connect()
  .then((identity) => {
    console.log(`connected: ${identity.bulletin} + ${identity.assetHub}`)
    startKeeper()
  })
  .catch((error) => {
    // Not fatal: the provider keeps retrying, and /health reports the state meanwhile.
    console.error(`[chain] initial connection failed: ${error.message} — retrying`)
  })

/** Drain in-flight requests before dropping the chain connections. */
const shutdown = async () => {
  console.log('shutting down')
  stopKeeper()
  server.close()
  await disconnect()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
