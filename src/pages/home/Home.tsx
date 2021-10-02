import { Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { CurrentRoundRow } from '../../components/CurrentRoundRow'
import { Level } from '../../components/Level'
import { LevelNotification } from '../../components/LevelNotification'
import { NextStep } from '../../components/NextStep'

const Home = (): JSX.Element => (
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
