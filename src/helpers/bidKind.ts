import type { AccountId, Balance } from '@polkadot/types/interfaces'
import type { Bid, BidKind } from '@polkadot/types/interfaces/society'

export type BidKindType = BidKind['type']

export type BidRow = {
  who: AccountId
  kindType: BidKindType
  value: Balance
  vouchAccount?: string
  vouchTip?: Balance
}

export function mapBidToRow(bid: Bid): BidRow {
  if (bid.kind.type === 'Vouch') {
    return {
      who: bid.who,
      kindType: 'Vouch',
      value: bid.value,
      vouchAccount: bid.kind.asVouch[0].toString(),
      vouchTip: bid.kind.asVouch[1]
    }
  }

  return {
    who: bid.who,
    kindType: 'Deposit',
    value: bid.value
  }
}

export function humanizeBidKindType(kindType: BidKindType, vouchAccount?: string): string {
  if (kindType === 'Deposit') {
    return 'Deposit'
  }

  if (kindType === 'Vouch') {
    return `Vouch: ${vouchAccount ?? ''}`
  }

  return 'Unknown'
}
