import { Dropdown } from 'react-bootstrap'
import { styled } from 'styled-components'

const StyledDropdownMenu = styled(Dropdown.Menu)`
  background-color: ${(props) => props.theme.colors.darkGrey};

  & a,
  & span {
    display: flex;
    align-items: center;
    text-decoration: none;

    & svg {
      margin-right: 5px;
    }
  }

  & a,
  & a:link,
  & a:visited,
  & span {
    color: ${(props) => props.theme.colors.white};
  }

  & a:hover,
  & a:active {
    color: ${(props) => props.theme.colors.darkGrey};
    & svg {
      flex-shrink: 0;

      & path {
        fill: ${(props) => props.theme.colors.black};
      }
    }
  }
`

export { StyledDropdownMenu }
