import { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'

const StyledP = styled.p`
  color: ${(props) => props.theme.colors.lightGrey};
`

interface LevelsType {
  [key: string]: ReactElement
}

const HumanNextStep = (
  <>
    <h5 className="mb-4">
      To become a Candidate you need to level up;
      <br/>
      To level up you must first Submit a Bid.
    </h5>
    <Link to="/guide" className="btn btn-outline-light-grey">
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
    <h5>To become a Candidate your bid must fit the parameters.</h5>
    <Link to="/guide" className="btn btn-outline-light-grey">
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
    <h5>To become a Cyborg you need to submit the Proof of Ink.</h5>
    <Link to="/guide" className="btn btn-outline-light-grey">
      Proof of Ink (PoI) Rules
    </Link>
    &nbsp;&nbsp;
    <Link to="/guide" className="btn btn-outline-light-grey">
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
    <h5>Enjoy</h5>
    <Link to="/home/bids" className="btn btn-outline-light-grey">
      Vouch Bid
    </Link>
    &nbsp;&nbsp;
    <Link to="/home/bids" className="ml-5 btn btn-primary">
      Vote on Candidates
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
    <>
      <StyledP>Next Step</StyledP>
      {LEVELS[level]}
    </>
  )
}

export { NextStep }
