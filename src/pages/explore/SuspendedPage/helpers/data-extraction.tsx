import type { Option, StorageKey } from '@polkadot/types'
import type { AccountId, BalanceOf } from '@polkadot/types/interfaces'
import type { PalletSocietyBidKind } from '@polkadot/types/lookup'
import type { ITuple } from '@polkadot/types/types'

declare type candidateEntryType = [StorageKey<[AccountId]>, Option<ITuple<[BalanceOf, PalletSocietyBidKind]>>]

export const optExtractCandidates = {
  transform: (entries: candidateEntryType[]): SocietyCandidateSuspend[] =>
    entries
    .filter(([{ args: [accountId] }, opt]) => opt.isSome && accountId)
    .map(([{ args: [accountId] }, opt]) => {
      const [balance, bid] = opt.unwrap()
      return { accountId, balance, bid }
    })
    .sort((a, b) => a.balance.cmp(b.balance))
}

export const optExtractAccounts = {
  transform: (keys: StorageKey<[AccountId]>[]): AccountId[] =>
    keys
      .map(({ args: [accountId] }) => accountId)
      .filter((a) => !!a)
}
