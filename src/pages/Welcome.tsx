import { Container, Row, Col, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Level } from '../components/Level'
import { SocialIcons } from '../components/SocialIcons'
import MapIcon from '../static/map-icon.svg'

const Welcome = (): JSX.Element => {
  return (
    <>
      <StyledDiv>
        <LevelContainer>
          <Row>
            <Level />
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
              <Link to="/guide" className="btn btn-outline-secondary" role="button">
                Cyborg Guide
                &nbsp;&nbsp;
                <span className="btn-label">
                  <img src={MapIcon} alt="Map Icon" />
                </span>
              </Link>
            </Col>
          </Row>

          <Link to="/home" className="btn btn-primary" role="button">
            Begin Journey
          </Link>
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

export { Welcome }
