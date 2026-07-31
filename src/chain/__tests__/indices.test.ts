import { INDICES_PAGE_SIZE, pageRange } from '@/chain/indices'

describe('indices helpers', () => {
  it('returns fixed page ranges of 100 ids', () => {
    expect(pageRange(0)).toEqual({ start: 0, end: 99 })
    expect(pageRange(1)).toEqual({ start: 100, end: 199 })
    expect(pageRange(3, INDICES_PAGE_SIZE)).toEqual({ start: 300, end: 399 })
  })

  it('clamps negative pages to the first range', () => {
    expect(pageRange(-2)).toEqual({ start: 0, end: 99 })
  })
})
