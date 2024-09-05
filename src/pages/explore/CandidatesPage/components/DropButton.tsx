import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaUserXmark } from 'react-icons/fa6'
import { styled } from 'styled-components'
import { doTx, StatusChangeHandler } from '../../../../helpers/extrinsics'
import { LoadingSpinner } from '../../components/LoadingSpinner'

type DropButtonProps = {
  api: ApiPromise
  drop: Drop
  showMessage: (args: ExtrinsicResult) => any
  handleUpdate: () => void
  successText: string
  waitingText: string
  disabled: boolean
}

export interface Drop {
  accountId: AccountId
  callerAccount: WalletAccount
}

export function DropButton({
  api,
  drop,
  disabled,
  showMessage,
  handleUpdate,
  successText,
  waitingText
}: DropButtonProps) {
  const [loading, setLoading] = useState(false)

  const onStatusChange: StatusChangeHandler = ({ loading, message, status }) => {
    loading !== undefined && setLoading(loading)
    showMessage({ status, message })
    handleUpdate()
  }

  const extrinsic = api.tx.society.dropCandidate(drop.accountId)

  const handleDrop = async () => {
    setLoading(true)
    try {
      await doTx(api, extrinsic, successText, waitingText, drop.callerAccount, onStatusChange)
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

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="button-tooltip">
          This candidate can be dropped, this action will remove the candidate from the list.
        </Tooltip>
      }
    >
      <Button disabled={disabled} variant="link" onClick={handleDrop}>
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
