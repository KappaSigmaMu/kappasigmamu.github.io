import type { AssetHubApi } from './client'
import { accountIndexToString, isSameAddress } from './ss58'
import type { AccountId } from './types'

const cache = new WeakMap<object, Promise<Map<string, number>>>()

export function getIndices(api: AssetHubApi): Promise<Map<string, number>> {
  const cached = cache.get(api)
  if (cached) return cached

  const request = api.query.Indices.Accounts.getEntries().then((entries) => {
    const result = new Map<string, number>()
    entries.forEach(({ keyArgs: [index], value }) => result.set(value[0], index))
    return result
  })
  cache.set(api, request)
  return request
}

export async function getAccountIndex(api: AssetHubApi, accountId: AccountId): Promise<string | undefined> {
  const indices = await getIndices(api)
  const entry = [...indices.entries()].find(([address]) => isSameAddress(address, accountId))
  return entry ? accountIndexToString(entry[1]) : undefined
}
