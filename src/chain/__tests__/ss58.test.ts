import { accountIndexToString, isSameAddress, normalizeAddress } from '@/chain/ss58'

describe('accountIndexToString', () => {
  it.each([
    [0, 'fyF'],
    [1, 'g4b'],
    [25, 'ht1'],
    [239, 'zC2'],
    [240, '5MbBF'],
    [65535, '5Sxpf'],
    [65536, 'zmMAKbr']
  ])('encodes index %i as %s', (index, expected) => {
    expect(accountIndexToString(index)).toBe(expected)
  })

  it('returns an empty string for invalid input', () => {
    expect(accountIndexToString(-1)).toBe('')
    expect(accountIndexToString(1.5)).toBe('')
  })
})

describe('isSameAddress', () => {
  const generic = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
  const other = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'

  it('compares addresses across ss58 formats by public key', () => {
    const kusama = normalizeAddress(generic)
    expect(kusama).not.toBe(generic)
    expect(isSameAddress(kusama, generic)).toBe(true)
    expect(isSameAddress(kusama, other)).toBe(false)
  })
})
