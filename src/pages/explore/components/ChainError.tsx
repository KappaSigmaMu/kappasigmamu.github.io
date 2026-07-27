import { Alert, Button } from 'react-bootstrap'

export function ChainError({ error, onRetry }: { error: Error; onRetry?: () => void }): JSX.Element {
  return (
    <Alert variant="danger" className="text-center">
      <div>Unable to load blockchain data.</div>
      <small>{error.message}</small>
      {onRetry && (
        <div>
          <Button className="mt-2" size="sm" variant="outline-light" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </Alert>
  )
}
