import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { Level } from '../components/Level'
import { LevelNotification } from '../components/LevelNotification'
import { NextStep } from '../components/NextStep'
import { RotationBar } from '../components/rotation-bar/RotationBar'

const JourneyPage = (): JSX.Element => (
  <>
    <StyledDiv>
      <Container>
        <Row>
          <StyledCol sm={3}>
            <Level />
          </StyledCol>
          <StyledCol sm={4}>
            <LevelNotification />
          </StyledCol>
          <StyledCol sm={5}>
            <NextStep />
          </StyledCol>
        </Row>
      </Container>
    </StyledDiv>
    <RotationBar />
  </>
)

const StyledDiv = styled.div`
  height: 69.1vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledCol = styled(Col)`
  z-index: 10;
`

export { JourneyPage }
