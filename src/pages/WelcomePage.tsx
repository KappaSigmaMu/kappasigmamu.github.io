import { Badge, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Level } from '../components/Level'
import { SocialIcons } from '../components/SocialIcons'
import MapIcon from '../static/map-icon.svg'

const WelcomePage = (): JSX.Element => {
  return (
    <>
      <LevelContainer>
        <Row>
          <Col><Level /></Col>
        </Row>
      </LevelContainer>
      <StyledContainer>
        <Row className="mb-5">
          <Col><Badge pill>WALLET CONNECTED</Badge></Col>
        </Row>
        <Row className="mb-5">
          <Col><h1>Welcome, Human.</h1></Col>
        </Row>
        <Row>
          <Col>
            <h4>JOIN THE LOUNGE</h4>
            <p>Meet other Cyborgs.</p>
          </Col>
          <Col>
            <h4>CHECK THE GAME GUIDE</h4>
            <p>Learn how to become a Cyborg.</p>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col><SocialIcons /></Col>
          <Col>
            <Link to="/guide" className="btn btn-outline-secondary" role="button">
              Cyborg Guide
              &nbsp;&nbsp;
              <span className="btn-label">
                <img src={MapIcon} alt="Map Icon" />
              </span>
            </Link>
          </Col>
        </Row>
        <Row>
          <Col>
            <Link to="/journey" className="btn btn-primary" role="button">
              Begin Journey
            </Link>
          </Col>
        </Row>
      </StyledContainer>
    </>
  )
}

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

export { WelcomePage }
