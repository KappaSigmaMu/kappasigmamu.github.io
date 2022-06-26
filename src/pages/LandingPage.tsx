import ThreeCanary from "@kappasigmamu/canary-component"
import { Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState } from "react"
import { Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { PrimaryLgButton, SecondaryLgButton } from '../components/base'
import { MemberOffcanvas } from "../components/MemberOffcanvas"
import { useKusama } from '../kusama'
import KappaSigmaMuTitle from '../static/kappa-sigma-mu-title.svg'

interface MemberData {
  [key: string]: string
}

interface MembersData {
  [key: string]: MemberData
}

// type ExplorerVariant = "canary" | "gil"

const LandingPage = () => {
  const navigate = useNavigate()
  const { api } = useKusama()
  const [members, setMembers] = useState<Array<string>>([""])
  const [show, setShow] = useState(false)
  // const [explorerVariant, setExplorerVariant] = useState<ExplorerVariant>("canary")

  const [selectedMember, setSelectedMember] = useState<MemberData>({})
  const [allMembers, setAllMembers] = useState<MembersData>({})

  const handleClose = () => setShow(false)

  const handleCanaryNodeClick = (nodeId: string) => {
    if (allMembers) {
      setShow(true)
      setSelectedMember(allMembers[nodeId])
    }
  }

  const setLevelCheckingAccounts = (accounts: AccountId32[], targetAccount: string, level: string) => {
    accounts.forEach((account: AccountId32) => {
      if (account.toString() === targetAccount) {
        const m = allMembers
        m[targetAccount].level = level
        setAllMembers(m)
      }
    })
  }

  useEffect(() => {
    if (api) {
      api.derive.society.members().then((members) => {
        members.forEach((member) => {
          const id = member.accountId.toString()
          const m = allMembers
          m[id] = {
            "hash": id,
            "name": "unknown",
            "level": "human",
            "strikes": member.strikes.toString()
          }
          setAllMembers(m)

          api.query.society.bids().then((response: Vec<PalletSocietyBid>) => {
            setLevelCheckingAccounts(response.map(account => account.who), id, 'bidder')
          })

          api.query.society.candidates().then((response: Vec<PalletSocietyBid>) => {
            setLevelCheckingAccounts(response.map(account => account.who), id, 'candidate')
          })

          api.query.society.members().then((response: Vec<AccountId32>) => {
            setLevelCheckingAccounts(response, id, 'cyborg')
          })

        })
      })

      api.query.society.members().then((response: Vec<AccountId32>) => {
        const ids = response.map((account) => account.toString())
        setMembers(ids)
      })

    }
  }, [api])

  const handleGuideButtonClick = () => {
    navigate('/journey')
  }

  const handlePartnershipButtonClick = () => {
    navigate('/futurivel')
  }

  return (
    <>
      <MemberOffcanvas
        show={show}
        handleClose={handleClose}
        member={selectedMember}
      />

      <FullPageHeightRow noGutters>
        <div className="position-absolute h-100">
          {allMembers ?
            <ThreeCanary
              objectUrl={`./static/canary.glb`}
              nodes={
                members.map((id: string) => ({
                  "hash": id,
                  "name": "Unknown",
                  "level": allMembers[id]?.level
                }))
              }
              onNodeClick={handleCanaryNodeClick}
            /> : null}
        </div>
        <CentralizedCol xs={0} lg={8} />
        <CentralizedCol xs={12} lg={4}>
          <h1 className="d-none d-lg-block">Join the</h1>
          <KappaSigmaMu className="d-none d-lg-block" src={KappaSigmaMuTitle} alt="Kappa Sigma Mu Title" />
          <ActionsContainer>
            <div className="d-lg-none">
              <span >Join the</span>
              <KappaSigmaMu src={KappaSigmaMuTitle} alt="Kappa Sigma Mu Title" />
            </div>
            <PrimaryLgButton onClick={handleGuideButtonClick}>
              Cyborg <br /> Guide
            </PrimaryLgButton>
            <SecondaryLgButton onClick={handlePartnershipButtonClick}>
              Partnership<br />with Gilberto Gil
            </SecondaryLgButton>
          </ActionsContainer>
        </CentralizedCol>
      </FullPageHeightRow>
    </>
  )
}

const ActionsContainer = styled.div`
  @media(min-width: 1024px) {
    .btn { 
      margin-right: 1rem;
    }
  }
  @media(max-width: 1024px) {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.5rem;
    position: absolute;
    left: 0vh;
    bottom: 2vh;
    .btn {
      font-size: 4.5vmin;
    }
  }
`

const KappaSigmaMu = styled.img`
  margin: 50px 0;
  display: block;
  @media(max-width: 1024px) {
    width: 80px;
    height: 80x;
    margin: 10px 0;
  }
`

const FullPageHeightRow = styled(Row)`
  --bs-gutter-x: 0;
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
