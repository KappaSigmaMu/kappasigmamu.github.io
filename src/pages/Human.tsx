import { Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { CurrentRoundRow } from '../components/CurrentRoundRow'
import { Level } from '../components/Level'
import { LevelNotification } from '../components/LevelNotification'
import { Navbar } from '../components/Navbar'
import { NextStep } from '../components/NextStep'

const Human = ({
  accounts,
  activeAccount,
  setAccounts,
  setActiveAccount,
}: {
  setActiveAccount: (activeAccount: string) => void
  activeAccount: string
  accounts: { name: string | undefined; address: string }[]
  setAccounts: (accounts: { name: string | undefined; address: string }[]) => void
}): JSX.Element => {
  return (
    <>
      <Navbar
        accounts={accounts}
        activeAccount={activeAccount}
        setAccounts={setAccounts}
        setActiveAccount={setActiveAccount}
        showAccount
        showBrandIcon
        showGalleryButton
      />
      <StyledDiv>
        <Container>
          <Row>
            <Level level='human' />
            <LevelNotification level='human' />
            <NextStep level='human' />
          </Row>
        </Container>
      </StyledDiv>
      <CurrentRoundRow currentAccount={activeAccount} />
    </>
  )
}

const StyledDiv = styled.div`
  height: 88.1vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export { Human }
