import type { DeriveAccountRegistration } from '@polkadot/api-derive/types'

export function buildAccountIdentity(identity: DeriveAccountRegistration): AccountIdentity | undefined {
  if (
    !identity.display &&
    !identity.email &&
    !identity.legal &&
    !identity.web &&
    !identity.riot &&
    !identity.twitter
  ) {
    return undefined
  }

  return {
    name: identity.display ?? '(Unable to get name)',
    email: identity.email,
    legal: identity.legal,
    riot: identity.riot,
    twitter: identity.twitter,
    webpage: identity.web
  }
}
