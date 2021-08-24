import { Col, Row, Button } from 'react-bootstrap'
import styled from 'styled-components'
import { Navbar } from '../components/Navbar'
import Canary from '../static/canary.svg'
import KappaSigmaMuTitle from '../static/kappa-sigma-mu-title.svg'

const Home = () => {
  return (
    <>
      <Navbar showSocialIcons showAccount />
      <StyledRow>
        <Col xs={6}>
          <CanaryImg src={Canary} alt="Canary" />
        </Col>
        <CentralizedCol xs={6}>
          <h1>Join the</h1>
          <KappaSigmaMu src={KappaSigmaMuTitle} alt="Kappa Sigma Mu Title" />
          <Button variant="primary" size="lg">Become a Cyborg</Button>
          <GuideButton variant="link" href="/cyborg-guide">Cyborg Guide</GuideButton>
        </CentralizedCol>
      </StyledRow>
    </>
  )
}

const KappaSigmaMu = styled.img`
  margin: 50px 0;
  display: block;
`

const CanaryImg = styled.img`
  position: absolute;
  bottom: 30px;
  height: 90vh;
`

const StyledRow = styled(Row)`
  height: 91.7vh;
`

const CentralizedCol = styled(Col)`
  align-items: center;
  margin-bottom: auto;
  margin-top: auto;
  z-index: 1;
`

const GuideButton = styled(Button)`
  position: absolute;
  bottom: 30px;
  display: flex;
`

export { Home }
