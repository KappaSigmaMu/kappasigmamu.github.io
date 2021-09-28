import { ReactElement } from 'react'
import { Col, Button } from 'react-bootstrap'
import styled from 'styled-components'

const MarginH5 = styled.h5`
  margin-bottom: 24px;
`

const StyledP = styled.p`
  color: ${(props) => props.theme.colors.greyDark};
`

const MarginButton = styled(Button)`
  margin-right: 16px;
`

interface LevelsType {
  [key: string]: ReactElement
}

const HUMAN = (
  <>
    <MarginH5>To become a Candidate you need to level up;<br/>To level up you must first Submit a Bid.</MarginH5>
    <MarginButton variant="outline-grey-dark">Bid Rules</MarginButton>
    <Button>Submit a Bid</Button>
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
    <Col sm={5}>
      <StyledP>Next Step</StyledP>
      {LEVELS[level]}
    </Col>
  )
}

export { NextStep }
