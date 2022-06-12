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

function humanizeBidValue(bid: PalletSocietyBid) {
  if (!bid) { return '<UNKNOWN VALUE>' }

  const s = bid?.value?.toHuman().replace(/,/g, '') || ''
  return `${parseInt(s)} KSM`
}

function humanizeVouchValue(bid: Partial<PalletSocietyBidKind>) {
  if (!bid) { return '<UNKNOWN VALUE>' }

  if (bid.isVouch) {
    const s = bid.asVouch?.[1].toHuman().replace(/,/g, '') || ''
    return `${parseInt(s)} KSM`
  } else {
    return ''
  }
}

export { humanizeVouchValue, humanizeBidKind, humanizeBidValue }
