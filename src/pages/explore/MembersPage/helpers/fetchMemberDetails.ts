import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import '@polkadot/api-augment/substrate'
import { buildAccountIdentity } from '../../../../helpers/buildAccountIdentity'

export async function fetchMemberDetails(
  api: ApiPromise,
  peopleApi: ApiPromise | null,
  accountId: AccountId
): Promise<SocietyMemberDetails> {
  const accountInfo = await api.derive.accounts.info(accountId)

  let identity: AccountIdentity | undefined
  if (peopleApi) {
    const registration = await peopleApi.derive.accounts.identity(accountId)
    identity = buildAccountIdentity(registration)
  }

  const rawIndex = accountInfo?.accountIndex
  const index = rawIndex ? api.registry.createType('AccountIndex', rawIndex.toNumber()).toString() : undefined

  return { accountId, identity, index }
}
