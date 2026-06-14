import type { AccountId } from '@polkadot/types/interfaces'
import { FaCircleCheck, FaCircleMinus } from 'react-icons/fa6'
import { styled } from 'styled-components'
import { truncateMiddle } from '../helpers/truncate'
import { useAccountIdentity } from '../hooks/useAccountIdentity'

const AccountIdentity = ({
  accountId,
  hideNotSet
}: {
  accountId: AccountId
  hideNotSet?: boolean
}) => {
  const identity = useAccountIdentity(accountId)
  const display = identity?.display
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
  return <>{truncateMiddle(accountId?.toString(), 20)}</>
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
