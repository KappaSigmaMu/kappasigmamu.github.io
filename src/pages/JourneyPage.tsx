import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { Level } from '../components/Level'
import { NextStep } from '../components/NextStep'

const JourneyPage = (): JSX.Element => (
  <>
    <StyledDiv>
      <Container>
        <Row>
          <Col xs={3}></Col>
          <StyledCol sm={3}>
            <Level />
          </StyledCol>
          <StyledCol sm={5}>
            <NextStep />
          </StyledCol>
        </Row>
      </Container>
    </StyledDiv>
  </>
)

const StyledDiv = styled.div`
  margin-top: 30px;
  height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledCol = styled(Col)`
  z-index: 10;
`

export { JourneyPage }
