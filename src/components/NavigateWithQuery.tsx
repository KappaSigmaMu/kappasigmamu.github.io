import { Navigate, NavigateProps, useLocation } from 'react-router'

const NavigateWithQuery = ({ to, ...props }: NavigateProps & React.RefAttributes<HTMLAnchorElement>) => {
  const { search } = useLocation()
  return <Navigate to={to + search} {...props} />
}

export { NavigateWithQuery }
