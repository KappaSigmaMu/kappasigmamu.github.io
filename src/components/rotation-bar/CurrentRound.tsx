import { u32 } from '@polkadot/types'
import { Time } from '@polkadot/util/types'
import { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import styled from 'styled-components'
import {
  calculateChallengePercentage,
  calculateClaimPercentage,
  calculateVotingPercentage,
  isVotingPeriod
} from './helpers/periods'
import { useKusama } from '../../kusama'

const CurrentRound = () => {
  const { api } = useKusama()
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [challengePeriod, setChallengePeriod] = useState<number>(0)
  const [votingPeriod, setVotingPeriod] = useState<number>(0)
  const [claimPeriod, setClaimPeriod] = useState<number>(0)

  useEffect(() => {
    if (api) {
      const challengePeriod = (api.consts.society.challengePeriod as u32).toNumber()
      setChallengePeriod(challengePeriod)

      const votingPeriod = (api.consts.society.votingPeriod as u32).toNumber()
      setVotingPeriod(votingPeriod)

      const claimPeriod = (api.consts.society.claimPeriod as u32).toNumber()
      setClaimPeriod(claimPeriod)

      api.derive.chain.bestNumber((block) => {
        setCurrentBlock(block.toNumber())
      })
    }
  }, [api])

  const isVoting = isVotingPeriod(votingPeriod, claimPeriod, currentBlock)
  const text = isVoting ? 'Waiting for voting period to end' : 'Waiting for claim period to end'

  return (
    <>
      <CurrentRoundItem
        title="Claim Period"
        inactive={isVoting}
        text={text}
        info={calculateClaimPercentage(currentBlock, votingPeriod, claimPeriod, api)}
      />
      <CurrentRoundItem
        title="Voting Period"
        inactive={!isVoting}
        text={text}
        info={calculateVotingPercentage(currentBlock, votingPeriod, claimPeriod, api)}
      />
      <CurrentRoundItem
        title="Challenge Period"
        inactive={false}
        info={calculateChallengePercentage(currentBlock, challengePeriod, api)}
      />
    </>
  )
}

type CurrentRoundItemProps = {
  title: string
  inactive: boolean
  text?: string
  info: {
    percentageDone: number
    time: Time
  }
}

const CurrentRoundItem = ({ title, inactive, text, info }: CurrentRoundItemProps) => {
  const { days, hours, minutes, seconds } = info.time

  return (
    <>
      <Row className="mt-4 mb-1">
        <Col>
          <h4>{title}</h4>
        </Col>
      </Row>
      <Row>
        <Col>
          <CurrentRoundProgress percentageDone={inactive ? 100 : info.percentageDone} />
        </Col>
        <Col className="ps-0">
          {inactive ? (
            <h6 className="mt-4">{text}</h6>
          ) : (
            <>
              <Value>{days}</Value>&nbsp;<Unit>day</Unit>
              <br />
              <Value>{hours}</Value>&nbsp;<Unit>hrs.</Unit>
              <br />
              <Value>{minutes}</Value>&nbsp;<Unit>mins.</Unit>
              <br />
              <Value>{seconds}</Value>&nbsp;<Unit>secs.</Unit>
            </>
          )}
        </Col>
      </Row>
    </>
  )
}

const CurrentRoundProgress = (props: { percentageDone: number }): JSX.Element => (
  <div style={{ width: 100, height: 100 }}>
    <CircularProgressbar
      value={props.percentageDone}
      styles={buildStyles({
        pathColor: '#E6007A',
        trailColor: '#fff',
        strokeLinecap: 'butt'
      })}
    />
  </div>
)

const Unit = styled.span`
  color: ${(props) => props.theme.colors.lightGrey};
`

const Value = styled.span`
  color: ${(props) => props.theme.colors.white};
`

export { CurrentRound }
