import type { PeopleApi, AssetHubApi } from '../../../../chain/client'
import { getAccountIndex } from '../../../../chain/indices'
import { getIdentity } from '../../../../chain/people/identity'
import type { AccountId, SocietyMemberDetails } from '../../../../chain/types'
import { buildAccountIdentity } from '../../../../helpers/buildAccountIdentity'

export async function fetchMemberDetails(api: AssetHubApi, peopleApi: PeopleApi | null, accountId: AccountId): Promise<SocietyMemberDetails> {
  const [index, identity] = await Promise.all([getAccountIndex(api, accountId), peopleApi ? getIdentity(peopleApi, accountId) : Promise.resolve(null)])
  return { accountId, identity: buildAccountIdentity(identity), index }
}
