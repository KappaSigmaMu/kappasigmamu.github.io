import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { WalletAccount } from '@talismn/connect-wallets'
import { doTx } from '../../../helpers/extrinsics'

const waitingText = 'Request sent. Waiting for response...'

export const payout = async (
  tx: SubmittableExtrinsic<'promise', any>,
  api: ApiPromise,
  activeAccount: WalletAccount | undefined,
  onStatusChange: any
) => {
  const finalizedText = 'Payout submitted successfully.'

  await doTx(api, tx, finalizedText, waitingText, activeAccount, onStatusChange)
}
