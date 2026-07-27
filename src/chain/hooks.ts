import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import type { Observable } from 'rxjs'

export type ChainRequestState<T> = {
  data: T | undefined
  error: Error | null
  isLoading: boolean
  refetch: () => void
}

const asError = (error: unknown): Error => (error instanceof Error ? error : new Error(String(error)))

export function useChainQuery<T>(query: () => Promise<T> | undefined, deps: DependencyList): ChainRequestState<T> {
  const queryRef = useRef(query)
  queryRef.current = query
  const [reload, setReload] = useState(0)
  const [state, setState] = useState<Omit<ChainRequestState<T>, 'refetch'>>({
    data: undefined,
    error: null,
    isLoading: true
  })

  const refetch = useCallback(() => setReload((value) => value + 1), [])

  useEffect(() => {
    let cancelled = false
    let request: Promise<T> | undefined

    try {
      request = queryRef.current()
    } catch (error: unknown) {
      setState({ data: undefined, error: asError(error), isLoading: false })
      return () => {
        cancelled = true
      }
    }

    if (!request) {
      setState({ data: undefined, error: null, isLoading: false })
      return () => {
        cancelled = true
      }
    }

    setState((previous) => ({ ...previous, error: null, isLoading: true }))
    request
      .then((data) => {
        if (!cancelled) setState({ data, error: null, isLoading: false })
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: undefined, error: asError(error), isLoading: false })
      })

    return () => {
      cancelled = true
    }
  }, [reload, ...deps])

  return { ...state, refetch }
}

export function useChainSub<T>(subscribe: () => Observable<T> | undefined, deps: DependencyList): ChainRequestState<T> {
  const subscribeRef = useRef(subscribe)
  subscribeRef.current = subscribe
  const [reload, setReload] = useState(0)
  const [state, setState] = useState<Omit<ChainRequestState<T>, 'refetch'>>({
    data: undefined,
    error: null,
    isLoading: true
  })

  const refetch = useCallback(() => setReload((value) => value + 1), [])

  useEffect(() => {
    let observable: Observable<T> | undefined

    try {
      observable = subscribeRef.current()
    } catch (error: unknown) {
      setState({ data: undefined, error: asError(error), isLoading: false })
      return undefined
    }

    if (!observable) {
      setState({ data: undefined, error: null, isLoading: false })
      return undefined
    }

    setState((previous) => ({ ...previous, error: null, isLoading: true }))
    const subscription = observable.subscribe({
      next: (data) => setState({ data, error: null, isLoading: false }),
      error: (error: unknown) => setState({ data: undefined, error: asError(error), isLoading: false })
    })

    return () => subscription.unsubscribe()
  }, [reload, ...deps])

  return { ...state, refetch }
}
