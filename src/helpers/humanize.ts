import type { PalletSocietyBidKind } from '@polkadot/types/lookup'

function humanizeBidKind(bid: Partial<PalletSocietyBidKind>) {
  if (bid.isDeposit) {
    return 'Deposit'
  } else if (bid.isVouch) {
    const accountId = bid.asVouch?.[0] || ''
    return `Vouch: ${accountId.toString()}`
  } else {
    return 'Unknown'
  }
}

export { humanizeBidKind }
