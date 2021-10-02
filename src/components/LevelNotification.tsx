import { ReactElement } from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'

const NoFocus = styled.h5`
  color: ${(props) => props.theme.colors.greyDark};
`

const StyledP = styled.p`
  color: ${(props) => props.theme.colors.greyDark};
`

interface LevelsType {
  [key: string]: ReactElement
}

const HUMAN = (
  <>
    You are IN the society;<br/>
    You are NOT a member;<br/>
    You CAN&apos;T vote;<br/>
    You CAN VIEW the gallery.
  </>
)

const BIDDER = (
  <>
    Your bid NEEDS to get accepted;<br/>
    <NoFocus>{HUMAN}</NoFocus>
  </>
)

const CANDIDATE = (
  <>
    You need to SUBMIT your Proof of Ink;<br/>
    Your Proof of Ink needs to be VOTED;<br/>
    <NoFocus>
      Your bid should be low enough to get accepted;<br/>
      {HUMAN}
    </NoFocus>
  </>
)

const CYBORG = (
  <>
    You can enjoy, now.
    <Button>What&apos;s next?</Button>
  </>
)

const LEVELS: LevelsType = {
  human: HUMAN,
  bidder: BIDDER,
  candidate: CANDIDATE,
  cyborg: CYBORG
}

const LevelNotification = () => {
  const { level } = useAccount()

  return (
    <>
      <StyledP>Level Notification</StyledP>
      <h5>{LEVELS[level]}</h5>
    </>
  )
}

export { LevelNotification }
