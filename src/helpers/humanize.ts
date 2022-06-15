import type { PalletSocietyBidKind } from '@polkadot/types/lookup'
import { truncate } from './truncate'

function humanizeBidKind(bid: Partial<PalletSocietyBidKind>) {
  if (bid.isDeposit) {
    return 'Deposit'
  } else if (bid.isVouch) {
    const accountId = bid.asVouch?.[0] || ''
    return `Vouch: ${truncate(accountId.toString())}`
  } else {
    return 'Unknown'
  }
}

export { humanizeBidKind }
