import { ReactElement } from 'react'
import { Button, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'

const NoFocus = styled.h5`
  color: ${(props) => props.theme.colors.lightGrey};
`

const MarginH5 = styled.h5`
  margin-bottom: 24px;
`

const StyledP = styled.p`
  color: ${(props) => props.theme.colors.lightGrey};
`

interface LevelsType {
  [key: string]: ReactElement
}

const DefaultLevelNotification  = (
  <>
    You are IN the society;<br/>
    You are NOT a member;<br/>
    You CAN&apos;T vote;<br/>
    You CAN VIEW the gallery.
  </>
)

const HumanLevelNotification = (
  <MarginH5>
    {DefaultLevelNotification}
  </MarginH5>
)

const BidderLevelNotification = (
  <MarginH5>
    Your bid NEEDS to get accepted;<br/>
    <NoFocus>{DefaultLevelNotification}</NoFocus>
  </MarginH5>
)

const CandidateLevelNotification = (
  <MarginH5>
    You need to SUBMIT your Proof of Ink;<br/>
    Your Proof of Ink needs to be VOTED;<br/>
    <NoFocus>
      Your bid should be low enough to get accepted;<br/>
      {DefaultLevelNotification}
    </NoFocus>
  </MarginH5>
)

const CyborgLevelNotification = (
  <>
    <MarginH5>
      You can enjoy, now.
    </MarginH5>
    <Button disabled>What&apos;s next?</Button>
  </>
)

const LEVELS: LevelsType = {
  human: HumanLevelNotification,
  bidder: BidderLevelNotification,
  candidate: CandidateLevelNotification,
  cyborg: CyborgLevelNotification
}

const LevelNotification = () => {
  const { level } = useAccount()

  return (
    <Col sm={4}>
      <StyledP>Level Notification</StyledP>
      {LEVELS[level]}
    </Col>
  )
}

export { LevelNotification }
