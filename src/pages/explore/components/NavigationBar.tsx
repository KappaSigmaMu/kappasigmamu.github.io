import { Nav } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const NavigationBar = () => (
  <StyledNav defaultActiveKey="/explore/bidders" className="py-2 my-4">
    <StyledNavItem>
      <Nav.Link as={NavLink} to="/explore/bidders">Bidders</Nav.Link>
    </StyledNavItem>
    <StyledNavItem>
      <Nav.Link as={NavLink} to="/explore/candidates">Candidates</Nav.Link>
    </StyledNavItem>
    <StyledNavItem>
      <Nav.Link as={NavLink} to="/explore/members">Members</Nav.Link>
    </StyledNavItem>
    <StyledNavItem>
      <Nav.Link as={NavLink} to="/explore/suspended">Suspended</Nav.Link>
    </StyledNavItem>
  </StyledNav>
)

const StyledNav = styled(Nav)`
  border-bottom: 1px solid ${(props) => props.theme.colors.darkGrey};
  border-top: 1px solid ${(props) => props.theme.colors.darkGrey};
`

const StyledNavItem = styled(Nav.Item)`
  .nav-link {
    color: ${(props) => props.theme.colors.lightGrey};
  }

  .nav-link:hover {
    color: ${(props) => props.theme.colors.darkGrey};
  }

  .nav-link.active {
    color: ${(props) => props.theme.colors.white};
  }
`

export { NavigationBar }
