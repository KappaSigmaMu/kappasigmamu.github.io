import type { ApiPromise } from '@polkadot/api'
import type { DeriveAccountRegistration } from '@polkadot/api-derive/types'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { FaCircleCheck, FaCircleMinus } from 'react-icons/fa6'
import { styled } from 'styled-components'
import { truncateMiddle } from '../helpers/truncate'

const AccountIdentity = ({
  accountId,
  api,
  hideNotSet
}: {
  accountId: AccountId
  api: ApiPromise
  hideNotSet?: boolean
}) => {
  const [id, setId] = useState<string>('')
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    api.derive.accounts.identity(accountId, (identity: DeriveAccountRegistration) => {
      identity.display && setId(identity.display)
      identity.judgements.length > 0 && setVerified(true)
    })
  }, [])

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
