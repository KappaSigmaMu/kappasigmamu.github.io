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
          <Col sm={3}>
            <Level />
          </Col>
          <Col sm={4}>
            <LevelNotification />
          </Col>
          <Col sm={5}>
            <NextStep />
          </Col>
        </Row>
      </Container>
    </StyledDiv>
    <RotationBar />
  </>
)

const StyledDiv = styled.div`
  height: 67.1vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export { JourneyPage }
