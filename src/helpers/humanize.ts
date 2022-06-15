import type { PalletSocietyBidKind, PalletSocietyBid } from '@polkadot/types/lookup'
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
    const s = bid.asDeposit?.toHuman().replace(/,/g, '') || ''
    return `${parseInt(s)} KSM`
  } else {
    return '<UNKNOWN VALUE>'
  }
}

function humanizeVouchValue(bid: Partial<PalletSocietyBidKind>) {
  if (!bid) { return '<UNKNOWN VALUE>' }

  if (bid.isVouch) {
    const s = bid.asVouch?.[1].toHuman().replace(/,/g, '') || ''
    return `${parseInt(s)} KSM`
  } else {
    return '<UNKNOWN VALUE>'
  }
}

export { humanizeVouchValue, humanizeBidKind, humanizeBidValue }
