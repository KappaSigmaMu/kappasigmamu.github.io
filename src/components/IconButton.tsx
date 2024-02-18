import { Button } from 'react-bootstrap'

type IconButtonProps = {
  onClick: () => any
  icon: string
  disabled: boolean
}

export function IconButton({ onClick, icon, disabled }: IconButtonProps) {
  return (
    <Button disabled={disabled} variant="link" onClick={onClick} style={{ paddingRight: '0.5em', paddingLeft: 0 }}>
      <img src={icon} />
    </Button>
  )
}
