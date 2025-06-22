import { ApiPromise } from '@polkadot/api'
import { WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaMoneyBillTransfer } from 'react-icons/fa6'
import { styled } from 'styled-components'
import { doTx, StatusChangeHandler } from '../../../../helpers/extrinsics'
import { LoadingSpinner } from '../../components/LoadingSpinner'

type ClaimPayoutButtonProps = {
  api: ApiPromise
  activeAccount: WalletAccount | undefined
  showMessage: (args: ExtrinsicResult) => any
  handleUpdate: () => void
  disabled: boolean
}

export function ClaimPayoutButton({ api, activeAccount, disabled, showMessage, handleUpdate }: ClaimPayoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const onStatusChange: StatusChangeHandler = ({ loading, message, status }) => {
    loading !== undefined && setLoading(loading)
    showMessage({ status, message })
    handleUpdate()
  }

  const handleClaimPayout = async () => {
    if (!activeAccount) {
      showMessage({ status: 'error', message: 'No wallet connected' })
      return
    }

    setLoading(true)
    try {
      const extrinsic = api.tx.society.payout()
      const successText = 'Payout claimed successfully!'
      const waitingText = 'Request sent. Waiting for response...'

      await doTx(api, extrinsic, successText, waitingText, activeAccount, onStatusChange)
    } catch (e) {
      console.error(e)
      showMessage({ status: 'error', message: 'Failed to claim payout' })
    }
  }

  if (loading)
    return (
      <span className="mx-2">
        <LoadingSpinner center={false} small={true} />
      </span>
    )

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="claim-payout-tooltip">Claim your matured payout from the society.</Tooltip>}
    >
      <Button disabled={disabled} variant="link" onClick={handleClaimPayout} size="sm" className="p-2">
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
