import { getSs58AddressInfo, type SS58String } from 'polkadot-api'

export const isValidAddress = (address: string | null) =>
  address !== null && getSs58AddressInfo(address as SS58String).isValid
