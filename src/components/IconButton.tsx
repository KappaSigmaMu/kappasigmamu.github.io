import { Button } from 'react-bootstrap'

type IconButtonProps = {
  onClick: () => any
  icon: string
  children: JSX.Element
}

export function IconButton({ onClick, icon, children }: IconButtonProps) {
  return (
    <Button variant="link" onClick={onClick}>
      <img src={icon} className="me-2" />
      {children}
    </Button>
  )
}
