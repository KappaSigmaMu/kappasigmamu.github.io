import { Button } from 'react-bootstrap'
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6'
import { styled } from 'styled-components'
import { LoadingSpinner } from '../pages/explore/components/LoadingSpinner'

type IconButtonProps = {
  onClick: () => any
  icon: string
  disabled: boolean
  loading: boolean
}

function IconButton({ onClick, icon, disabled, loading }: IconButtonProps) {
  if (loading)
    return (
      <div className="mx-2">
        <LoadingSpinner center={true} small={true} />
      </div>
    )

  return (
    <Button disabled={disabled} variant="link" onClick={onClick} size="sm">
      {icon === 'approve' ? <StyledApproveIcon size={20} /> : <StyledRejectIcon size={20} />}
    </Button>
  )
}

const StyledApproveIcon = styled(FaCircleCheck)`
  flex-shrink: 0;

  & path {
    fill: ${(props) => props.theme.colors.success};
  }
`

const StyledRejectIcon = styled(FaCircleXmark)`
  flex-shrink: 0;

  & path {
    fill: ${(props) => props.theme.colors.danger};
  }
`

export { IconButton }
