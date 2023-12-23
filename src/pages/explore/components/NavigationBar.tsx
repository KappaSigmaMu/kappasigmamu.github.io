import { Nav } from 'react-bootstrap'
import styled from 'styled-components'
import { LinkWithQuery } from '../../../components/LinkWithQuery'

type Totals = {
  bidders: number
  candidates: number
  members: number
  maxMembers: number
  suspendedMembers: number
}

const NavigationBar = ({ totals }: { totals: Totals }) => (
  <StyledNav defaultActiveKey="/explore/bidders" className="py-2 my-4">
    <StyledNavItem>
      <Nav.Link as={LinkWithQuery} to="/explore/bidders">
        Bidders ({totals.bidders})
      </Nav.Link>
    </StyledNavItem>
    <StyledNavItem>
      <Nav.Link as={LinkWithQuery} to="/explore/candidates">
        Candidates ({totals.candidates})
      </Nav.Link>
    </StyledNavItem>
    <StyledNavItem>
      <Nav.Link as={LinkWithQuery} to="/explore/members">
        Members ({totals.members}/{totals.maxMembers})
      </Nav.Link>
    </StyledNavItem>
    <StyledNavItem>
      <Nav.Link as={LinkWithQuery} to="/explore/suspended">
        Suspended Members ({totals.suspendedMembers})
      </Nav.Link>
    </StyledNavItem>
    <StyledNavItem>
      <Nav.Link as={LinkWithQuery} to="/explore/poi">
        Proof of Ink
      </Nav.Link>
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
