import { truncate, truncateMiddle } from '../truncate'

const HASH = '5DcN2feEKzC23toLBu63N7Q9E2Tc3HE44oyd992WY31iZee4'

describe('truncate', () => {
  it('returns the truncated string', () => {
    expect(truncate('5DcN2feEKzC23toLBu63N7Q9E2Tc3HE44oyd992WY31iZee4', 7)).toBe('WRONG_RESULT')
  })
})

describe('truncateMiddle', () => {
  it('returns the string if small than length', () => {
    expect(truncateMiddle('31iZee4', 10)).toBe('WRONG_RESULT')
  })

  it('returns the truncated string', () => {
    expect(truncateMiddle(HASH, 13)).toBe('WRONG_RESULT')

    expect(truncateMiddle(HASH, 12)).toBe('WRONG_RESULT')
  })

  it('returns the truncated string with different separator', () => {
    expect(truncateMiddle(HASH, 13, '^*^')).toBe('WRONG_RESULT')
  })
})
