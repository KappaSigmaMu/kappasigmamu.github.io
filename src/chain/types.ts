import type { SS58String } from 'polkadot-api'
import type { AssetHubApi } from './client'

export type Address = SS58String
export type AccountId = SS58String
export type Balance = bigint

type SocietyApi = AssetHubApi['query']['Society']

export type SocietyBid = Awaited<ReturnType<SocietyApi['Bids']['getValue']>>[number]
export type SocietyCandidateRecord = NonNullable<Awaited<ReturnType<SocietyApi['Candidates']['getValue']>>>
export type SocietyMemberRecord = NonNullable<Awaited<ReturnType<SocietyApi['Members']['getValue']>>>
export type SocietyPayoutRecord = Awaited<ReturnType<SocietyApi['Payouts']['getValue']>>
export type SocietyVote = NonNullable<Awaited<ReturnType<SocietyApi['Votes']['getValue']>>>
export type SocietyBidKind = SocietyBid['kind']
export type SocietyBidKindType = SocietyBidKind['type']

export type SocietyCandidate = {
  accountId: AccountId
  round: number
  kindType: SocietyBidKindType
  bid: Balance
  tally: { approvals: number; rejections: number }
  skepticStruck: boolean
}

export type SocietyMemberVouching = {
  isBanned: boolean
  isVouching: boolean
}

export type SocietyMember = {
  accountId: AccountId
  hasPayouts: boolean
  hasStrikes: boolean
  isDefender: boolean
  isDefenderVoter: boolean
  isFounder: boolean
  isHead: boolean
  isSkeptic: boolean
  isSuspended: boolean
  isWarned: boolean
  payouts: Array<[number, Balance]>
  strikes: number
  strikesCount: number
  vouching?: SocietyMemberVouching
  vote?: SocietyVote
  rank: number
}

export type ExtendedSocietyMember = SocietyMember & {
  extendedPayouts: {
    block: number
    pending: Balance
    paid: Balance
  }
}

export type SocietyInfo = {
  founder?: AccountId
  head?: AccountId
  skeptic?: AccountId
  defender?: AccountId
  pot: Balance
  parameters?: {
    max_members: number
    max_intake: number
    max_strikes: number
    candidate_deposit: Balance
  }
}

export type AccountIdentity = {
  name: string
  email?: string
  legal?: string
  webpage?: string
  twitter?: string
  riot?: string
}

export type SocietyMemberDetails = {
  accountId: AccountId
  index?: string
  identity?: AccountIdentity
}

export type IdentityRegistration = {
  display?: string
  email?: string
  legal?: string
  web?: string
  twitter?: string
  matrix?: string
  judgements: Array<unknown>
}

export type NavRouteProps = {
  children?: React.ReactElement
  showAccount?: boolean
  showBrandIcon?: boolean
  showNavLinks?: boolean
  showSocialIcons?: boolean
}

export type ExtrinsicResult = {
  message: string
  status: 'success' | 'loading' | 'error'
  loading?: boolean
}
