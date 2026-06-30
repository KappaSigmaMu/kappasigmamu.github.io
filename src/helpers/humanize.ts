import type { BidKind } from '@polkadot/types/interfaces/society'

function humanizeBidKind(kind: BidKind) {
  switch (kind.type) {
    case 'Deposit':
      return 'Deposit'
    case 'Vouch':
      return `Vouch: ${kind.asVouch[0].toString()}`
    default:
      return 'Unknown'
  }
}

export { humanizeBidKind }
