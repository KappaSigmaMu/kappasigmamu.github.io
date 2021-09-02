import { Button, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { Navbar } from '../components/Navbar'
import { SocialIcons } from '../components/SocialIcons'
import MapIcon from '../static/map-icon.svg'

const Welcome = ({
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
      <StyledRow>
        <StyledDiv>
          <Container>
            <WalletConnected>
              WALLET CONNECTED
            </WalletConnected>
            <WelcomeHuman>
              Welcome, Human.
            </WelcomeHuman>
            <h4>
              JOIN THE LOUNGE
            </h4>
            <p>Meet other Cyborgs.</p>
            <h4>
              CHECK THE GAME GUIDE
            </h4>
            <p>Learn how to become a Cyborg</p>
            <SocialIcons />
            <Button variant="outline-secondary">
              Cyborg Guide
              <PaddingMapIcon src={MapIcon} alt="Map Icon" />
            </Button>
            <Button variant="primary">
              Begin Journey
            </Button>
          </Container>
        </StyledDiv>
      </StyledRow>
    </>
  )
}

const StyledRow = styled(Row)`
  height: 87.2vh;
`

const WalletConnected = styled.p`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  font-size: 12px;
  border-radius: 40px;
  padding: 3px 5px;
  width: 137px;
  line-height: 12px;
`

const WelcomeHuman = styled.h1`
  text-align: center;
`

const StyledDiv = styled(Container)`
  background-color: red;
  position: absolute;
  width: 564px;
  height: 492px;
  left: 50%;
  top: 50%;
  border-radius: 12px;
  background: rgba(52, 58, 64, 0.5);

  align-items: center;
  display: flex;
`

const PaddingMapIcon = styled.img`
  padding-left: 5px;
`

export { Welcome }
