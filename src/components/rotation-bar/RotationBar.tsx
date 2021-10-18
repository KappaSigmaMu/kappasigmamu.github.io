import { ReactElement } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../../account/AccountContext'
import { Bid } from './Bid'
import { CurrentRound } from './CurrentRound'
import { RoundPayout } from './RoundPayout'
import { Strikes } from './Strikes'

const HumanCurrentRound = (
  <>
    <Col>
      <CurrentRound />
    </Col>
    <Col>
      <RoundPayout />
    </Col>
  </>
)
const BidderCurrentRound = (
  <>
    <Col>
      <CurrentRound />
    </Col>
    <Col>
      <RoundPayout />
    </Col>
    <Col>
      <Bid />
    </Col>
  </>
)
const CandidateCurrentRound = (
  <>
    <Col>
      <CurrentRound />
    </Col>
    <Col>
      <RoundPayout />
    </Col>
    <Col>
      <Bid />
    </Col>
  </>
)
const CyborgCurrentRound = (
  <>
    <Col>
      <CurrentRound />
    </Col>
    <Col>
      <RoundPayout />
    </Col>
    <Col>
      <Strikes />
    </Col>
  </>
)

interface LevelsType {
  [key: string]: ReactElement
}

const LEVELS: LevelsType = {
  human: HumanCurrentRound,
  bidder: BidderCurrentRound,
  candidate: CandidateCurrentRound,
  cyborg: CyborgCurrentRound
}

const RotationBar = () => {
  const { level } = useAccount()
  return (
    <StyledDiv className="py-4">
      <Container>
        <Row sm={4}>
          {LEVELS[level]}
        </Row>
      </Container>
    </StyledDiv>
  )
}

const StyledDiv = styled.div`
  background-color: ${(props) => props.theme.colors.darkGrey};
`

export { RotationBar }
