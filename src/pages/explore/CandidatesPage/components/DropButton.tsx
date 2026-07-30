import type { WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaUserXmark } from 'react-icons/fa6'
import { styled } from 'styled-components'
import { useAccount } from '@/account/AccountContext'
import { useAssetHub } from '@/chain/ChainProvider'
import { submitTx, type StatusChangeHandler } from '@/chain/society/tx'
import type { AccountId, ExtrinsicResult } from '@/chain/types'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'

type DropButtonProps = {
  drop: Drop
  showMessage: (args: ExtrinsicResult) => void
  handleUpdate: () => void
  successText: string
  waitingText: string
} & React.ComponentProps<typeof Button>

export interface Drop {
  accountId: AccountId
  callerAccount: WalletAccount
}

export function DropButton({
  drop,
  disabled,
  showMessage,
  handleUpdate,
  successText,
  waitingText,
  ...buttonProps
}: DropButtonProps) {
  const { api } = useAssetHub()
  const { polkadotSigner, isSignerLoading } = useAccount()
  const [loading, setLoading] = useState(false)
  const onStatusChange: StatusChangeHandler = ({ loading: nextLoading, message, status }) => {
    setLoading(Boolean(nextLoading))
    showMessage({ status, message })
    handleUpdate()
  }
  const handleDrop = async () => {
    if (!api) return
    try {
      await submitTx(api.tx.Society.drop_candidate({ candidate: drop.accountId }), polkadotSigner, {
        finalizedText: successText,
        waitingText,
        onStatusChange
      })
    } catch (error) {
      console.error(error)
    }
  }
  if (loading || isSignerLoading)
    return (
      <div className="mx-2">
        <LoadingSpinner center={false} small />
      </div>
    )
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="button-tooltip">
          This candidate can be dropped, this action will remove the candidate from the list.
        </Tooltip>
      }
    >
      <Button
        disabled={disabled || !polkadotSigner}
        variant="link"
        onClick={handleDrop}
        size="sm"
        className="p-2"
        {...buttonProps}
      >
        <StyledDropIcon size={20} />
      </Button>
    </OverlayTrigger>
  )
}

const StyledDropIcon = styled(FaUserXmark)`
  flex-shrink: 0;
  & path {
    fill: ${(props) => props.theme.colors.white};
  }
`
