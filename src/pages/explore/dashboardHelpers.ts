import type { BidRow } from '../../helpers/bidKind'

export function selectNextRoundBidderIds(
  bids: BidRow[],
  nextPot: bigint,
  maxCandidates: number
): Set<string> {
  const selected = new Set<string>()
  let total = 0n

  for (const bid of bids) {
    total += bid.value
    const acceptsZeroBid = bid.value !== 0n || selected.size === 0
    if (selected.size < maxCandidates && acceptsZeroBid && total <= nextPot) selected.add(bid.who)
  }

  return selected
}
