declare interface NavRouteProps {
  children?: React.ReactElement
  showAccount?: boolean
  showBrandIcon?: boolean
  showExploreButton?: boolean
  showSocialIcons?: boolean
}

declare type accountType = { name: string | undefined; address: string }

declare module '@kappasigmamu/canary-component'

declare class ThreeCanary {
  constructor(objectUrl?: string)
}

declare interface SocietyCandidate {
  accountId: AccountId
  kind: BidKind
  value: Balance
  isSuspended: boolean
  voters: string[]
  skeptics: string[]
}

declare interface SuspendedCandidate {
  accountId: AccountId
  balance: BalanceOf
  bid: PalletSocietyBidKind
}

declare interface SocietyMember {
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
  payouts: [BlockNumber, Balance][]
  strikes: StrikeCount
  strikesCount: number
  vouching?: SocietyMemberVouching
  vote?: PalletSocietyVote
}

type ExtendedDeriveSociety {
  skeptic?: AccountId32 | undefined
} & DeriveSociety

interface SocietyMemberDetails {
  accountId: AccountId
  index?: string
  identity?: AccountIdentity
}

interface AccountIdentity {
  name: string
  email?: string
  legal?: string
  webpage?: string
  twitter?: string
  riot?: string
}

declare interface SocietyMemberVouching {
  isBanned: boolean
  isVouching: boolean
}

declare interface SocietyMemberVote {
  isApprove: boolean
  isReject: boolean
}

namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_NAME: string
    REACT_APP_PROVIDER_SOCKET: string
    REACT_APP_DEVELOPMENT_KEYRING: boolean
    REACT_APP_RPC: object
  }
}
