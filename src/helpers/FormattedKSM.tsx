import styled from "styled-components"

const FormattedKSM = (props: { children: any }): JSX.Element => (
  <>
    <Value>{props.children}</Value>
    &nbsp;&nbsp;
    <Unit>KSM</Unit>
  </>
)

const Unit = styled.span`
  color: ${(props) => props.theme.colors.lightGrey};
`

const Value = styled.span`
  color: ${(props) => props.theme.colors.white};
`

export { FormattedKSM }
