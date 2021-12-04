import ThreeCanary from "@kappasigmamu/canary-component"
import { Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { useEffect, useState } from "react"
import { Col, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import { PrimaryLgButton } from '../components/base'
import { fetchAccounts } from '../helpers/fetchAccounts'
import { useKusama } from '../kusama'
import KappaSigmaMuTitle from '../static/kappa-sigma-mu-title.svg'

const LandingPage = () => {
  const navigate = useNavigate()
  const { activeAccount, setActiveAccount, setAccounts } = useAccount()
  const { api } = useKusama()
  const [members, setMembers] = useState<Array<string>>([""])

  useEffect(() => {
    if (api) {      
      api.query.society.members().then((response: Vec<AccountId32>) => {
        setMembers(response.map((account) => account.toString()))
      })
    }
  }, [api])

  const handlePrimaryButtonClick = () => {
    if (!activeAccount) {
      fetchAccounts(setAccounts, setActiveAccount)
    }
    navigate('/guide')
  }

  return (
    <>
      <FullPageHeightRow>
        <CanaryDiv className="position-absolute">
          <ThreeCanary
              objectUrl={`./static/canary.glb`}
              nodes={
                members.map((id : string) => ({
                  "hash": id.toString()
                }))
              }
          />
        </CanaryDiv>
        <CentralizedCol xs={6} />
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

const CanaryDiv = styled.div`
  height: 91%;
`

const FullPageHeightRow = styled(Row)`
  --bs-gutter-x: 0px;
  height: 89vh;
`

const CentralizedCol = styled(Col)`
  align-items: center;
  margin-bottom: auto;
  margin-top: auto;
  z-index: 1;
`

export { LandingPage }
