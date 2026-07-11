import { fromBufferToBase58 } from '@polkadot-api/substrate-bindings'
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

const ACCOUNT_INDEX_PREFIXES: Record<number, number> = { 2: 0xfc, 4: 0xfd, 8: 0xfe }

export function accountIndexToString(index: number, ss58Format = KUSAMA_SS58): string {
  if (!Number.isSafeInteger(index) || index < 0) return ''

  const length = index <= 0xef ? 1 : index < 2 ** 16 ? 2 : index < 2 ** 32 ? 4 : 8
  const bytes = new Uint8Array(length)
  let value = BigInt(index)
  for (let offset = 0; offset < length; offset += 1) {
    bytes[offset] = Number(value & 0xffn)
    value >>= 8n
  }

  const encoded = length === 1 ? bytes : new Uint8Array([ACCOUNT_INDEX_PREFIXES[length], ...bytes])
  return fromBufferToBase58(ss58Format)(encoded)
}
