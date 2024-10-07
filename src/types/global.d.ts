declare interface NavRouteProps {
  children?: React.ReactElement
  showAccount?: boolean
  showBrandIcon?: boolean
  showNavLinks?: boolean
  showSocialIcons?: boolean
}

declare module '@kappasigmamu/canary-component'

declare class ThreeCanary {
  constructor(objectUrl?: string)
}

declare interface SocietyCandidate {
  accountId: AccountId
  round: number
  kind: BidKind
  bid: Balance
  tally: {
    approvals: u32
    rejections: u32
  }
  skepticStruck: false
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
  rank: u32
}

type ExtendedDeriveSociety = {
  skeptic?: AccountId32 | undefined
  rank: u32
} & DeriveSociety

interface ExtendedSocietyMember extends SocietyMember {
  extendedPayouts: any
}

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
    REACT_APP_KEYRING_PREFIX: number
    REACT_APP_RPC: object
    REACT_APP_PROVIDER_SOCKET: string
  }
}

interface ExtrinsicResult {
  message: string
  status: 'success' | 'loading' | 'error'
  loading?: boolean
}
