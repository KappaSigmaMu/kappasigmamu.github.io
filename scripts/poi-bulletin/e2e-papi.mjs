/**
 * End-to-end check of the PAPI upload path — the same calls `src/chain/bulletin/`
 * makes in the browser, so this exercises the real frontend code path.
 *
 *   1. build the {address, image} envelope, hash it
 *   2. sign the hash as the Society wallet would
 *   3. POST /authorize   -> backend gates, ops authorizes that one preimage
 *   4. getBareTx() + client.submit() — the UNSIGNED store, via PAPI
 *   5. POST /finalize    -> ops enables auto-renew
 *   6. read the CID back from the IPFS gateway and compare bytes
 *
 * Bob is seeded as a Society candidate in `config/kusama.yml`. His dev key is derived
 * from the standard dev phrase; `SIGNING_KEY` can override it for other fixtures.
 */
import { bulletin } from '@polkadot-api/descriptors'
import { blake2b } from '@noble/hashes/blake2b'
import { createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws'
import { fromBufferToBase58 } from '@polkadot-api/substrate-bindings'
import { base32 } from '@scure/base'

const BACKEND = process.env.BACKEND_URL || 'http://127.0.0.1:8787'
const ORIGIN = 'http://localhost:3000'
const GATEWAY = process.env.IPFS_GATEWAY || 'http://127.0.0.1:8283'
const BULLETIN_WS = process.env.BULLETIN_WS || 'ws://127.0.0.1:9944'
const KUSAMA_SS58 = 2

const toHex = (bytes) => `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
const fromHex = (hex) => Uint8Array.from(hex.slice(2).match(/../g).map((byte) => parseInt(byte, 16)))

const SEED = process.env.SIGNING_SEED || '//Bob'

/**
 * Stand-in for the browser wallet.
 *
 * The backend's dev-signing endpoint holds the dev keys, so this script does not need
 * its own keypair library. In the browser this is the extension signing the hash.
 */
async function devSign(payload) {
  const response = await fetch(`${BACKEND}/dev-sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({ seed: SEED, payload })
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `dev-sign returned ${response.status} (set ALLOW_DEV_SIGNING=true)`)
  }

  return response.json()
}

const { publicKey: publicKeyHex } = await devSign('0x00')
const publicKey = fromHex(publicKeyHex)
const address = fromBufferToBase58(KUSAMA_SS58)(publicKey)

const image = new TextEncoder().encode(`tattoo bytes ${process.argv[2] || Date.now()}`)

// --- 1. envelope: the blob names its own owner -------------------------------
const envelope = new Uint8Array(33 + image.length)
envelope[0] = 1
envelope.set(publicKey, 1)
envelope.set(image, 33)

const contentHash = toHex(blake2b(envelope, { dkLen: 32 }))
console.log('address     :', address)
console.log('contentHash :', contentHash)

// --- 2 + 3. sign the hash, ask the worker to authorize it --------------------
const { signature } = await devSign(contentHash)

const authorizeResponse = await fetch(`${BACKEND}/authorize`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
  body: JSON.stringify({ address, contentHash, size: envelope.length, signature })
})
const authorizeBody = await authorizeResponse.json()
console.log('authorize   :', authorizeResponse.status, JSON.stringify(authorizeBody))
if (!authorizeResponse.ok) process.exit(1)

// --- 4. the unsigned store, exactly as src/chain/bulletin/upload.ts does it ---
const client = createClient(getWsProvider(BULLETIN_WS))
const api = client.getTypedApi(bulletin)

const bareTx = await api.tx.TransactionStorage.store({ data: envelope }).getBareTx()
const result = await client.submit(bareTx)

const stored = result.events.find((event) => event.type === 'TransactionStorage' && event.value.type === 'Stored')
if (!stored) throw new Error('no Stored event')

const chainHash = stored.value.value.content_hash
const chainHashHex = typeof chainHash === 'string' ? chainHash : toHex(chainHash)
console.log('stored      : unsigned ok, content_hash matches =', chainHashHex === contentHash)
if (chainHashHex !== contentHash) {
  console.log('  chain :', chainHashHex)
  console.log('  local :', contentHash)
  process.exit(1)
}

// CIDv1 in base32, lowercase, `b`-prefixed — the chain hands back the raw CID bytes.
const cid = `b${base32.encode(stored.value.value.cid).toLowerCase().replace(/=+$/, '')}`
console.log('cid         :', cid)
client.destroy()

// --- 5. auto-renew ------------------------------------------------------------
const finalizeResponse = await fetch(`${BACKEND}/finalize`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
  body: JSON.stringify({ contentHash })
})
console.log('finalize    :', finalizeResponse.status, JSON.stringify(await finalizeResponse.json()))
if (!finalizeResponse.ok) process.exit(1)

// --- 6. read it back ----------------------------------------------------------
const fetched = await fetch(`${GATEWAY}/ipfs/${cid}`)
console.log('gateway     :', fetched.status)
if (!fetched.ok) process.exit(1)

const bytes = new Uint8Array(await fetched.arrayBuffer())
const ownerMatches = toHex(bytes.slice(1, 33)) === toHex(publicKey)
const imageMatches = toHex(bytes.slice(33)) === toHex(image)

console.log('owner       :', ownerMatches ? 'matches uploader' : 'MISMATCH')
console.log('image       :', imageMatches ? 'byte-identical' : 'MISMATCH')

if (!ownerMatches || !imageMatches) process.exit(1)
console.log('\nPAPI END TO END OK')
