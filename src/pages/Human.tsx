import { Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { Level } from '../components/Level'
import { LevelNotification } from '../components/LevelNotification'
import { Navbar } from '../components/Navbar'
import { NextStep } from '../components/NextStep'

const Human = ({
  setActiveAccount,
  activeAccount,
}: {
  setActiveAccount: (activeAccount: string) => void
  activeAccount: string
}): JSX.Element => {
  return (
    <>
      <Navbar
        showBrandIcon
        showGalleryButton
        showAccount
        setActiveAccount={setActiveAccount}
        activeAccount={activeAccount}
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
