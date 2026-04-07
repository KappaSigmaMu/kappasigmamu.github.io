import { Button } from 'react-bootstrap'
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6'
import { styled } from 'styled-components'
import { LoadingSpinner } from '../pages/explore/components/LoadingSpinner'

type IconButtonProps = {
  icon: string
  loading: boolean
} & React.ComponentProps<typeof Button>

function IconButton({ icon, loading, ...buttonProps }: IconButtonProps) {
  if (loading)
    return (
      <div className="mx-2">
        <LoadingSpinner center={true} small={true} />
      </div>
    )

  return (
    <Button variant="link" size="sm" {...buttonProps}>
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
