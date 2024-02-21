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
    {(t) => (
      <ToastBar style={{ minHeight: '7vh' }} toast={t}>
        {({ icon, message }) => (
          <>
            {icon}
            {message}
            {<FaXmark role="button" onClick={() => toast.dismiss(t.id)} style={{ flexShrink: 0 }}></FaXmark>}
          </>
        )}
      </ToastBar>
    )}
  </TToaster>
)

export { Toaster }
