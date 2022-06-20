import { Spinner } from "react-bootstrap"

type LoadingSpinnerProps = {
  center?: boolean
}

export function LoadingSpinner({ center = true }: LoadingSpinnerProps): JSX.Element {
  return (
    <Spinner 
      animation="border" 
      variant="primary" 
      className={center ? "mx-auto d-block" : ""} />
  )
}
