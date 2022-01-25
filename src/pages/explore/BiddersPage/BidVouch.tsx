import styled from 'styled-components'
import { Tab, Nav } from 'react-bootstrap'


const BidVouch = () => (
  <Tab.Container defaultActiveKey="bid">
    <StyledNav variant='tabs'>
      <Nav.Item>
        <Nav.Link eventKey="bid">Place Bid</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="vouch">Vouch</Nav.Link>
      </Nav.Item>
    </StyledNav>
    <StyledTabContent>
      <Tab.Pane eventKey="bid">
        Place Bid
      </Tab.Pane>
      <Tab.Pane eventKey="vouch">
        Vouch
      </Tab.Pane>
    </StyledTabContent>
  </Tab.Container>
)

const StyledNav = styled(Nav)`
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
  border: none;

  .nav-link {
    color: #01ffff;
    border: none;
  }

  .nav-link.active {
    color: white;
    background-color: #343A40;
  }
`

const StyledTabContent = styled(Tab.Content)`
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
  background-color: #343A40;
  padding: 10% 7%;
`

export { BidVouch }

