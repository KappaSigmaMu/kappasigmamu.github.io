import { truncate, truncateMiddle } from '../../helpers/truncate'

const HASH = '5DcN2feEKzC23toLBu63N7Q9E2Tc3HE44oyd992WY31iZee4'

describe('truncate', () => {
  it('returns the truncated string', () => {
    expect(truncate('5DcN2feEKzC23toLBu63N7Q9E2Tc3HE44oyd992WY31iZee4', 7)).toBe('5DcN2fe...')
  })
})

describe('truncateMiddle', () => {
  it('returns the string if small than length', () => {
    expect(truncateMiddle('31iZee4', 10)).toBe('31iZee4')
  })

  it('returns the truncated string', () => {
    expect(truncateMiddle(HASH, 13))
    .toBe('5DcN2...iZee4')

    expect(truncateMiddle(HASH, 12))
    .toBe('5DcN2...Zee4')
  })

  it('returns the truncated string with different separator', () => {
    expect(truncateMiddle(HASH, 13, '^*^'))
    .toBe('5DcN2^*^iZee4')
  })
})
