import ThreeCanary from "@kappasigmamu/canary-component"
import { Col, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import { PrimaryLgButton } from '../components/base'
import { fetchAccounts } from '../helpers/fetchAccounts'
import KappaSigmaMuTitle from '../static/kappa-sigma-mu-title.svg'

const choose = (choices: Array<string>) => {
  const index = Math.floor(Math.random() * choices.length)
  return choices[index]
}

const nodesDataFactory = (n: number) => {
  const data = []
  for (let i=0; i<n; i+=1) {
    data.push({
      "id": Math.floor(Math.random()*100),
      "name": choose(["Arthur C. Clarke", "Douglas Adams", "Isaac Asimov"]),
      "level": choose(["human", "cyborg"]),
      "hash": choose(["0x08eded6a76d84e309e3f09705ea2853f", "0xdeadbeefe6a76d84e309e3f09705ea28589"]),
      // "img": choose(["/assets/t1.jpg", "/assets/t2.jpg"])
    })
  }
  return data
}

const nodesData = nodesDataFactory(1500)

const LandingPage = () => {
  const navigate = useNavigate()
  const { activeAccount, setActiveAccount, setAccounts } = useAccount()

  const handlePrimaryButtonClick = () => {
    if (!activeAccount) {
      fetchAccounts(setAccounts, setActiveAccount)
    }
    navigate('/home')
  }

  return (
    <>
      <div className="position-absolute h-100 g-0">
        <ThreeCanary
            objectUrl={`./static/canary.glb`}
            nodes={nodesData}
        />
      </div>
      <CentralizedRow>
        <Col md={{ span: 3, offset: 6 }}>
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
        </Col>
      </CentralizedRow>
    </>
  )
}

const KappaSigmaMu = styled.img`
  margin: 50px 0;
  display: block;
`

const CentralizedRow = styled(Row)`;
  transform: translateY(25%);
  z-index: 1;
`

export { LandingPage }
