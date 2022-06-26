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
  background-color: ${(props) => props.theme.colors.darkGrey};
  border-radius: 6px;
  margin-top: 10px;

  * {
  color: ${(props) => props.theme.colors.white};
}
`

const ExternalLink = styled.a.attrs(() => ({
  target: '_blank',
  rel: 'noreferrer'
}))``

const PrimaryButton = styled(Button).attrs(() => ({ variant: 'primary' }))``
const PrimaryLgButton = styled(PrimaryButton).attrs(() => ({ size: 'lg' }))``

const SecondaryLgButton = styled(Button).attrs(() => ({ variant: 'secondary', size: 'lg' }))``

export {
  DataHeaderRow,
  DataRow,
  ExternalLink,
  PrimaryButton,
  PrimaryLgButton,
  SecondaryLgButton
}
