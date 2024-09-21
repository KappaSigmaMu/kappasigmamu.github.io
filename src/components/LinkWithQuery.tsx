import React from 'react'
import { Link, LinkProps, useLocation } from 'react-router-dom'
import styled from 'styled-components'

interface LinkWithQueryProps extends Omit<LinkProps, 'to'> {
  to: string
  children: React.ReactNode
}

const LinkWithQuery: React.FC<LinkWithQueryProps> = ({ children, to, ...props }) => {
  const { search, pathname } = useLocation()
  const isSelected = pathname === to || pathname === to + '/'
  return (
    <StyledLink to={to + search} {...props} $selected={isSelected}>
      {children}
    </StyledLink>
  )
}

interface StyledLinkProps {
  $selected?: boolean
}

const StyledLink = styled(Link)<StyledLinkProps>`
  color: ${(props) => props.$selected && 'white !important'};
  pointer-events: ${(props) => (props.$selected ? 'none' : 'auto')};
  cursor: ${(props) => (props.$selected ? 'default' : 'pointer')};
`

export { LinkWithQuery }
