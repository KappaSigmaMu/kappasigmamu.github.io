import { Spinner } from 'react-bootstrap'
import toast, { Toaster as TToaster, ToastBar } from 'react-hot-toast'
import { FaXmark } from 'react-icons/fa6'

const Toaster = () => (
  <TToaster
    position="top-right"
    reverseOrder={true}
    toastOptions={{
      success: {
        duration: 100000,
        style: {
          background: '#363636',
          color: '#fff'
        }
      },
      error: {
        duration: 100000,
        style: {
          background: '#363636',
          color: '#fff'
        }
      },
      loading: {
        duration: 100000,
        icon: <Spinner size="sm" animation="border" variant="primary" />,
        style: {
          background: '#363636',
          color: '#fff'
        }
      }
    }}
  >
    {(t) => (
      <ToastBar toast={t}>
        {({ icon, message }) => (
          <>
            {icon}
            {message}
            {<FaXmark onClick={() => toast.dismiss(t.id)}></FaXmark>}
          </>
        )}
      </ToastBar>
    )}
  </TToaster>
)

export { Toaster }
