import { FaCheckDouble } from 'react-icons/fa6'
import { styled } from 'styled-components'

const AlreadyVotedIcon = () => (
  <>
    <StyledCheckDouble className="me-2" />
    <label style={{ color: '#6c757d' }}>Voted</label>
  </>
)

const StyledCheckDouble = styled(FaCheckDouble)`
  flex-shrink: 0;

  & path {
    fill: ${(props) => props.theme.colors.lightGrey};
  }
`

export { AlreadyVotedIcon }
