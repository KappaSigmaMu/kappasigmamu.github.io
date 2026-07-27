import type { SocietyBid, SocietyBidKindType, Balance, AccountId } from '../chain/types'

export type BidKindType = SocietyBidKindType

export type BidRow = {
  who: AccountId
  kindType: BidKindType
  value: Balance
  vouchAccount?: string
  vouchTip?: Balance
}

export function mapBidToRow(bid: SocietyBid): BidRow {
  if (bid.kind.type === 'Vouch') {
    const [vouchAccount, vouchTip] = bid.kind.value
    return { who: bid.who, kindType: 'Vouch', value: bid.value, vouchAccount, vouchTip }
  }

  return { who: bid.who, kindType: 'Deposit', value: bid.value }
}

export function humanizeBidKindType(kindType: BidKindType, vouchAccount?: string): string {
  return kindType === 'Vouch' ? `Vouch: ${vouchAccount ?? ''}` : kindType === 'Deposit' ? 'Deposit' : 'Unknown'
}
