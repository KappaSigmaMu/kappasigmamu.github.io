import { Navigate, NavigateProps, useLocation } from 'react-router-dom'

const NavigateWithQuery = ({ to, ...props }: NavigateProps & React.RefAttributes<HTMLAnchorElement>) => {
  const { search } = useLocation()
  return <Navigate to={to + search} {...props} />
}

export { NavigateWithQuery }
