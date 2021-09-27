import { Button, Container, Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { Navbar } from '../components/Navbar'
import { SocialIcons } from '../components/SocialIcons'
import MapIcon from '../static/map-icon.svg'

const Welcome = ({
  setActiveAccount,
  activeAccount,
  accounts,
  setAccounts
}: {
  setActiveAccount: (activeAccount: string) => void
  activeAccount: string
  accounts: { name: string | undefined; address: string }[]
  setAccounts: (accounts: { name: string | undefined; address: string }[]) => void
}): JSX.Element => {
  return (
    <>
      <Navbar
        showBrandIcon
        showGalleryButton
        showAccount
        setActiveAccount={setActiveAccount}
        activeAccount={activeAccount}
        accounts={accounts}
        setAccounts={setAccounts}
      />
      <StyledDiv>
        <StyledContainer>
          <WalletConnectedText>WALLET CONNECTED</WalletConnectedText>
          <MarginH1>Welcome, Human.</MarginH1>
          <Row>
            <Col>
              <h4>JOIN THE LOUNGE</h4>
              <SizeP>Meet other Cyborgs.</SizeP>
              <SocialIcons />
            </Col>
            <Col>
              <h4>CHECK THE GAME GUIDE</h4>
              <SizeP>Learn how to become a Cyborg</SizeP>
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

const SizeP = styled.p`
  font-size: 14px;
`

const MarginH1 = styled.h1`
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

const WalletConnectedText = styled.p`
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
