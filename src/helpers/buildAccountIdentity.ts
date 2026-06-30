import type { DeriveAccountRegistration } from '@polkadot/api-derive/types'

export function buildAccountIdentity(identity: DeriveAccountRegistration): AccountIdentity | undefined {
  if (!identity.display) return undefined

  return {
    name: identity.display,
    email: identity.email,
    legal: identity.legal,
    riot: identity.riot,
    twitter: identity.twitter,
    webpage: identity.web
  }
}
