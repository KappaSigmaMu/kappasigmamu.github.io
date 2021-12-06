import { ReactElement } from 'react'
import { Badge } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import CanarySvgLevel1 from '../static/canary-level-1.svg'

interface LevelsType {
  [key: string]: {badge: string, name: string, canary: ReactElement},
}

// Find a better way for positioning the canary (responsive)
const CanaryImg = styled.img`
  position: absolute;
  top: 23%;
  left: 11%;
  z-index: -1;
`

const CanaryLevel1 = <CanaryImg src={CanarySvgLevel1} alt="Canary Level 1" />
const CanaryLevel2 = <CanaryImg src={CanarySvgLevel1} alt="Canary Level 2" />
const CanaryLevel3 = <CanaryImg src={CanarySvgLevel1} alt="Canary Level 3" />
const CanaryLevel4 = <CanaryImg src={CanarySvgLevel1} alt="Canary Level 4" />

const LEVELS: LevelsType = {
  human: { badge: "Level 1", name: "Human", canary: CanaryLevel1 },
  bidder: { badge: "Level 2", name: "Bidder", canary: CanaryLevel2 },
  candidate: { badge: "Level 3", name: "Candidate", canary: CanaryLevel3 },
  cyborg: { badge: "Level 4", name: "Cyborg", canary: CanaryLevel4 }
}

const Level = () => {
  const { level } = useAccount()

  return (
    <>
      <p>
        <Badge pill>{LEVELS[level].badge}</Badge>
      </p>
      {LEVELS[level].canary}
      <h1><u>{LEVELS[level].name}</u></h1>
    </>
  )
}

export { Level }
