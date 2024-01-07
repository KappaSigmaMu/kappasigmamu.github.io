import React from 'react'
import { Spinner } from 'react-bootstrap'
import toast, { Toaster as TToaster } from 'react-hot-toast'

const Toaster = () => {
  return <TToaster
    position="top-right"
    reverseOrder={true}
    toastOptions={{
      success: {
        style: {
          background: '#363636',
          color: '#fff',
        },
      },
      error: {
        style: {
          background: '#363636',
          color: '#fff',
        },
      },
      loading: {
        icon: <Spinner size="sm" animation="border" variant="primary" />,
        style: {
          background: '#363636',
          color: '#fff',
        },
      }
    }}
  />
}

export { Toaster }
