import { ReactElement } from 'react'
import { Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'

const MarginH5 = styled.h5`
  margin-bottom: 24px;
`

const StyledP = styled.p`
  color: ${(props) => props.theme.colors.lightGrey};
`

interface LevelsType {
  [key: string]: ReactElement
}

const HumanNextStep = (
  <>
    <MarginH5>To become a Candidate you need to level up;<br/>To level up you must first Submit a Bid.</MarginH5>
    <Link to="/guide" className="btn btn-outline-grey-dark">
      Bid Rules
    </Link>
    &nbsp;&nbsp;
    <Link to="/guide" className="ml-5 btn btn-primary">
      Submit a Bid
    </Link>
  </>
)

const BidderNextStep = (
  <>
    <MarginH5>To become a Candidate your bid must fit the parameters.</MarginH5>
    <MarginButton variant="outline-light-grey">Bid Rules</MarginButton>
    <Button>Check Bids</Button>
  </>
)

const CandidateNextStep = (
  <>
    <MarginH5>To become a Cyborg you need to submit the Proof of Ink.</MarginH5>
    <MarginButton variant="outline-light-grey" disabled>Proof of Ink (PoI) Rules</MarginButton>
    <MarginButton variant="outline-light-grey" disabled>Ink Art</MarginButton>
    <Button>Submit Proof of Ink</Button>
  </>
)

const CyborgNextStep = (
  <>
    <MarginH5>Enjoy</MarginH5>
    <MarginButton variant="outline-light-grey" disabled>Vouch Bid</MarginButton>
    <Button disabled>Vote on Candiadates</Button>
  </>
)

const LEVELS: LevelsType = {
  human: HumanNextStep,
  bidder: BidderNextStep,
  candidate: CandidateNextStep,
  cyborg: CyborgNextStep
}

const NextStep = () => {
  const { level } = useAccount()

  return (
    <Col sm={5}>
      <StyledP>Next Step</StyledP>
      {LEVELS[level]}
    </Col>
  )
}

export { NextStep }
