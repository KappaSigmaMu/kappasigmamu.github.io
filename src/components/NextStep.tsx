import { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

interface LevelsType {
  [key: string]: ReactElement
}

const HUMAN = (
  <>
    <h5 className="mb-4">
      To become a Candidate you need to level up;
      <br/>
      To level up you must first Submit a Bid.
    </h5>
    <Link to="/guide" className="btn btn-outline-grey-dark">
      Bid Rules
    </Link>
    &nbsp;&nbsp;
    <Link to="/guide" className="ml-5 btn btn-primary">
      Submit a Bid
    </Link>
  </>
)

const BIDDER = (
  <></>
)

const CANDIDATE = (
  <></>
)

const CYBORG = (
  <></>
)

const LEVELS: LevelsType = {
  human: HUMAN,
  bidder: BIDDER,
  candidate: CANDIDATE,
  cyborg: CYBORG
}

const NextStep = ({ level }: { level: string }) => {
  return (
    <>
      <StyledP>Next Step</StyledP>
      {LEVELS[level]}
    </>
  )
}

const StyledP = styled.p`
  color: ${(props) => props.theme.colors.greyDark};
`

export { NextStep }
