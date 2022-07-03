import { ApiPromise } from "@polkadot/api"
import { Data } from "@polkadot/types"
import { AccountId } from "@polkadot/types/interfaces"
import "@polkadot/api-augment/substrate"
import { PalletIdentityIdentityInfo } from "@polkadot/types/lookup"
import { u8aToBuffer } from "@polkadot/util"

export async function fetchMemberDetails(
  api: ApiPromise, 
  accountId: AccountId
): Promise<SocietyMemberDetails> {
  const [accountInfo, maybeIdentity] = await Promise.all([
    api.derive.accounts.info(accountId),
    api.query.identity.identityOf(accountId)
  ])

  const identity = maybeIdentity.isSome 
    ? buildSocietyMemberIdentity(maybeIdentity.unwrap().info) 
    : undefined
  
  const rawIndex = accountInfo?.accountIndex
  const index = rawIndex 
    ? api.registry.createType('AccountIndex', rawIndex.toNumber()).toString() 
    : undefined

  return { accountId, identity, index }
}

function buildSocietyMemberIdentity(
  identityInfo: PalletIdentityIdentityInfo
): SocietyMemberIdentity {
  return {
    name: decode(identityInfo.display) ?? '(Unable to get name)',
    email: decode(identityInfo.email),
    legal: decode(identityInfo.legal),
    riot: decode(identityInfo.riot),
    twitter: decode(identityInfo.twitter),
    webpage: decode(identityInfo.web),
  }
}

const decode = (data: Data) => 
  data.isEmpty ? undefined : u8aToBuffer(data.toU8a()).toString()
