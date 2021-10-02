import { ReactElement } from 'react'
import { Badge } from 'react-bootstrap'
import styled from 'styled-components'
import CanaryLevel1 from '../static/canary-level-1.svg'

interface LevelsType {
  [key: string]: {badge: string, name: string, canary: ReactElement},
}

// Find a better way for positioning the canary (responsive)
const CanaryImg = styled.img`
  position: absolute;
  top: 23%;
  left: 11%;
`

const CANARY_LEVEL_1 = <CanaryImg src={CanaryLevel1} alt="Canary Level 1" />
const CANARY_LEVEL_2 = <CanaryImg src={CanaryLevel1} alt="Canary Level 2" />
const CANARY_LEVEL_3 = <CanaryImg src={CanaryLevel1} alt="Canary Level 3" />
const CANARY_LEVEL_4 = <CanaryImg src={CanaryLevel1} alt="Canary Level 4" />

const LEVELS: LevelsType = {
  human: { badge: "Level 1", name: "Human", canary: CANARY_LEVEL_1 },
  bidder: { badge: "Level 2", name: "Bidder", canary: CANARY_LEVEL_2 },
  candidate: { badge: "Level 3", name: "Candidate", canary: CANARY_LEVEL_3 },
  cyborg: { badge: "Level 4", name: "Cyborg", canary: CANARY_LEVEL_4 }
}

const Level = ({ level }: { level: string }) => (
  <>
    <p>
      <Badge pill>{LEVELS[level].badge}</Badge>
    </p>
    {LEVELS[level].canary}
    <h1><u>{LEVELS[level].name}</u></h1>
  </>
)

export { Level }
