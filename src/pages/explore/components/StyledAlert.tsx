import { Alert } from 'react-bootstrap'
import styled from 'styled-components'

interface StyledAlertProps {
  $success: boolean
}

export const StyledAlert = styled(Alert)<StyledAlertProps>`
  background-color: #1a1d20;
  border-color: ${(props) => (props.$success ? '#A7FB8F' : '#ED6464')};
  color: ${(props) => (props.$success ? '#A7FB8F' : '#ED6464')};

  .btn-close {
    filter: ${(props) =>
      props.$success
        ? 'invert(88%) sepia(27%) saturate(621%) hue-rotate(50deg) brightness(97%) contrast(104%);'
        : 'invert(58%) sepia(6%) saturate(6386%) hue-rotate(315deg) brightness(94%) contrast(96%);'};
  }
`
