import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const Sidebar = () => (
  <StyledMenu>
    <MenuItem to="/human/bids">Bids</MenuItem>
    <MenuItem to="/human/members">Members</MenuItem>
    <MenuItem to="/human/candidates">Candidates</MenuItem>
    <MenuItem to="/human/suspended">Suspended</MenuItem>
  </StyledMenu>
)

const MenuItem = ({ to, children }: { to: string; children: string }): JSX.Element => (
  <li>
    <StyledNavLink to={to} activeStyle={{ color: 'white', fontSize: 20 }} >
      {children}
    </StyledNavLink>
  </li>
)

const StyledMenu = styled.li`
  list-style: none;
`

const StyledNavLink = styled(NavLink)`
  color: #707070;
  fontSize: 16px;
  lineHeight: 2px;
  fontWeight: 700;
  textDecoration: none;
`

export { Sidebar }
