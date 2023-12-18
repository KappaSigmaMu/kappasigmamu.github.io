import { Spinner } from 'react-bootstrap'

type LoadingSpinnerProps = {
  center?: boolean
  small?: boolean
}

export function LoadingSpinner({ center = true, small = false }: LoadingSpinnerProps): JSX.Element {
  return small ? (
    <Spinner animation="border" variant="primary" className={center ? 'mx-auto d-block' : ''} size="sm" />
  ) : (
    <Spinner animation="border" variant="primary" className={center ? 'mx-auto d-block' : ''} />
  )
}
