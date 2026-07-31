import type { AssetHubApi } from './client'
import { accountIndexToString, isSameAddress } from './ss58'
import type { AccountId } from './types'

export type IndexAssignment = {
  owner: string
  deposit: bigint
  frozen: boolean
}

/** Map of claimed index ID → assignment details. */
export type ClaimedIndices = Map<number, IndexAssignment>

const cache = new WeakMap<object, Promise<ClaimedIndices>>()

export function clearIndicesCache(api: AssetHubApi): void {
  cache.delete(api)
}

export function getClaimedIndices(api: AssetHubApi): Promise<ClaimedIndices> {
  const cached = cache.get(api)
  if (cached) return cached

  const request = api.query.Indices.Accounts.getEntries().then((entries) => {
    const result: ClaimedIndices = new Map()
    entries.forEach(({ keyArgs: [index], value }) => {
      const [owner, deposit, frozen] = value
      result.set(index, { owner, deposit, frozen })
    })
    return result
  })
  cache.set(api, request)
  return request
}

/** Address → numeric index (one entry per owner; last wins if multiple). */
export function getIndices(api: AssetHubApi): Promise<Map<string, number>> {
  return getClaimedIndices(api).then((claimed) => {
    const result = new Map<string, number>()
    claimed.forEach((assignment, index) => result.set(assignment.owner, index))
    return result
  })
}

export async function getAccountIndex(api: AssetHubApi, accountId: AccountId): Promise<string | undefined> {
  const indices = await getIndices(api)
  const entry = [...indices.entries()].find(([address]) => isSameAddress(address, accountId))
  return entry ? accountIndexToString(entry[1]) : undefined
}

export function claimIndexTx(api: AssetHubApi, index: number) {
  return api.tx.Indices.claim({ index })
}

export function freezeIndexTx(api: AssetHubApi, index: number) {
  return api.tx.Indices.freeze({ index })
}

export function freeIndexTx(api: AssetHubApi, index: number) {
  return api.tx.Indices.free({ index })
}

export function getIndexDeposit(api: AssetHubApi): Promise<bigint> {
  return api.constants.Indices.Deposit()
}

export const INDICES_PAGE_SIZE = 100

export function pageRange(page: number, pageSize = INDICES_PAGE_SIZE): { start: number; end: number } {
  const start = Math.max(0, page) * pageSize
  return { start, end: start + pageSize - 1 }
}
