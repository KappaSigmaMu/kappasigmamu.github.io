import type { BidRow } from '../../../helpers/bidKind'
import { selectNextRoundBidderIds } from '../dashboardHelpers'

const bid = (who: string, value: bigint): BidRow => ({ who: who as BidRow['who'], value, kindType: 'Deposit' })

describe('selectNextRoundBidderIds', () => {
  const bids = [bid('one', 10n), bid('two', 20n), bid('three', 30n)]

  it('selects ordered bids whose cumulative value is within the next pot', () => {
    expect([...selectNextRoundBidderIds(bids, 30n, 10)]).toEqual(['one', 'two'])
  })

  it('includes a bid when its cumulative value equals the next pot', () => {
    expect(selectNextRoundBidderIds(bids, 60n, 10).has('three')).toBe(true)
  })

  it('respects the maximum candidate intake', () => {
    expect([...selectNextRoundBidderIds(bids, 100n, 2)]).toEqual(['one', 'two'])
  })
})
