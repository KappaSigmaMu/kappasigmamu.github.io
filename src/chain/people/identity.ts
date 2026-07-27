import { createIdentitySdk, type Identity } from '@polkadot-api/sdk-accounts'
import type { PeopleApi } from '../client'
import type { AccountId } from '../types'

let sdkApi: PeopleApi | null = null
let sdk: ReturnType<typeof createIdentitySdk> | null = null

function getSdk(api: PeopleApi) {
  if (sdkApi !== api || !sdk) {
    sdkApi = api
    sdk = createIdentitySdk(api)
  }
  return sdk
}

export const getIdentity = (api: PeopleApi, accountId: AccountId): Promise<Identity | null> =>
  getSdk(api).getIdentity(accountId)

export const getIdentities = (api: PeopleApi, accountIds: AccountId[]): Promise<Record<string, Identity | null>> =>
  getSdk(api).getIdentities(accountIds)
