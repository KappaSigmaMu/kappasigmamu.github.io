import { Button, Container, Row, Col } from 'react-bootstrap'
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
      <StyledDiv>
        <StyledContainer>
          <WalletConnected>WALLET CONNECTED</WalletConnected>
          <H1>Welcome, Human.</H1>
          <Row>
            <Col>
              <h4>JOIN THE LOUNGE</h4>
              <StyledP>Meet other Cyborgs.</StyledP>
              <SocialIcons />
            </Col>
            <Col>
              <h4>CHECK THE GAME GUIDE</h4>
              <StyledP>Learn how to become a Cyborg</StyledP>
              <Button variant="outline-secondary">
                Cyborg Guide
                <PaddingMapIcon src={MapIcon} alt="Map Icon" />
              </Button>
            </Col>
          </Row>

          <CenterButton variant="primary">Begin Journey</CenterButton>
        </StyledContainer>
      </StyledDiv>
    </>
  )
}

const StyledP = styled.p`
  font-size: 14px;
`

const H1 = styled.h1`
  margin-bottom: 45px;
`

const CenterButton = styled(Button)`
  display: flex;
  margin: auto;
  margin-top: 80px;
`

const StyledDiv = styled.div`
  height: 88.1vh;
  position: relative;
`

const WalletConnected = styled.p`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  font-size: 12px;
  border-radius: 40px;
  padding: 3px 5px;
  width: 137px;
  line-height: 12px;
  margin: auto;

  margin-bottom: 45px;
`

const StyledContainer = styled(Container)`
  background-color: red;
  position: absolute;
  width: 564px;
  height: 492px;
  left: 50%;
  top: 50%;
  border-radius: 12px;
  background: rgba(52, 58, 64, 0.5);
  text-align: center;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  padding: 59px;
`

const PaddingMapIcon = styled.img`
  padding-left: 5px;
`

export { Welcome }
