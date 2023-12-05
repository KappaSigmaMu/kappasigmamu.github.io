import { Option, StorageKey } from '@polkadot/types'
import { AccountId, BalanceOf } from '@polkadot/types/interfaces'
import { PalletSocietyBidKind } from '@polkadot/types/lookup'
import { ITuple } from '@polkadot/types/types'

type suspendedCandidateEntry = [
  StorageKey<[AccountId]>, 
  Option<ITuple<[BalanceOf, PalletSocietyBidKind]>>
]

export const extractAccountIds = (keys: StorageKey<[AccountId]>[]): AccountId[] => {
  return keys.map(({ args: [accountId] }) => accountId).filter((a) => !!a)
}

export const extractCandidates = (entries: suspendedCandidateEntry[]): SuspendedCandidate[] => {
  return entries
    .filter(([{ args: [accountId] }, opt]) => opt.isSome && accountId)
    .map(([{ args: [accountId] }, opt]) => {
      const [balance, bid] = opt.unwrap()

      return { accountId, balance, bid }
    })
    .sort((a, b) => a.balance.cmp(b.balance))
}