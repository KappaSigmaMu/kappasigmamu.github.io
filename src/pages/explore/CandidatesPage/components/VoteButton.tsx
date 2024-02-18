import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { IconButton } from '../../../../components/IconButton'
import { doTx, StatusChangeHandler } from '../../../../helpers/extrinsics'
import { LoadingSpinner } from '../../components/LoadingSpinner'

type VoteButtonProps = {
  api: ApiPromise
  vote: Vote
  showMessage: (args: ExtrinsicResult) => any
  icon: string
  handleUpdate: () => void
  successText: string
  waitingText: string
  disabled: boolean
}

export interface Vote {
  approve: boolean
  accountId: AccountId
  voterAccount: WalletAccount
  type: string
}

export function VoteButton({
  api,
  vote,
  disabled,
  showMessage,
  icon,
  handleUpdate,
  successText,
  waitingText
}: VoteButtonProps) {
  const [loading, setLoading] = useState(false)

  const onStatusChange: StatusChangeHandler = ({ loading, message, status }) => {
    loading !== undefined && setLoading(loading)
    showMessage({ status, message })
    handleUpdate()
  }

  const extrinsic =
    vote.type === 'candidate'
      ? api.tx.society.vote(vote.accountId, vote.approve)
      : api.tx.society.defenderVote(vote.approve)

  const handleVote = async () => {
    setLoading(true)
    try {
      await doTx(api, extrinsic, successText, waitingText, vote.voterAccount, onStatusChange)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <label style={{ paddingRight: '0.7em', paddingLeft: 0 }}>
        <LoadingSpinner center={false} small={true} />
      </label>
    )

  return <IconButton disabled={disabled} icon={icon} onClick={handleVote} />
}
