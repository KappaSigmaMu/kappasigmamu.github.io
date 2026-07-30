import type { WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaMoneyBillTransfer } from 'react-icons/fa6'
import { styled } from 'styled-components'
import { useAccount } from '@/account/AccountContext'
import { useAssetHub } from '@/chain/ChainProvider'
import { submitTx, type StatusChangeHandler } from '@/chain/society/tx'
import type { ExtrinsicResult } from '@/chain/types'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'

type Props = {
  activeAccount: WalletAccount | undefined
  showMessage: (args: ExtrinsicResult) => void
  handleUpdate: () => void
} & React.ComponentProps<typeof Button>

export function ClaimPayoutButton({ activeAccount: _activeAccount, showMessage, handleUpdate, ...buttonProps }: Props) {
  const { api } = useAssetHub()
  const { polkadotSigner } = useAccount()
  const [loading, setLoading] = useState(false)
  const onStatusChange: StatusChangeHandler = ({ loading: nextLoading, message, status }) => {
    setLoading(Boolean(nextLoading))
    showMessage({ status, message })
    handleUpdate()
  }
  const handleClaimPayout = async () => {
    if (!api) return
    try {
      await submitTx(api.tx.Society.payout(), polkadotSigner, {
        finalizedText: 'Payout claimed successfully!',
        onStatusChange
      })
    } catch (error) {
      console.error(error)
      showMessage({ status: 'error', message: 'Failed to claim payout' })
    }
  }
  if (loading)
    return (
      <span className="mx-2">
        <LoadingSpinner center={false} small />
      </span>
    )
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="claim-payout-tooltip">Claim your matured payout from the society.</Tooltip>}
    >
      <Button variant="link" onClick={handleClaimPayout} size="sm" className="p-2" {...buttonProps}>
        <StyledClaimIcon size={16} />
      </Button>
    </OverlayTrigger>
  )
}

const StyledClaimIcon = styled(FaMoneyBillTransfer)`
  flex-shrink: 0;
  & path {
    fill: ${(props) => props.theme.colors.white};
  }
`
