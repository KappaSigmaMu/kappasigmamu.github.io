import { MultiAddress } from '@polkadot-api/descriptors'
import type { WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { useAccount } from '../../../../account/AccountContext'
import { useAssetHub } from '../../../../chain/ChainProvider'
import { submitTx, type StatusChangeHandler } from '../../../../chain/society/tx'
import type { AccountId, ExtrinsicResult } from '../../../../chain/types'
import { IconButton } from '../../../../components/IconButton'

type VoteButtonProps = {
  vote: Vote
  showMessage: (args: ExtrinsicResult) => void
  icon: string
  handleUpdate: () => void
  successText: string
  waitingText: string
} & React.ComponentProps<typeof Button>

export interface Vote {
  approve: boolean
  accountId: AccountId
  voterAccount: WalletAccount
  type: string
}

export function VoteButton({
  vote,
  disabled,
  showMessage,
  icon,
  handleUpdate,
  successText,
  waitingText,
  ...buttonProps
}: VoteButtonProps) {
  const { api } = useAssetHub()
  const { polkadotSigner } = useAccount()
  const [loading, setLoading] = useState(false)
  const onStatusChange: StatusChangeHandler = ({ loading: nextLoading, message, status }) => {
    setLoading(Boolean(nextLoading))
    showMessage({ status, message })
    handleUpdate()
  }

  const handleVote = async () => {
    if (!api) return
    const tx =
      vote.type === 'candidate'
        ? api.tx.Society.vote({ candidate: MultiAddress.Id(vote.accountId), approve: vote.approve })
        : api.tx.Society.defender_vote({ approve: vote.approve })
    try {
      await submitTx(tx, polkadotSigner, { finalizedText: successText, waitingText, onStatusChange })
    } catch (error) {
      console.error(error)
    }
  }

  return <IconButton disabled={disabled} loading={loading} icon={icon} onClick={handleVote} {...buttonProps} />
}
