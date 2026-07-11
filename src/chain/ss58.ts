import { blake2b } from '@noble/hashes/blake2b'
import { fromBufferToBase58 } from '@polkadot-api/substrate-bindings'
import { base58 } from '@scure/base'
import { getSs58AddressInfo, type SS58String } from 'polkadot-api'

const KUSAMA_SS58 = 2

const bytesEqual = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length && left.every((byte, index) => byte === right[index])

export function normalizeAddress(address: string, ss58Format = KUSAMA_SS58): SS58String {
  const info = getSs58AddressInfo(address as SS58String)
  if (!info.isValid) throw new Error('Invalid SS58 address')
  return fromBufferToBase58(ss58Format)(info.publicKey)
}

export function toPublicKey(address: string): Uint8Array {
  const info = getSs58AddressInfo(address as SS58String)
  if (!info.isValid) throw new Error('Invalid SS58 address')
  return info.publicKey
}

export function isSameAddress(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false
  try {
    return bytesEqual(toPublicKey(a), toPublicKey(b))
  } catch {
    return false
  }
}

const SS58_HASH_PREFIX = new TextEncoder().encode('SS58PRE')

// SS58 encoding of an account index: little-endian index bytes with a 1-byte
// checksum (unlike 32-byte public keys, which use a 2-byte checksum).
export function accountIndexToString(index: number, ss58Format = KUSAMA_SS58): string {
  if (!Number.isSafeInteger(index) || index < 0) return ''

  const length = index <= 0xef ? 1 : index < 2 ** 16 ? 2 : index < 2 ** 32 ? 4 : 8
  const input = new Uint8Array(1 + length)
  input[0] = ss58Format
  let value = BigInt(index)
  for (let offset = 0; offset < length; offset += 1) {
    input[1 + offset] = Number(value & 0xffn)
    value >>= 8n
  }

  const checksum = blake2b(Uint8Array.of(...SS58_HASH_PREFIX, ...input), { dkLen: 64 }).subarray(0, 1)
  return base58.encode(Uint8Array.of(...input, ...checksum))
}
