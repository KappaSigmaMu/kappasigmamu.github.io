import { ApiPromise } from "@polkadot/api"
import { AccountId } from "@polkadot/types/interfaces"

export async function fetchMemberDetails(
  api: ApiPromise, 
  accountId: AccountId
): Promise<SocietyMemberDetails> {
  // TODO: fetch and add more details
  const accountInfo = await api.derive.accounts.info(accountId)
  return {
    accountId,
    index: accountInfo.accountIndex?.toHuman()
  }
}
