import type { Identity } from '@polkadot-api/sdk-accounts'
import type { AccountIdentity } from '@/chain/types'

type LegacyIdentity = {
  display?: string
  email?: string
  legal?: string
  web?: string
  riot?: string
  twitter?: string
  judgements?: unknown[]
}

export function buildAccountIdentity(
  identity: Identity | LegacyIdentity | null | undefined
): AccountIdentity | undefined {
  if (!identity) return undefined

  const value =
    'info' in identity
      ? {
          display: identity.info.display,
          email: identity.info.email,
          legal: identity.info.legal,
          web: identity.info.web,
          riot: identity.info.matrix,
          twitter: identity.info.twitter
        }
      : identity

  if (!value.display) return undefined

  return {
    name: value.display,
    email: value.email,
    legal: value.legal,
    webpage: value.web,
    riot: value.riot,
    twitter: value.twitter
  }
}
