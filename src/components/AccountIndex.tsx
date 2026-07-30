import { useEffect } from 'react'
import { useAssetHub } from '@/chain/ChainProvider'
import { useChainQuery } from '@/chain/hooks'
import { getAccountIndex } from '@/chain/indices'
import type { AccountId } from '@/chain/types'

const AccountIndex = ({
  accountId,
  callback,
  api: _api
}: {
  accountId: AccountId | string
  callback?: (data: string) => void
  api?: unknown
}) => {
  const { api } = useAssetHub()
  const state = useChainQuery(() => (api ? getAccountIndex(api, accountId as AccountId) : undefined), [api, accountId])
  const index = state.data ?? ''

  useEffect(() => {
    if (index) callback?.(index)
  }, [callback, index])

  return <>{index}</>
}

export { AccountIndex }
