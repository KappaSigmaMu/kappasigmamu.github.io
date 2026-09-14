import React from 'react'
import { Link, LinkProps, useLocation } from 'react-router'
import styled from 'styled-components'

interface LinkWithQueryProps extends Omit<LinkProps, 'to'> {
  to: string
  children: React.ReactNode
  allowActiveClick?: boolean
}

const LinkWithQuery: React.FC<LinkWithQueryProps> = ({ children, to, allowActiveClick = false, ...props }) => {
  const { search, pathname } = useLocation()
  const isSelected = pathname === to || pathname === to + '/' || pathname.startsWith(to + '/')
  return (
    <StyledLink
      to={to + search}
      {...props}
      $selected={isSelected}
      $allowActiveClick={allowActiveClick}
      aria-current={isSelected ? 'page' : undefined}
    >
      {children}
    </StyledLink>
  )
}

interface StyledLinkProps {
  $selected?: boolean
  $allowActiveClick?: boolean
}

const StyledLink = styled(Link)<StyledLinkProps>`
  color: ${(props) => props.$selected && 'white !important'};
  pointer-events: ${(props) => (props.$selected && !props.$allowActiveClick ? 'none' : 'auto')};
  cursor: ${(props) => (props.$selected && !props.$allowActiveClick ? 'default' : 'pointer')};
`

export { LinkWithQuery }
