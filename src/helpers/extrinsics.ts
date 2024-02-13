import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { WalletAccount } from '@talismn/connect-wallets'
// import { wallets } from './wallets'

export type StatusChangeHandler = (info: ExtrinsicResult) => any

export const doTx = async (
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise', any>,
  finalizedText: string,
  waitingText: string,
  activeAccount: WalletAccount | undefined,
  onStatusChange: StatusChangeHandler
) => {
  if (!activeAccount) {
    onStatusChange({ loading: false, message: 'No wallet connected', status: 'error' })
    return
  }

  onStatusChange({ loading: true, message: 'Awaiting signature...', status: 'loading' })

  let signer = undefined
  if (activeAccount?.signer) {
    signer = activeAccount.signer
  }

  let done = false
  let hasError = false

  type signAndSendProp = { status: any; events: [] }

  tx.signAndSend(activeAccount!.address, { signer }, ({ status, events }: signAndSendProp) => {
    if (status.isInBlock) {
      onStatusChange({ loading: false, message: 'Transaction submitted.', status: 'success' })
    }

    events.map((event) => {
      const error = event?.['event']?.['data']?.[0] as any

      if (error?.isModule) {
        const decoded = api!.registry.findMetaError(error.asModule)
        const { docs, method, section } = decoded

        onStatusChange({ loading: false, message: `${section}.${method}: ${docs.join(' ')}`, status: 'error' })
        hasError = true
      }
    })

    if (hasError) return

    if (status.isFinalized) {
      onStatusChange({ loading: false, message: finalizedText, status: 'success' })
      done = true
    }

    if (!done) {
      onStatusChange({ loading: true, message: waitingText, status: 'loading' })
    }
  }).catch((err: Error) => {
    onStatusChange({ loading: false, message: err.message, status: 'error' })
  })
}
