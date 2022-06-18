import { ApiPromise } from "@polkadot/api"
import { Data } from "@polkadot/types"
import { AccountId } from "@polkadot/types/interfaces"
import { PalletIdentityIdentityInfo, PalletIdentityRegistration } from "@polkadot/types/lookup"

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
    
  return {
    accountId,
    identity,
    index: accountInfo.accountIndex?.toHuman()
  }
}

function buildSocietyMemberIdentity(
  identityInfo: PalletIdentityIdentityInfo
): SocietyMemberIdentity {
  return {
    email: identityInfo.email.value.toHuman()?.toString(),
    name: identityInfo.display.value.toHuman()?.toString() ?? '(Unable to get name)',
    riot: identityInfo.riot.value.toHuman()?.toString(),
    twitter: identityInfo.twitter.value.toHuman()?.toString(),
    webpage: identityInfo.web.value.toHuman()?.toString(),
  }
}
