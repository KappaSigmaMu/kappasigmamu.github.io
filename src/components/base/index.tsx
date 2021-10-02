import { Button } from 'react-bootstrap'
import styled from 'styled-components'

const ExternalLink = styled.a.attrs(() => ({
  target: '_blank',
  rel: 'noreferrer'
}))``

const PrimaryButton = styled(Button).attrs(() => ({ variant: 'primary' }))``
const PrimaryLgButton = styled(PrimaryButton).attrs(() => ({ size: 'lg' }))``

export {
  ExternalLink,
  PrimaryButton,
  PrimaryLgButton,
}
