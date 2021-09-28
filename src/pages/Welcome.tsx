import { Button, Container, Row, Col, Badge } from 'react-bootstrap'
import styled from 'styled-components'
import { Level } from '../components/Level'
import { Navbar } from '../components/Navbar'
import { SocialIcons } from '../components/SocialIcons'
import MapIcon from '../static/map-icon.svg'

const Welcome = ({
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
        <LevelContainer>
          <Row>
            <Level level='human' />
          </Row>
        </LevelContainer>
        <StyledContainer>
          <MarginBadge pill>WALLET CONNECTED</MarginBadge>
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

          <CenterButton variant="primary" href="/human">Begin Journey</CenterButton>
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
  margin: auto;
  margin-top: 80px;
`

const StyledDiv = styled.div`
  height: 88.1vh;
`

const MarginBadge = styled(Badge)`
  margin-bottom: 45px;
`

const StyledContainer = styled(Container)`
  position: absolute;
  width: 564px;
  height: 492px;
  border-radius: 12px;
  background: rgba(52, 58, 64, 0.5);
  text-align: center;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  padding: 59px;
`

const LevelContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const PaddingMapIcon = styled.img`
  padding-left: 5px;
`

export { Welcome }
