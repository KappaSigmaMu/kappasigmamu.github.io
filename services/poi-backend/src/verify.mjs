/**
 * Signature and address handling.
 *
 * Pure JavaScript (`@scure` / `@noble`) rather than `@polkadot/util-crypto`. That
 * started as a Cloudflare Workers constraint — workerd refuses runtime WASM — and is
 * kept here on its own merits: the gate is the security-critical path, and these are
 * small auditable dependencies with no WASM initialisation to go wrong at boot.
 */
import { blake2b } from '@noble/hashes/blake2.js'
import { base58 } from '@scure/base'
import * as sr25519 from '@scure/sr25519'

const SS58_PREFIX = new TextEncoder().encode('SS58PRE')

/** Decode an SS58 address to its 32-byte public key, verifying the checksum. */
export function decodeAddress(address) {
  const decoded = base58.decode(address)

  // Network prefix is 1 byte below 64, otherwise 2 bytes.
  const prefixBytes = decoded[0] < 64 ? 1 : 2
  const publicKey = decoded.slice(prefixBytes, prefixBytes + 32)
  if (publicKey.length !== 32) throw new Error('Bad SS58 address length')

  const checksum = decoded.slice(prefixBytes + 32)
  const body = decoded.slice(0, prefixBytes + 32)
  const expected = blake2b(new Uint8Array([...SS58_PREFIX, ...body]), { dkLen: 64 })

  for (let index = 0; index < checksum.length; index++) {
    if (checksum[index] !== expected[index]) throw new Error('Bad SS58 checksum')
  }

  return publicKey
}

export function hexToBytes(hex) {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  if (clean.length % 2 !== 0) throw new Error('Bad hex length')

  const bytes = new Uint8Array(clean.length / 2)
  for (let index = 0; index < bytes.length; index++) {
    const byte = Number.parseInt(clean.slice(index * 2, index * 2 + 2), 16)
    if (Number.isNaN(byte)) throw new Error('Bad hex')
    bytes[index] = byte
  }

  return bytes
}

export const toHex = (bytes) => `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`

/**
 * Verify that `address` signed `contentHash`.
 *
 * This is what stops one member uploading under another member's address. The
 * signature covers the content hash specifically, so a signature captured from one
 * upload cannot be replayed to authorize different bytes.
 *
 * The signed payload is the content hash's raw 32 bytes. A `0x`-prefixed string handed
 * to polkadot-js is hex-decoded before signing, not treated as text, so verifying the
 * utf8 of that string never matches.
 */
export function verifyOwnership(contentHash, signature, address) {
  try {
    const publicKey = decodeAddress(address)
    const signatureBytes = hexToBytes(signature)
    if (signatureBytes.length !== 64) return false

    const message = hexToBytes(contentHash)
    if (sr25519.verify(message, signatureBytes, publicKey)) return true

    // Extension wallets wrap payloads in <Bytes>…</Bytes> before signing. There are two
    // wrapped variants depending on how the wallet treats a `type: 'bytes'` signRaw
    // payload: some wrap the 0x-hex STRING, others wrap the RAW decoded bytes. PAPI's
    // pjs-signer hands the wallet the hex string, and polkadot-js / Talisman then wrap
    // the raw bytes of it — so both must be accepted.
    const open = new TextEncoder().encode('<Bytes>')
    const close = new TextEncoder().encode('</Bytes>')

    const wrappedHexString = new TextEncoder().encode(`<Bytes>${contentHash}</Bytes>`)
    if (sr25519.verify(wrappedHexString, signatureBytes, publicKey)) return true

    const wrappedRawBytes = new Uint8Array([...open, ...message, ...close])
    return sr25519.verify(wrappedRawBytes, signatureBytes, publicKey)
  } catch {
    return false
  }
}
