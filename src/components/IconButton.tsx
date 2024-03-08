import { Button } from 'react-bootstrap'
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6'
import { styled } from 'styled-components'

type IconButtonProps = {
  onClick: () => any
  icon: string
  disabled: boolean
}

function IconButton({ onClick, icon, disabled }: IconButtonProps) {
  return (
    <Button disabled={disabled} variant="link" onClick={onClick} className={icon === 'approve' ? 'p-0 pe-2' : 'p-0'}>
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
