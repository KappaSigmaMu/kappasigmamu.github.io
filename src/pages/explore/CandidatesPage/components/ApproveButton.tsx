import { ApiPromise } from "@polkadot/api"
import { AccountId } from "@polkadot/types/interfaces"
import { useState } from "react"
import { IconButton } from "../../../../components/IconButton"
import { doTx, StatusChangeHandler } from "../../../../helpers/extrinsitcs"
import ApproveIcon from "../../../../static/approve-icon.svg"
import { LoadingSpinner } from "../../components/LoadingSpinner"

type ApproveButtonProps = {
  api: ApiPromise,
  activeAccount: accountType,
  candidateId: AccountId,
  showMessage: (args: ShowMessageArgs) => any
}

type ShowMessageArgs = {
  success: boolean,
  message: string
}

export function ApproveButton({ api, activeAccount, candidateId, showMessage }: ApproveButtonProps) {
  const [loading, setLoading] = useState(false)

  const onStatusChange: StatusChangeHandler = ({ loading, message, success }) => {
    setLoading(loading)
    showMessage({ success, message })
  }

  const handleApprove = async () => {
    setLoading(true)
    try {
      await doTx(
        api.tx.society.vote(candidateId, true),
        'Approval vote sent.',
        'Approval vote request sent. Waiting for response...',
        activeAccount,
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
    <IconButton icon={ApproveIcon} onClick={handleApprove}>
      <u>Approve</u>
    </IconButton>
  )
}
