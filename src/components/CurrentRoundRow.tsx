import type { DeriveSociety } from '@polkadot/api-derive/types'
import { useEffect, useState } from 'react'
import { Button, Container, Col, Row } from 'react-bootstrap'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import styled from 'styled-components'
import { useBlockTime } from '../hooks/useBlockTime'
import { useConsts } from '../hooks/useConsts'
import { useSubstrate } from '../substrate'

const Circle = ({ active = false }: { active?: boolean }): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="6" fill={active ? '#E6007A' : '#FFF'} />
  </svg>
)

const Strikes = (props: { count: number; maxStrikes: number }): JSX.Element => {
  const strikesArray = Array(props.count)
    .fill(true)
    .concat(Array(props.maxStrikes - props.count).fill(false))

  return (
    <>
      {strikesArray.map((active, key) => (
        <Circle key={key} active={active} />
      ))}
    </>
  )
}

const FormattedKSM = (props: { children: any }): JSX.Element => (
  <>
    <Value>{props.children}</Value>
    &nbsp;&nbsp;
    <Unit>KSM</Unit>
  </>
)

const Unit = styled.span`
  color: #6c757d;
`

const Value = styled.span`
  color: #fff;
`

const Title = styled.h4`
  color: #fff;
`

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

const CurrentRoundRow = (props: { currentAccount: string }): JSX.Element => {
  const { api } = useSubstrate()
  const { maxStrikes } = useConsts()
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [info, setInfo] = useState<DeriveSociety | any>()
  const [rotationPeriod, setRotationPeriod] = useState<number>(0)
  const [strikes, setStrikes] = useState<number | any>(0)
  const periodBlocksDone = currentBlock % rotationPeriod
  const periodBlocksLeft = rotationPeriod - periodBlocksDone
  const percentageDone = 100 - (periodBlocksLeft * 100) / rotationPeriod
  const [, , time] = useBlockTime(periodBlocksLeft, api)
  const { days, hours, minutes, seconds } = time
  const accountBid = '54,223' // TODO: get it from api

  useEffect(() => {
    if (api) {
      const rotationPeriod = api.consts.society.rotationPeriod.toNumber()
      api.derive.chain.bestNumber((block) => {
        setCurrentBlock(block.toNumber())
      })
      setRotationPeriod(rotationPeriod)

      api.derive.society.info().then((response) => {
        setInfo(response)
      })

      api.derive.society.members().then((members) => {
        const account = members.find((member) => member.accountId.toString() === props.currentAccount)
        if (!account) return setStrikes(0)

        setStrikes(account?.strikes.toNumber())
      })
    }
  }, [api])

  return (
    <Container>
      <Row>
        <Col>
          <Row className="mb-3">
            <Col>
              <Title>Current Round</Title>
            </Col>
          </Row>
          <Row>
            <Col>
              <CurrentRoundProgress percentageDone={percentageDone} />
            </Col>
            <Col style={{ paddingLeft: 0 }}>
              <Value>{days}</Value>&nbsp;<Unit>day</Unit>
              <br />
              <Value>{hours}</Value>&nbsp;<Unit>hrs.</Unit>
              <br />
              <Value>{minutes}</Value>&nbsp;<Unit>mins.</Unit>
              <br />
              <Value>{seconds}</Value>&nbsp;<Unit>secs.</Unit>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="mb-3">
            <Col>
              <Title>Round Payout</Title>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormattedKSM>{info?.pot.toHuman().substring(0, 5)}</FormattedKSM>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="mb-3">
            <Col>
              <Title>My Bid</Title>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <FormattedKSM>{accountBid}</FormattedKSM>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button>Update</Button>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="mb-3">
            <Col>
              <Title>Strikes</Title>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col>
              <Value>{strikes}</Value>&nbsp;<Unit>/&nbsp;{maxStrikes.toNumber()}</Unit>
            </Col>
          </Row>
          <Row>
            <Col>
              <Strikes count={strikes} maxStrikes={maxStrikes.toNumber()} />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export { CurrentRoundRow }
