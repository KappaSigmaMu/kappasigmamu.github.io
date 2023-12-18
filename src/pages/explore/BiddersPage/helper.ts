import { SubmittableExtrinsic } from '@polkadot/api/types'
import BN from 'bn.js'
import { doTx } from '../../../helpers/extrinsitcs'

export const unbid = async (
  tx: SubmittableExtrinsic<'promise', any>,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Bid removed successfully. You became Human again'
  const waitingText = 'Unbid request sent. Waiting for response...'

  await doTx(tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const unvouch = async (
  tx: SubmittableExtrinsic<'promise', any>,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Vouch removed successfully.'
  const waitingText = 'Unvouch request sent. Waiting for response...'

  await doTx(tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const bid = async (
  tx: SubmittableExtrinsic<'promise', any>,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Bid submitted successfully. You are now a Bidder'
  const waitingText = 'Bid request sent. Waiting for response...'

  await doTx(tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const vouch = async (
  tx: SubmittableExtrinsic<'promise', any>,
  activeAccount: accountType,
  onStatusChange: any
) => {
  const finalizedText = 'Vouch submitted successfully.'
  const waitingText = 'Vouch request sent. Waiting for response...'

  await doTx(tx, finalizedText, waitingText, activeAccount, onStatusChange)
}

export const BNtoNumber = (bn : BN) => {
  try {
    return bn.toNumber()
  } catch (error) {
    return -1
  }
}
