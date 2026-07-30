import type { Identity } from '@polkadot-api/sdk-accounts'
import { usePeople, ChainState } from '@/chain/ChainProvider'
import { useChainQuery } from '@/chain/hooks'
import { getIdentity } from '@/chain/people/identity'
import type { AccountId } from '@/chain/types'

export function useAccountIdentity(accountId: AccountId | string): Identity | null {
  const { api, state } = usePeople()
  const identity = useChainQuery(
    () => (api && state === ChainState.ready && accountId ? getIdentity(api, accountId as AccountId) : undefined),
    [api, state, accountId]
  )

  return identity.data ?? null
}
