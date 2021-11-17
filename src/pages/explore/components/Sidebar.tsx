import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const Sidebar = () => (
  <StyledMenu>
    <MenuItem to="/explore/bidders">Bidders</MenuItem>
    <MenuItem to="/explore/members">Members</MenuItem>
    <MenuItem to="/explore/candidates">Candidates</MenuItem>
    <MenuItem to="/explore/suspended">Suspended</MenuItem>
  </StyledMenu>
)

const defaultStyle = { color: '#707070', fontSize: 16, lineHeight: 2, fontWeight: 700, textDecoration: 'none' }
const activeStyle = { ...defaultStyle, color: 'white', fontSize: 20 }

const MenuItem = ({ to, children }: { to: string; children: string }): JSX.Element => (
  <li>
    <NavLink to={to} style={({ isActive }) => isActive ? activeStyle : defaultStyle }>
      {children}
    </NavLink>
  </li>
)

const StyledMenu = styled.ul`
  list-style: none;
`

export { Sidebar }
