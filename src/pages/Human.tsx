import { Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { Level } from '../components/Level'
import { LevelNotification } from '../components/LevelNotification'
import { NextStep } from '../components/NextStep'

const Human = (): JSX.Element => {
  return (
    <>
      <StyledDiv>
        <Container>
          <Row>
            <Level level='human' />
            <LevelNotification level='human' />
            <NextStep level='human' />
          </Row>
        </Container>
      </StyledDiv>
    </>
  )
}

const StyledDiv = styled.div`
  height: 88.1vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export { Human }
