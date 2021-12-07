import ThreeCanary from "@kappasigmamu/canary-component"
import { Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { useEffect, useState } from "react"
import { Col, Row, Offcanvas } from 'react-bootstrap'
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
  const [show, setShow] = useState(true)
  const [selectedMember, setSelectedMember] = useState<string>("")

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const handleCanaryNodeClick = (nodeId : string) => {
    setShow(true)
    setSelectedMember(nodeId)
  }

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
    navigate('/journey')
  }

  return (
    <>
      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{selectedMember}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {members} - {selectedMember}
        </Offcanvas.Body>
      </Offcanvas>

      <FullPageHeightRow>
        <div className="position-absolute h-100">
          <ThreeCanary
              objectUrl={`./static/canary.glb`}
              nodes={
                members.map((id : string) => ({
                  "hash": id.toString()
                }))
              }
              onNodeClick={handleCanaryNodeClick}
          />
        </div>
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

const FullPageHeightRow = styled(Row)`
  height: 85vh;
  width: 100%;
`

const CentralizedCol = styled(Col)`
  align-items: center;
  margin-bottom: auto;
  margin-top: auto;
  z-index: 1;
`

export { LandingPage }
