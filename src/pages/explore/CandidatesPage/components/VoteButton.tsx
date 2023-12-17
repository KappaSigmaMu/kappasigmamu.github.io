import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { useState } from 'react'
import { IconButton } from '../../../../components/IconButton'
import { doTx, StatusChangeHandler } from '../../../../helpers/extrinsitcs'
import { LoadingSpinner } from '../../components/LoadingSpinner'

type VoteButtonProps = {
  api: ApiPromise
  vote: Vote
  showMessage: (args: ShowMessageArgs) => any
  icon: string
  successText: string
  waitingText: string
  children: JSX.Element
}

export interface ShowMessageArgs {
  success: boolean
  message: string
}

export interface Vote {
  approve: boolean
  candidateId: AccountId
  voterAccount: accountType
}

export function VoteButton({ api, vote, showMessage, icon, successText, waitingText, children }: VoteButtonProps) {
  const [loading, setLoading] = useState(false)

  const onStatusChange: StatusChangeHandler = ({ loading, message, success }) => {
    setLoading(loading)
    showMessage({ success, message })
  }

  const handleVote = async () => {
    setLoading(true)
    try {
      await doTx(
        api.tx.society.vote(vote.candidateId, vote.approve),
        successText,
        waitingText,
        vote.voterAccount,
        onStatusChange
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner center={false} />

  return (
    <IconButton icon={icon} onClick={handleVote}>
      <u>{children}</u>
    </IconButton>
  )
}
