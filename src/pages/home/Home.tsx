import { Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { CurrentRoundRow } from '../../components/CurrentRoundRow'
import { Level } from '../../components/Level'
import { LevelNotification } from '../../components/LevelNotification'
import { NextStep } from '../../components/NextStep'

const Home = () => (
  <>
    <StyledDiv>
      <Container>
        <Row>
          <Level />
          <LevelNotification />
          <NextStep />
        </Row>
      </Container>
    </StyledDiv>
    <CurrentRoundRow />
  </>
)

const StyledDiv = styled.div`
  height: 67.5vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export { Home }
