import { ThreeCanary, defaultConfig } from '@kappasigmamu/canary-component'
import { StorageKey } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { LoadingSpinner } from './explore/components/LoadingSpinner'
import { OutlinedPrimaryLgButton, OutlinedSecondaryLgButton } from '../components/base'
import { MemberOffcanvas } from '../components/MemberOffcanvas'
import { useKusama } from '../kusama'
import { ApiState } from '../kusama/KusamaContext'
import KappaSigmaMuTitle from '../static/kappa-sigma-mu-title.svg'

const customGilConfig = {
  ...defaultConfig.gil,
  bloom: {
    kernelSize: 1,
    luminanceThreshold: 0.1,
    luminanceSmoothing: 0.05,
    intensity: 0.1
  }
}

interface MemberData {
  [key: string]: string
}

interface MembersData {
  [key: string]: MemberData
}

const GilbertoGilPage = () => {
  window.scrollTo(0, 0)

  const navigate = useNavigate()
  const { api, apiState } = useKusama()
  const [members, setMembers] = useState<Array<string>>([])
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

  useEffect(() => {
    if (api && apiState === ApiState.ready) {
      api.query.society.members.keys().then((members: StorageKey<[AccountId32]>[]) => {
        const ids = members.map((account) => account.toHuman()!.toString())
        setMembers(ids)

        // TODO: include identity and picture here
        members.forEach((member) => {
          const id = member.toHuman()!.toString()
          const m = allMembers
          m[id] = {
            hash: id,
            name: 'unknown',
            level: 'cyborg'
          }
          setAllMembers(m)
        })
      })
    }
  }, [api, apiState])

  const handleGuideButtonClick = () => {
    navigate('/guide')
  }

  const handlePartnershipButtonClick = () => {
    navigate('/futurivel')
  }

  const handleExploreButtonClick = () => {
    navigate('/explore/bidders')
  }

  return (
    <>
      <MemberOffcanvas show={show} handleClose={handleClose} member={selectedMember} />
      <FullPageHeightRow noGutters>
        <div className="position-absolute h-100">
          {members && (
            <ThreeCanary
              objectUrl={`./static/gil.glb`}
              nodes={members.map((id: string) => ({
                hash: id,
                name: 'Unknown',
                level: allMembers[id]?.level
              }))}
              onNodeClick={handleCanaryNodeClick}
              config={customGilConfig}
            />
          )}
        </div>
        <CentralizedCol xs={0} lg={8} />
        <CentralizedCol xs={12} lg={4}>
          <h1 className="d-none d-lg-block">Join the</h1>
          <KappaSigmaMu className="d-none d-lg-block" src={KappaSigmaMuTitle} alt="Kappa Sigma Mu Title" />
          <ActionsContainer>
            <OutlinedPrimaryLgButton onClick={handleExploreButtonClick}>
              Explore
              <br />
              Society
            </OutlinedPrimaryLgButton>
            <OutlinedPrimaryLgButton onClick={handleGuideButtonClick}>
              Cyborg
              <br />
              Guide
            </OutlinedPrimaryLgButton>
            <OutlinedSecondaryLgButton onClick={handlePartnershipButtonClick}>
              About the
              <br /> partnership
            </OutlinedSecondaryLgButton>
          </ActionsContainer>
        </CentralizedCol>
      </FullPageHeightRow>
    </>
  )
}

const ActionsContainer = styled.div`
  @media (min-width: 1024px) {
    .btn {
      margin-right: 1rem;
    }
  }
  @media (max-width: 1024px) {
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
  @media (max-width: 1024px) {
    width: 80px;
    height: 80px;
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

const LoadingContainer = styled.div`
  position: absolute;
  z-index: 2;
  width: 300px;
  top: calc(50% - 70px);
  left: calc(50% - 150px);
  padding: 10px;
  padding-bottom: 15px;
  background-color: rgba(0, 0, 0, 0.75);
  border-radius: 10px;
`

export { GilbertoGilPage }
