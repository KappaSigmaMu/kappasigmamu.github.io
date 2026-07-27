import toast from 'react-hot-toast'

export const toastByStatus = {
  success: (message: string, params: object) => {
    toast.dismiss('Awaiting signature...')
    toast.dismiss('Request sent. Waiting for response...')
    return toast.success(message, params)
  },
  loading: (message: string, params: object) => {
    toast.dismiss('Awaiting signature...')
    return toast.loading(message, params)
  },
  error: (message: string, params: object) => {
    toast.dismiss('Awaiting signature...')
    return toast.error(message, params)
  }
}
