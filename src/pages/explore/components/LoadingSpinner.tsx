import { Spinner } from 'react-bootstrap'

type LoadingSpinnerProps = {
  center?: boolean
  small?: boolean
}

export function LoadingSpinner({ center = true, small = false }: LoadingSpinnerProps): JSX.Element {
  const className = center ? 'mx-auto d-block' : ''
  return small ? (
    <Spinner animation="border" variant="primary" className={className} size="sm" data-test="loading-spinner" />
  ) : (
    <Spinner animation="border" variant="primary" className={className} data-test="loading-spinner" />
  )
}
