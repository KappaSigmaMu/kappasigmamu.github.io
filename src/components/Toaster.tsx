import { Spinner } from 'react-bootstrap'
import toast, { Toaster as TToaster, ToastBar } from 'react-hot-toast'
import { FaXmark } from 'react-icons/fa6'
import { toastTestId } from '../helpers/test-utils/testIds'

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
      const testId = toastTestId(t)

      return (
        <ToastBar style={{ minHeight: '7vh' }} toast={t}>
          {({ icon, message }) => (
            <div data-test={testId} style={{ display: 'contents' }}>
              {icon}
              <span data-test="tx-message">{message}</span>
              {<FaXmark role="button" onClick={() => toast.dismiss(t.id)} style={{ flexShrink: 0 }}></FaXmark>}
            </div>
          )}
        </ToastBar>
      )
    }}
  </TToaster>
)

export { Toaster }
