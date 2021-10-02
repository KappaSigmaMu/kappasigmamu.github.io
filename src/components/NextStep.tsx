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
    <Link to="/guide" className="btn btn-outline-grey-dark">
      Bid Rules
    </Link>
    &nbsp;&nbsp;
    <Link to="/home/bids" className="ml-5 btn btn-primary">
      Check Bids
    </Link>
  </>
)

const CandidateNextStep = (
  <>
    <MarginH5>To become a Cyborg you need to submit the Proof of Ink.</MarginH5>
    <Link to="/guide" className="btn btn-outline-grey-dark">
      Proof of Ink (PoI) Rules
    </Link>
    &nbsp;&nbsp;
    <Link to="/guide" className="btn btn-outline-grey-dark">
      Ink Art
    </Link>
    &nbsp;&nbsp;
    <Link to="/home/bids" className="ml-5 btn btn-primary">
      Submit Proof of Ink
    </Link>
  </>
)

const CyborgNextStep = (
  <>
    <MarginH5>Enjoy</MarginH5>
    <Link to="/home/bids" className="btn btn-outline-grey-dark">
      Vouch Bid
    </Link>
    &nbsp;&nbsp;
    <Link to="/home/bids" className="ml-5 btn btn-primary">
      Vote on Candiadates
    </Link>
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
