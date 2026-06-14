import { u8aToHex } from '@polkadot/util'
import { decodeAddress } from '@polkadot/util-crypto'

export const toPublicKey = (address: string): string => u8aToHex(decodeAddress(address))

export const isSameAddress = (a?: string | null, b?: string | null): boolean => {
  if (!a || !b) return false

  try {
    return toPublicKey(a) === toPublicKey(b)
  } catch {
    return false
  }
}
