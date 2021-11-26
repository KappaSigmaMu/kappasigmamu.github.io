import { Button, Row } from 'react-bootstrap'
import styled from 'styled-components'

const DataHeaderRow = styled(Row)`
  line-height: 3;

  & .text-end {
    padding-right: 36px;
  }

  * {
    color: ${(props) => props.theme.colors.lightGrey};
  }
`

const DataRow = styled(DataHeaderRow)`
  background-color: #343A40;
  border-radius: 6px;
  margin-top: 10px;
`

const ExternalLink = styled.a.attrs(() => ({
  target: '_blank',
  rel: 'noreferrer'
}))``

const PrimaryButton = styled(Button).attrs(() => ({ variant: 'primary' }))``
const PrimaryLgButton = styled(PrimaryButton).attrs(() => ({ size: 'lg' }))``

export {
  DataHeaderRow,
  DataRow,
  ExternalLink,
  PrimaryButton,
  PrimaryLgButton,
}
