import type { PolkadotSigner, Transaction, TxEvent } from 'polkadot-api'
import type { Observable, Subscription } from 'rxjs'

export type StatusChangeHandler = (info: ExtrinsicResult) => void

type ExtrinsicResult = {
  message: string
  status: 'success' | 'loading' | 'error'
  loading?: boolean
}

export type SubmitTxOptions = {
  finalizedText: string
  waitingText?: string
  onStatusChange: StatusChangeHandler
}

const errorText = (error: { type: string; value: unknown }): string => {
  const value = error.value
  const variant = value && typeof value === 'object' && 'type' in value ? String((value as { type: unknown }).type) : ''
  return `${error.type}${variant ? `.${variant}` : ''}`
}

export function submitTx(
  tx: Transaction,
  signer: PolkadotSigner | undefined,
  { finalizedText, waitingText = 'Request sent. Waiting for response...', onStatusChange }: SubmitTxOptions
): Promise<void> {
  if (!signer) {
    onStatusChange({ loading: false, message: 'No wallet connected', status: 'error' })
    return Promise.resolve()
  }

  onStatusChange({ loading: true, message: 'Awaiting signature...', status: 'loading' })

  return new Promise((resolve) => {
    let settled = false
    const subscriptionRef: { current?: Subscription } = {}
    const observable = tx.signSubmitAndWatch(signer) as Observable<TxEvent>

    const settle = () => {
      if (settled) return
      settled = true
      resolve()
      subscriptionRef.current?.unsubscribe()
    }

    subscriptionRef.current = observable.subscribe({
      next: (event) => {
        if (settled) return

        if (event.type === 'txBestBlocksState' && event.found) {
          if (event.ok) {
            onStatusChange({ loading: false, message: 'Transaction submitted.', status: 'success' })
          } else {
            const message = event.dispatchError ? errorText(event.dispatchError) : 'Transaction failed.'
            onStatusChange({ loading: false, message, status: 'error' })
          }
          settle()
          return
        }

        if (event.type === 'finalized') {
          if (event.ok) {
            onStatusChange({ loading: false, message: finalizedText, status: 'success' })
          } else {
            const message = event.dispatchError ? errorText(event.dispatchError) : 'Transaction failed.'
            onStatusChange({ loading: false, message, status: 'error' })
          }
          settle()
          return
        }

        onStatusChange({ loading: true, message: waitingText, status: 'loading' })
      },
      error: (error: unknown) => {
        if (settled) return
        console.error(error)
        const message = error instanceof Error ? error.message : String(error)
        onStatusChange({ loading: false, message, status: 'error' })
        settle()
      },
      complete: () => {
        settle()
      }
    })

    if (settled) subscriptionRef.current.unsubscribe()
  })
}
