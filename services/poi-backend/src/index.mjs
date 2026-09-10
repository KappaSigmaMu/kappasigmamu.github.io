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
import { readManifest, recordUpload } from './manifest.mjs'
import { matrixEnabled, postVideo } from './matrix.mjs'
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
  // The media rides in the JSON body as base64 (~4/3 inflation). Size the read limit off
  // the larger cap — video (Matrix) is far bigger than the image (2 MiB chain) — plus
  // headroom for the envelope's other fields, so a within-policy upload is never rejected
  // as "Body too large" mid-request.
  const maxMediaBytes = Math.max(config.maxImageBytes, config.maxVideoBytes)
  const bodyLimit = Math.ceil((maxMediaBytes * 4) / 3) + 16 * 1024
  const body = await readJson(request, bodyLimit)

  if (
    !body.address ||
    !body.contentHash ||
    !body.signature ||
    typeof body.size !== 'number' ||
    typeof body.image !== 'string'
  ) {
    return send(response, 400, { error: 'Missing required fields' }, origin)
  }

  const kind = body.kind === undefined ? 1 : body.kind
  if (kind !== 1 && kind !== 2) {
    return send(response, 400, { error: 'kind must be 1 (image) or 2 (video)' }, origin)
  }

  // The image is stored on the Bulletin chain, hard-capped at 2 MiB per blob; the video
  // goes to Matrix and may be far larger. Enforce the right ceiling for the kind.
  const maxBytes = kind === 2 ? config.maxVideoBytes : config.maxImageBytes
  if (body.size <= 0 || body.size > maxBytes) {
    return send(response, 400, { error: `Size must be between 1 and ${maxBytes} bytes` }, origin)
  }

  if (!verifyOwnership(body.contentHash, body.signature, body.address)) {
    return send(response, 401, { error: 'Invalid signature' }, origin)
  }

  const status = await membershipStatus(body.address)
  if (status === 'none') {
    return send(response, 403, { error: 'Address is not a Society member or candidate' }, origin)
  }

  // Reconstruct the envelope byte-identically to the frontend packEnvelope: a 1-byte
  // media kind (1 image, 2 video), the 32-byte owner public key, then the raw image bytes.
  // Any drift here and the stored CID would not match what the browser expects.
  const image = Buffer.from(body.image, 'base64')
  const publicKey = decodeAddress(body.address)

  const envelope = new Uint8Array(33 + image.length)
  envelope[0] = kind
  envelope.set(publicKey, 1)
  envelope.set(image, 33)

  // Bind the signed hash to the actual bytes. verifyOwnership proved the address signed
  // contentHash; this proves contentHash is the hash of these exact bytes, closing the
  // gap that would otherwise let the caller sign one hash and store different content.
  if (toHex(blake2b(envelope, { dkLen: 32 })) !== body.contentHash) {
    return send(response, 400, { error: 'Content hash does not match image bytes' }, origin)
  }

  // Image (kind 1) is gallery content: store it on chain and record its CID. Video (kind 2)
  // is a verification clip too big for the chain: post the raw bytes (envelope header
  // stripped — Matrix should hold a playable file) to the Matrix room, and record the mxc
  // reference instead of a CID. Both kinds were signed by the member over their content
  // hash, so ownership is proven either way.
  if (kind === 2) {
    if (!matrixEnabled()) {
      return send(response, 503, { error: 'Video uploads are not configured' }, origin)
    }

    const mimetype = typeof body.mimetype === 'string' && body.mimetype ? body.mimetype : 'video/mp4'
    const { mxc, eventId } = await postVideo({
      bytes: image, // raw video bytes; the 33-byte envelope header is not part of the file
      mimetype,
      filename: `poi-${body.address}.${mimetype === 'video/webm' ? 'webm' : 'mp4'}`,
      owner: body.address
    })
    await recordUpload({ address: body.address, kind, mxc, eventId, contentHash: body.contentHash })

    return send(response, 200, { authorized: true, status, mxc, eventId }, origin)
  }

  const { blockHash, cid } = await storeSigned(envelope)
  await enableAutoRenew(body.contentHash)
  await recordUpload({ address: body.address, kind, cid, contentHash: body.contentHash })

  return send(response, 200, { authorized: true, status, cid, blockHash }, origin)
}

/**
 * Gate and store a full Proof-of-Ink submission — image and video — in one signed call.
 *
 * The member signs once, over a payload that commits to both media at once:
 *   imageHash = blake2b([1][owner][image]),  videoHash = blake2b([2][owner][video])
 *   signed    = blake2b(imageHash ++ videoHash)
 * so one signature binds them to the exact image AND the exact video together — neither can
 * be swapped without breaking it. The image is stored on the Bulletin chain (gallery
 * content); the video, too large for the chain's 2 MiB per-blob cap and not public, is
 * posted to Matrix for a desk to review. Both are recorded in the manifest.
 */
