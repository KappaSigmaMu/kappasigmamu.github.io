import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { web3FromAddress } from '@polkadot/extension-dapp'

export type StatusChangeHandler = (info: StatusChangeInfo) => any

export interface StatusChangeInfo {
  loading: boolean
  message: string
  status: 'loading' | 'success' | 'error'
}

export const doTx = async (
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise', any>,
  finalizedText: string,
  waitingText: string,
  activeAccount: accountType,
  onStatusChange: StatusChangeHandler
) => {
  onStatusChange({ loading: true, message: 'Awaiting signature...', status: 'loading' })

  let injector = null
  try {
    injector = await web3FromAddress(activeAccount.address)
  } catch (e) {
    console.error(e)
    onStatusChange({ loading: false, message: 'Error connecting to wallet', status: 'error' })
    return
  }

  let done = false
  let hasError = false

  type signAndSendProp = { status: any; events: [] }

  tx.signAndSend(activeAccount.address, { signer: injector.signer }, ({ status, events }: signAndSendProp) => {
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

    if (status.isInBlock) {
      onStatusChange({ loading: false, message: finalizedText, status: 'success' })
      done = true
    } else if (!done) {
      onStatusChange({ loading: true, message: waitingText, status: 'success' })
    }
  }).catch((err: Error) => {
    onStatusChange({ loading: false, message: err.message, status: 'error' })
  })
}
