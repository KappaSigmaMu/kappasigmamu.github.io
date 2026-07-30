import { FaCircleCheck, FaCircleMinus } from 'react-icons/fa6'
import { styled } from 'styled-components'
import type { AccountId } from '@/chain/types'
import { truncateMiddle } from '@/helpers/truncate'
import { useAccountIdentity } from '@/hooks/useAccountIdentity'

const AccountIdentity = ({
  accountId,
  hideNotSet,
  truncateLength = 20
}: {
  accountId: AccountId | string
  hideNotSet?: boolean
  truncateLength?: number
}) => {
  const identity = useAccountIdentity(accountId)
  const display = identity?.info.display
  const isVerified = Boolean(identity?.judgements.length)

  const verifiedBadge = isVerified ? (
    <StyledVerifiedBadge className="me-2" />
  ) : (
    <StyledUnverifiedBadge className="me-2" />
  )

  if (!display && hideNotSet) return <></>
  if (display)
    return (
      <div className="d-flex align-items-center justify-content-center justify-content-lg-start">
        {verifiedBadge}
        {display}
      </div>
    )
  return <>{truncateMiddle(accountId?.toString(), truncateLength)}</>
}

const StyledVerifiedBadge = styled(FaCircleCheck)`
  flex-shrink: 0;
  & path {
    fill: ${(props) => props.theme.colors.secondary};
  }
`

const StyledUnverifiedBadge = styled(FaCircleMinus)`
  flex-shrink: 0;
  & path {
    fill: ${(props) => props.theme.colors.lightGrey};
  }
`

export { AccountIdentity }