async function handleSubmit(request, response, origin) {
  // Both media ride in the JSON body as base64 (~4/3 inflation); size the read limit off
  // the combined caps plus headroom so a within-policy submission is never cut off.
  const bodyLimit = Math.ceil(((config.maxImageBytes + config.maxVideoBytes) * 4) / 3) + 16 * 1024
  const body = await readJson(request, bodyLimit)

  if (
    !body.address ||
    !body.signature ||
    typeof body.image !== 'string' ||
    typeof body.video !== 'string' ||
    !body.imageHash ||
    !body.videoHash
  ) {
    return send(response, 400, { error: 'Missing required fields' }, origin)
  }

  const image = Buffer.from(body.image, 'base64')
  const video = Buffer.from(body.video, 'base64')

  if (image.length <= 0 || image.length > config.maxImageBytes) {
    return send(response, 400, { error: `Image size must be between 1 and ${config.maxImageBytes} bytes` }, origin)
  }
  if (video.length <= 0 || video.length > config.maxVideoBytes) {
    return send(response, 400, { error: `Video size must be between 1 and ${config.maxVideoBytes} bytes` }, origin)
  }

  const publicKey = decodeAddress(body.address)

  // Rebuild each envelope and assert it hashes to the hash the caller claims — this binds
  // the (single) signature, taken over the two hashes, to these exact bytes.
  const imageEnvelope = new Uint8Array(33 + image.length)
  imageEnvelope[0] = 1
  imageEnvelope.set(publicKey, 1)
  imageEnvelope.set(image, 33)

  const videoEnvelope = new Uint8Array(33 + video.length)
  videoEnvelope[0] = 2
  videoEnvelope.set(publicKey, 1)
  videoEnvelope.set(video, 33)

  const imageHash = toHex(blake2b(imageEnvelope, { dkLen: 32 }))
  const videoHash = toHex(blake2b(videoEnvelope, { dkLen: 32 }))
  if (imageHash !== body.imageHash || videoHash !== body.videoHash) {
    return send(response, 400, { error: 'Content hash does not match media bytes' }, origin)
  }

  // The signed payload is blake2b of the two 32-byte digests concatenated.
  const imageHashBytes = Buffer.from(body.imageHash.replace(/^0x/, ''), 'hex')
  const videoHashBytes = Buffer.from(body.videoHash.replace(/^0x/, ''), 'hex')
  const signedPayload = toHex(blake2b(new Uint8Array([...imageHashBytes, ...videoHashBytes]), { dkLen: 32 }))

  if (!verifyOwnership(signedPayload, body.signature, body.address)) {
    return send(response, 401, { error: 'Invalid signature' }, origin)
  }

  const status = await membershipStatus(body.address)
  if (status === 'none') {
    return send(response, 403, { error: 'Address is not a Society member or candidate' }, origin)
  }

  if (!matrixEnabled()) {
    return send(response, 503, { error: 'Video uploads are not configured' }, origin)
  }

  // Video → Matrix (verification) FIRST. Storing the image is an irreversible on-chain
  // spend, so the fallible off-chain step runs before it: if Matrix rejects the upload,
  // nothing has been written to the chain and the member can retry cleanly.
  const mimetype = typeof body.videoMimetype === 'string' && body.videoMimetype ? body.videoMimetype : 'video/mp4'
  const { mxc, eventId } = await postVideo({
    bytes: video,
    mimetype,
    filename: `poi-${body.address}.${mimetype === 'video/webm' ? 'webm' : 'mp4'}`,
    owner: body.address
  })
  await recordUpload({ address: body.address, kind: 2, mxc, eventId, contentHash: body.videoHash })

  // Image → chain (gallery). Only reached once the video is safely in Matrix.
  const { blockHash, cid } = await storeSigned(imageEnvelope)
  await enableAutoRenew(body.imageHash)
  await recordUpload({ address: body.address, kind: 1, cid, contentHash: body.imageHash })

  return send(response, 200, { authorized: true, status, cid, blockHash, mxc, eventId }, origin)
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

/**
 * List stored Proof-of-Ink blobs for the gallery.
 *
 * Returns the manifest this backend maintains — one entry per upload it has stored, owner
 * and media kind included. The chain holds every user's blobs with no POI marker, so the
 * manifest, not a chain scan, is the source of truth for what belongs in the gallery. The
 * browser fetches each CID, keeps the images, and drops the verification videos.
 */
async function handleGallery(response, origin) {
  const items = await readManifest()
  return send(response, 200, { items }, origin)
}

const routes = {
  'POST /authorize': handleAuthorize,
  'POST /submit': handleSubmit,
  'POST /dev-sign': handleDevSign,
  'GET /gallery': (request, response, origin) => handleGallery(response, origin)
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
