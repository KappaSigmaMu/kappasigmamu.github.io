import type { PalletSocietyBidKind } from '@polkadot/types/lookup'
import { truncateAccountId } from './accountId'

function humanizeBidKind(bid: Partial<PalletSocietyBidKind>) {
  if (!bid) { return '<UNKNOWN KIND>' }

  if (bid.isDeposit) {
    return 'Deposit'
  } else if (bid.isVouch) {
    const accountId = bid.asVouch?.[0] || ''
    return `Vouch: ${truncateAccountId(accountId.toString())}`
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
  }else {
    return '<UNKNOWN VALUE>'
  }
}

export { humanizeBidKind, humanizeBidValue }
