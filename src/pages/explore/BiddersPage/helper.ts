import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import BN from 'bn.js'
import { doTx } from '../../../helpers/extrinsics'

const waitingText = 'Request sent. Waiting for response...'

export const unbid = async (
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise', any>,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Bid removed successfully. You became Human again.'

  await doTx(api, tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const unvouch = async (
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise', any>,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Vouch removed successfully.'

  await doTx(api, tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const bid = async (
  tx: SubmittableExtrinsic<'promise', any>,
  api: ApiPromise,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Bid submitted successfully. You are now a Bidder!'

  await doTx(api, tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const vouch = async (
  tx: SubmittableExtrinsic<'promise', any>,
  api: ApiPromise,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Vouch submitted successfully.'

  await doTx(api, tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const BNtoNumber = (bn: BN) => {
  try {
    return bn.toNumber()
  } catch (error) {
    return -1
  }
}
