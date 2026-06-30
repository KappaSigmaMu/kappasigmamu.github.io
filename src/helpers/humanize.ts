import type { BidKind } from '@polkadot/types/interfaces/society'

function humanizeBidKind(bid: Partial<BidKind>) {
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
