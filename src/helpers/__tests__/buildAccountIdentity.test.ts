import type { DeriveAccountRegistration } from '@polkadot/api-derive/types'
import { buildAccountIdentity } from '../buildAccountIdentity'

describe('buildAccountIdentity', () => {
  it('returns undefined when no identity fields are set', () => {
    expect(buildAccountIdentity({ judgements: [] })).toBeUndefined()
  })

  it('maps derive registration fields to account identity', () => {
    const registration: DeriveAccountRegistration = {
      display: 'Alice',
      email: 'alice@example.com',
      legal: 'Alice Example',
      web: 'https://example.com',
      riot: '@alice:matrix.org',
      twitter: '@alice',
      judgements: []
    }

    expect(buildAccountIdentity(registration)).toEqual({
      name: 'Alice',
      email: 'alice@example.com',
      legal: 'Alice Example',
      webpage: 'https://example.com',
      riot: '@alice:matrix.org',
      twitter: '@alice'
    })
  })
})
