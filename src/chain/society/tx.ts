import type { PolkadotSigner } from 'polkadot-api'
import type { Transaction, TxEvent } from 'polkadot-api'
import type { Observable } from 'rxjs'

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

  return new Promise((resolve, reject) => {
    let settled = false
    const observable = tx.signSubmitAndWatch(signer) as Observable<TxEvent>

    observable.subscribe({
      next: (event) => {
        if (event.type === 'txBestBlocksState' && event.found && !event.ok) {
          const message = event.dispatchError ? errorText(event.dispatchError) : 'Transaction failed.'
          onStatusChange({ loading: false, message, status: 'error' })
          settled = true
          resolve()
          return
        }

        if (event.type === 'finalized') {
          if (event.ok) {
            onStatusChange({ loading: false, message: finalizedText, status: 'success' })
          } else {
            const message = event.dispatchError ? errorText(event.dispatchError) : 'Transaction failed.'
            onStatusChange({ loading: false, message, status: 'error' })
          }
          settled = true
          resolve()
          return
        }

        if (!settled && event.type !== 'signed') {
          onStatusChange({ loading: true, message: waitingText, status: 'loading' })
        }
      },
      error: (error: unknown) => {
        if (settled) return
        settled = true
        const message = error instanceof Error ? error.message : String(error)
        onStatusChange({ loading: false, message, status: 'error' })
        reject(error)
      },
      complete: () => {
        if (!settled) resolve()
      }
    })
  })
}
