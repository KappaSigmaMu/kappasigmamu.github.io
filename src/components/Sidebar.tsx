import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const Sidebar = () => (
  <Menu>
    <MenuItem to="/human/bids">Bids</MenuItem>
    <MenuItem to="/human/members">Members</MenuItem>
    <MenuItem to="/human/candidates">Candidates</MenuItem>
    <MenuItem to="/human/suspended">Suspended</MenuItem>
  </Menu>
)

const Menu = styled.li`
  list-style: none;
`

const MenuItem = ({ to, children }: { to: string; children: string }): JSX.Element => (
  <li>
    <NavLink
      to={to}
      activeStyle={{ color: 'white', fontSize: 20 }}
      style={{ color: '#707070', fontSize: 16, lineHeight: 2, fontWeight: 700, textDecoration: 'none' }}
    >
      {children}
    </NavLink>
  </li>
)

export { Sidebar }
