import type { DeriveAccountRegistration } from '@polkadot/api-derive/types'
import type { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { usePeople, PeopleApiState } from '../people/PeopleContext'

export function useAccountIdentity(accountId: AccountId | string): DeriveAccountRegistration | null {
  const { peopleApi, peopleApiState } = usePeople()
  const [identity, setIdentity] = useState<DeriveAccountRegistration | null>(null)

  useEffect(() => {
    if (!peopleApi || peopleApiState !== PeopleApiState.ready || !accountId) return

    let cancelled = false
    let unsubscribe: (() => void) | undefined

    const subscribe = async () => {
      const unsub = await peopleApi.derive.accounts.identity(accountId, (value) => {
        if (!cancelled) setIdentity(value)
      })

      if (cancelled) unsub()
      else unsubscribe = unsub
    }

    subscribe()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [peopleApi, peopleApiState, accountId])

  return identity
}
