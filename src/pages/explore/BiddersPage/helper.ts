import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import BN from 'bn.js'
import { doTx } from '../../../helpers/extrinsics'

export const unbid = async (
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise', any>,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Bid removed successfully. You became Human again.'
  const waitingText = 'Unbid request sent. Waiting for response...'

  await doTx(api, tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const unvouch = async (
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise', any>,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Vouch removed successfully.'
  const waitingText = 'Unvouch request sent. Waiting for response...'

  await doTx(api, tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const bid = async (
  tx: SubmittableExtrinsic<'promise', any>,
  api: ApiPromise,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Bid submitted successfully. You are now a Bidder!'
  const waitingText = 'Bid request sent. Waiting for response...'

  await doTx(api, tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const vouch = async (
  tx: SubmittableExtrinsic<'promise', any>,
  api: ApiPromise,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Vouch submitted successfully.'
  const waitingText = 'Vouch request sent. Waiting for response...'

  await doTx(api, tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const BNtoNumber = (bn: BN) => {
  try {
    return bn.toNumber()
  } catch (error) {
    return -1
  }
}
