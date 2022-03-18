import ThreeCanary from "@kappasigmamu/canary-component"
import { Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState } from "react"
import { Col, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import { PrimaryLgButton } from '../components/base'
import { MemberOffcanvas } from "../components/MemberOffcanvas"
import { fetchAccounts } from '../helpers/fetchAccounts'
import { useKusama } from '../kusama'
import KappaSigmaMuTitle from '../static/kappa-sigma-mu-title.svg'

interface MemberData {
  [key: string]: string
}

interface MembersData {
  [key: string]: MemberData
}

const LandingPage = () => {
  const navigate = useNavigate()
  const { activeAccount, fetchAccounts } = useAccount()
  const { api } = useKusama()
  const [members, setMembers] = useState<Array<string>>([""])
  const [show, setShow] = useState(false)

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

  const handlePrimaryButtonClick = () => {
    if (!activeAccount) {
      fetchAccounts()
    }
    navigate('/journey')
  }

  return (
    <>
      <MemberOffcanvas
        show={show}
        handleClose={handleClose}
        member={selectedMember}
      />

      <FullPageHeightRow>
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
        <CentralizedCol xs={7} />
        <CentralizedCol xs={5}>
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
