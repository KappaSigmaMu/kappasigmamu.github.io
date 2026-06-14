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
  const id = identity?.display ?? ''
  const verified = (identity?.judgements.length ?? 0) > 0

  const verifiedBadge = verified ? <StyledVerifiedBadge className="me-2" /> : <StyledUnverifiedBadge className="me-2" />

  if (!id && hideNotSet) return <></>
  if (id)
    return (
      <div className="d-flex align-items-center justify-content-center justify-content-lg-start">
        {verifiedBadge}
        {id}
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
