import { Col, Row } from 'react-bootstrap'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import styled from 'styled-components'
import {
  calculateChallengePercentage,
  calculateClaimPercentage,
  calculateVotingPercentage,
  isVotingPeriod
} from './helpers/periods'
import { useConsts } from '@/hooks/useConsts'
import { useRelayChainBlockNumber } from '@/hooks/useRelayChainBlockNumber'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'

const CurrentRound = () => {
  const currentBlock = useRelayChainBlockNumber() ?? 0
  const { challengePeriod, votingPeriod, claimPeriod } = useConsts()
  if (challengePeriod <= 0 || votingPeriod <= 0 || claimPeriod <= 0) return <LoadingSpinner center={false} small />

  const isVoting = isVotingPeriod(votingPeriod, claimPeriod, currentBlock)
  const text = isVoting ? 'Waiting for voting period to end' : 'Waiting for claim period to end'

  return (
    <>
      <CurrentRoundItem
        title="Claim Period"
        inactive={isVoting}
        text={text}
        info={calculateClaimPercentage(currentBlock, votingPeriod, claimPeriod)}
      />
      <CurrentRoundItem
        title="Voting Period"
        inactive={!isVoting}
        text={text}
        info={calculateVotingPercentage(currentBlock, votingPeriod, claimPeriod)}
      />
      <CurrentRoundItem
        title="Challenge Period"
        inactive={false}
        info={calculateChallengePercentage(currentBlock, challengePeriod)}
      />
    </>
  )
}

type CurrentRoundItemProps = {
  title: string
  inactive: boolean
  text?: string
  info: { percentageDone: number; time: { days: number; hours: number; minutes: number; seconds: number } }
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

const CurrentRoundProgress = ({ percentageDone }: { percentageDone: number }): JSX.Element => (
  <div style={{ width: 100, height: 100 }}>
    <CircularProgressbar
      value={percentageDone}
      styles={buildStyles({ pathColor: '#E6007A', trailColor: '#fff', strokeLinecap: 'butt' })}
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
