import { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'

const NoFocus = styled.h5`
  color: ${(props) => props.theme.colors.lightGrey};
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
    You CAN EXPLORE the chain data.
  </>
)

const HumanLevelNotification = (
  <h5>
    {DefaultLevelNotification}
  </h5>
)

const BidderLevelNotification = (
  <h5>
    Your bid NEEDS to get accepted;<br/>
    <NoFocus>{DefaultLevelNotification}</NoFocus>
  </h5>
)

const CandidateLevelNotification = (
  <h5>
    You need to SUBMIT your Proof of Ink;<br/>
    Your Proof of Ink needs to be VOTED;<br/>
    <NoFocus>
      Your bid should be low enough to get accepted;<br/>
      {DefaultLevelNotification}
    </NoFocus>
  </h5>
)

const CyborgLevelNotification = (
  <>
    <h5>
      You can enjoy, now.
    </h5>
    <Link to="/guide" className="ml-5 btn btn-primary">
      What&apos;s next?
    </Link>
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
    <>
      <StyledP>Level Notification</StyledP>
      {LEVELS[level]}
    </>
  )
}

export { LevelNotification }
