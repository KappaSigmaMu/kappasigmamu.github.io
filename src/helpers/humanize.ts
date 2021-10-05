import type { PalletSocietyBidKind } from '@polkadot/types/lookup'
import { truncate } from './truncate'

function humanizeBidKind(bid: Partial<PalletSocietyBidKind>) {
  if (!bid) { return '<UNKNOWN KIND>' }

  if (bid.isDeposit) {
    return 'Deposit'
  } else if (bid.isVouch) {
    const accountId = bid.asVouch?.[0] || ''
    return `Vouch: ${truncate(accountId.toString())}`
  } else {
    return '<UNKNOWN KIND>'
  }
}

function humanizeBidValue(bid: Partial<PalletSocietyBidKind>) {
  if (!bid) { return '<UNKNOWN VALUE>' }

  if (bid.isDeposit) {
    return bid.asDeposit?.toHuman()
  } else if (bid.isVouch) {
    return bid.asVouch?.[1].toHuman()
  } else {
    return '<UNKNOWN VALUE>'
  }
}

export { humanizeBidKind, humanizeBidValue }
