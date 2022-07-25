import { ApiPromise } from "@polkadot/api"
import { AccountId } from "@polkadot/types/interfaces"
import { useState } from "react"
import { IconButton } from "../../../../components/IconButton"
import { doTx, StatusChangeHandler } from "../../../../helpers/extrinsitcs"
import RejectIcon from "../../../../static/reject-icon.svg"
import { LoadingSpinner } from "../../components/LoadingSpinner"

type RejectButtonProps = {
  api: ApiPromise,
  activeAccount: accountType,
  candidateId: AccountId,
  showMessage: (args: ShowMessageArgs) => any
}

type ShowMessageArgs = {
  success: boolean,
  message: string
}

export function RejectButton({ api, activeAccount, candidateId, showMessage }: RejectButtonProps) {
  const [loading, setLoading] = useState(false)

  const onStatusChange: StatusChangeHandler = ({ loading, message, success }) => {
    setLoading(loading)
    showMessage({ success, message })
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await doTx(
        api.tx.society.vote(candidateId, false),
        'Rejection vote sent.',
        'Rejection vote request sent. Waiting for response...',
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
    <IconButton icon={RejectIcon} onClick={handleReject}>
      <u>Reject</u>
    </IconButton>
  )
}
