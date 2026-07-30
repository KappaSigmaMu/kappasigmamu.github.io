import { Button } from 'react-bootstrap'
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa6'
import { styled } from 'styled-components'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'

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
    <VoteIconButton
      aria-label={icon === 'approve' ? 'Approve' : 'Reject'}
      variant="link"
      size="sm"
      {...buttonProps}
    >
      {icon === 'approve' ? <StyledApproveIcon size={20} /> : <StyledRejectIcon size={20} />}
    </VoteIconButton>
  )
}

const VoteIconButton = styled(Button)`
  display: inline-grid;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  place-items: center;
  background: transparent;
  box-shadow: none;
  line-height: 1;
  vertical-align: middle;

  svg {
    display: block;
  }

  &:hover,
  &:focus,
  &:active {
    border: 0;
    background: transparent !important;
    box-shadow: none !important;
  }
`

const StyledApproveIcon = styled(FaThumbsUp)`
  flex-shrink: 0;

  & path {
    fill: ${(props) => props.theme.colors.success};
  }
`

const StyledRejectIcon = styled(FaThumbsDown)`
  flex-shrink: 0;

  & path {
    fill: ${(props) => props.theme.colors.danger};
  }
`

export { IconButton }
