import { ReactElement } from 'react'
import { Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../../account/AccountContext'
import { Bid } from './Bid'
import { CurrentRound } from './CurrentRound'
import { RoundPayout } from './RoundPayout'
import { Strikes } from './Strikes'

const HumanCurrentRound = (
  <>
    <CurrentRound />
    <RoundPayout />
  </>
)
const BidderCurrentRound = (
  <>
    <CurrentRound />
    <RoundPayout />
    <Bid />
  </>
)
const CandidateCurrentRound = (
  <>
    <CurrentRound />
    <RoundPayout />
    <Bid />
  </>
)
const CyborgCurrentRound = (
  <>
    <CurrentRound />
    <RoundPayout />
    <Strikes />
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
    <StyledDiv>
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
  padding: 30px 0;
`

export { RotationBar }
