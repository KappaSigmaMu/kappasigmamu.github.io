import { Link, LinkProps, useLocation } from 'react-router-dom'
import styled from 'styled-components'

const LinkWithQuery = ({ children, to, ...props }: LinkProps & React.RefAttributes<HTMLAnchorElement>) => {
  const { search } = useLocation()
  const isSelected = location.pathname === to.toString() || location.pathname === to.toString() + '/'

  return (
    <StyledLink to={to + search} {...props} selected={isSelected}>
      {children}
    </StyledLink>
  )
}

interface StyledLinkProps extends LinkProps {
  selected?: boolean
}

const StyledLink = styled(Link)<StyledLinkProps>`
  color: ${(props) => props.selected && 'white !important'};
  pointer-events: ${(props) => (props.selected ? 'none' : 'auto')};
  cursor: ${(props) => (props.selected ? 'default' : 'pointer')};
`

export { LinkWithQuery }
