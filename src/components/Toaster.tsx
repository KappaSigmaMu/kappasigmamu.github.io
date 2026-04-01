import { Spinner } from 'react-bootstrap'
import toast, { Toaster as TToaster, ToastBar } from 'react-hot-toast'
import { FaXmark } from 'react-icons/fa6'

const Toaster = () => (
  <TToaster
    position="top-center"
    reverseOrder={true}
    toastOptions={{
      success: {
        duration: 15000,
        style: {
          background: '#363636',
          color: '#fff'
        }
      },
      error: {
        duration: 15000,
        style: {
          background: '#363636',
          color: '#fff'
        }
      },
      loading: {
        icon: <Spinner size="sm" animation="border" variant="primary" />,
        style: {
          background: '#363636',
          color: '#fff'
        }
      }
    }}
  >
    {(t) => {
      const isSigningMessage = typeof t.message === 'string' && t.message.includes('Awaiting signature')
      const testId =
        t.type === 'success'
          ? 'tx-success'
          : t.type === 'error'
            ? 'tx-error'
            : t.type === 'loading'
              ? isSigningMessage
                ? 'tx-signing'
                : 'tx-pending'
              : undefined

      return (
        <ToastBar style={{ minHeight: '7vh' }} toast={t}>
          {({ icon, message }) => (
            <div data-testid={testId} style={{ display: 'contents' }}>
              {icon}
              <span data-testid="tx-message">{message}</span>
              {<FaXmark role="button" onClick={() => toast.dismiss(t.id)} style={{ flexShrink: 0 }}></FaXmark>}
            </div>
          )}
        </ToastBar>
      )
    }}
  </TToaster>
)

export { Toaster }
