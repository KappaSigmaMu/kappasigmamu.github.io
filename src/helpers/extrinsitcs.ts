import { SubmittableExtrinsic } from "@polkadot/api/types"
import { web3FromAddress } from "@polkadot/extension-dapp"

export type StatusChangeHandler = (info: StatusChangeInfo) => any

export interface StatusChangeInfo {
  loading: boolean,
  message: string,
  success: boolean
}

export const doTx = async (
  tx: SubmittableExtrinsic<"promise", any>,
  finalizedText: string,
  waitingText: string,
  activeAccount: accountType,
  onStatusChange: StatusChangeHandler,
) => {
  let injector = null
  try {
    injector = await web3FromAddress(activeAccount.address)
  } catch (e) {
    console.error(e)
    onStatusChange({ loading: false, message: "Error connecting to wallet", success: false })
    return
  }

  let done = false

  tx.signAndSend(activeAccount.address, { signer: injector.signer }, ({ status }: { status: any }) => {
    if (status.isInBlock) {
      onStatusChange({ loading: false, message: finalizedText, success: true })
      done = true
    } else if (!done) {
      onStatusChange({ loading: true, message: waitingText, success: true })
    }
  }).catch((err: Error) => {
    onStatusChange({ loading: false, message: err.message, success: false })
  })
}
