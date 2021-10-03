import { Col, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import { PrimaryLgButton } from '../components/base'
import Canary from '../static/canary.svg'
import { fetchAccounts } from '../helpers/fetchAccounts'
import KappaSigmaMuTitle from '../static/kappa-sigma-mu-title.svg'

const LandingPage = () => {
  const navigate = useNavigate()
  const { activeAccount, setActiveAccount, setAccounts } = useAccount()

  const handlePrimaryButtonClick = () => {
    if (!activeAccount) {
      fetchAccounts(setAccounts, setActiveAccount)
    }
    navigate('/welcome')
  }

  return (
    <>
      <FullPageHeightRow>
        <Col xs={6}>
          <CanaryImg src={Canary} alt="Canary" />
        </Col>
        <CentralizedCol xs={6}>
          <h1>Join the</h1>
          <KappaSigmaMu src={KappaSigmaMuTitle} alt="Kappa Sigma Mu Title" />
          <p>
            <PrimaryLgButton onClick={handlePrimaryButtonClick}>
              Become a Cyborg
            </PrimaryLgButton>
          </p>
          <p>
            <Link to="/guide">Cyborg Guide</Link>
          </p>
        </CentralizedCol>
      </FullPageHeightRow>
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

const FullPageHeightRow = styled(Row)`
  height: 89vh;
`

const CentralizedCol = styled(Col)`
  align-items: center;
  margin-bottom: auto;
  margin-top: auto;
  z-index: 1;
`

export { LandingPage }
