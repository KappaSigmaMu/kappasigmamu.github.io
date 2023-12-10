import { u32 } from '@polkadot/types'
import { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import styled from 'styled-components'
import { useBlockTime } from '../../hooks/useBlockTime'
import { useKusama } from '../../kusama'

const CurrentRoundProgress = (props: { percentageDone: number }): JSX.Element => (
  <div style={{ width: 100, height: 100 }}>
    <CircularProgressbar
      value={props.percentageDone}
      styles={buildStyles({
        pathColor: '#E6007A',
        trailColor: '#fff',
        strokeLinecap: 'butt',
      })}
    />
  </div>
)

const CurrentRound = () => {
  return <>
    <CurrentRoundItem title='Voting Period' period='votingPeriod' />
    <CurrentRoundItem title='Challenge Period' period='challengePeriod' />
  </>
}

const CurrentRoundItem = ({ title, period }: { title: string, period: string }) => {
  const { api } = useKusama()
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [rotationPeriod, setRotationPeriod] = useState<number>(0)
  const periodBlocksDone = currentBlock % rotationPeriod
  const periodBlocksLeft = rotationPeriod - periodBlocksDone
  const percentageDone = 100 - (periodBlocksLeft * 100) / rotationPeriod
  const [, , time] = useBlockTime(periodBlocksLeft, api)
  const { days, hours, minutes, seconds } = time

  useEffect(() => {
    if (api) {
      const rotationPeriod = (api.consts.society[period] as u32).toNumber()
      api.derive.chain.bestNumber((block) => {
        setCurrentBlock(block.toNumber())
      })
      setRotationPeriod(rotationPeriod)
    }
  }, [api])

  return (
    <>
      <Row className="mt-4 mb-1">
        <Col>
          <h4>{title}</h4>
        </Col>
      </Row>
      <Row>
        <Col sm="auto">
          <CurrentRoundProgress percentageDone={percentageDone} />
        </Col>
        <Col className="ps-0">
          <Value>{days}</Value>&nbsp;<Unit>day</Unit>
          <br />
          <Value>{hours}</Value>&nbsp;<Unit>hrs.</Unit>
          <br />
          <Value>{minutes}</Value>&nbsp;<Unit>mins.</Unit>
          <br />
          <Value>{seconds}</Value>&nbsp;<Unit>secs.</Unit>
        </Col>
      </Row>
    </>
  )
}

const Unit = styled.span`
  color: ${(props) => props.theme.colors.lightGrey};
`

const Value = styled.span`
  color: ${(props) => props.theme.colors.white};
`

export { CurrentRound }
