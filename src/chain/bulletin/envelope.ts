import { blake2b } from '@noble/hashes/blake2b'
import { fromBufferToBase58 } from '@polkadot-api/substrate-bindings'
import { toPublicKey } from '@/chain/ss58'

/**
 * The stored blob carries its media kind and owner's public key in front of the bytes.
 *
 * The owner pubkey is what makes the gallery rebuildable from chain alone: every blob
 * names its own owner, so no separate address -> CID index has to be maintained,
 * published, or trusted, and adding a tattoo never requires a commit to this repo. The
 * leading kind byte separates the gallery image (1) from its verification video (2), and
 * doubles as a sanity marker — a Proof-of-Ink blob always begins 0x01 or 0x02.
 */
export const KIND_IMAGE = 1
export const KIND_VIDEO = 2
export type MediaKind = typeof KIND_IMAGE | typeof KIND_VIDEO

const PUBLIC_KEY_BYTES = 32
const HEADER_BYTES = 1 + PUBLIC_KEY_BYTES

const KUSAMA_SS58 = 2

export function packEnvelope(address: string, media: Uint8Array, kind: MediaKind): Uint8Array {
  const publicKey = toPublicKey(address)
  if (publicKey.length !== PUBLIC_KEY_BYTES) throw new Error(`Unexpected public key length: ${publicKey.length}`)

  const bytes = new Uint8Array(HEADER_BYTES + media.length)
  bytes[0] = kind
  bytes.set(publicKey, 1)
  bytes.set(media, HEADER_BYTES)

  return bytes
}

export function unpackEnvelope(bytes: Uint8Array): { address: string; kind: MediaKind; media: Uint8Array } {
  const kind = bytes[0]
  if (bytes.length < HEADER_BYTES || (kind !== KIND_IMAGE && kind !== KIND_VIDEO))
    throw new Error('Not a Proof-of-Ink envelope')

  return {
    address: fromBufferToBase58(KUSAMA_SS58)(bytes.slice(1, HEADER_BYTES)),
    kind: kind as MediaKind,
    media: bytes.slice(HEADER_BYTES)
  }
}

const toHex = (bytes: Uint8Array): string =>
  `0x${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`

/**
 * The blake2_256 content hash of the exact submitted bytes.
 *
 * A plain hash, not a CID. Computing it in the browser is what lets the backend verify
 * the uploader's signature over these exact bytes before storing them.
 */
export const contentHash = (bytes: Uint8Array): string => toHex(blake2b(bytes, { dkLen: 32 }))

/** blake2_256 over the two content-hash digests, the payload the member signs once. */
export const combinedHash = (imageHashHex: string, videoHashHex: string): string => {
  const toBytes = (hex: string): Uint8Array =>
    Uint8Array.from((hex.replace(/^0x/, '').match(/../g) as string[]).map((b) => parseInt(b, 16)))
  return toHex(blake2b(new Uint8Array([...toBytes(imageHashHex), ...toBytes(videoHashHex)]), { dkLen: 32 }))
}
