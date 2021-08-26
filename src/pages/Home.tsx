import React from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { Navbar } from '../components/navbar'
import Canary from '../static/canary.svg'
import KappaSigmaMuTitle from './kappa-sigma-mu-title.svg'

const Home = ({ setAccount, account }: any) => {
  return (
    <>
      <Navbar
        showSocialIcons
        showAccount
        setAccount={setAccount}
        account={account}
      />
      <StyledRow>
        <Col xs={6}>
          <CanaryImg src={Canary} alt="Canary" />
        </Col>
        <CentralizedCol xs={6}>
          <JoinThe>Join the</JoinThe>
          <KappaSigmaMu src={KappaSigmaMuTitle} alt="Kappa Sigma Mu Title" />
          <HomeButton>Become a Cyborg</HomeButton>
          <ButtomGuide href="/cyborg-guide">Cyborg Guide</ButtomGuide>
        </CentralizedCol>
      </StyledRow>
    </>
  )
}

const HomeButton = styled.button`
  background-color: #e6007a;
  padding: 8px 16px;
  color: white;
  border: 1px solid #e6007a;
  border-radius: 4px;
  font-weight: 700;
  font-size: 20px;

  &:hover {
    background-color: white;
    color: #e6007a;
    border-color: white;
  }
`

const JoinThe = styled.h1`
  color: white;
  margin: 0;
`

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
  height: 90vh;
`

const CentralizedCol = styled(Col)`
  align-items: center;
  margin-bottom: auto;
  margin-top: auto;
  z-index: 1;
`

const ButtomGuide = styled.a`
  position: absolute;
  bottom: 30px;
  display: flex;
  color: #e6007a;
  cursor: pointer;

  &:hover {
    color: white;
  }
`

export { Home }
