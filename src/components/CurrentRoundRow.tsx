import type { DeriveSociety } from '@polkadot/api-derive/types'
import { formatBalance } from '@polkadot/util'
import { useEffect, useState } from 'react'
import { Button, Container, Col, Row } from 'react-bootstrap'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import styled from 'styled-components'
import { useBlockTime } from '../hooks/useBlockTime'
import { useSubstrate } from '../substrate'
import 'react-circular-progressbar/dist/styles.css'

const Circle = ({ active = false }: { active?: boolean }): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="6" fill={active ? '#E6007A' : '#FFF'} />
  </svg>
)

const Strikes = (props: { count: number }): JSX.Element => {
  const strkesArray = Array(props.count)
    .fill(true)
    .concat(Array(10 - props.count).fill(false))

  return (
    <>
      {strkesArray.map((active, key) => (
        <Circle key={key} active={active} />
      ))}
    </>
  )
}

const FormatedKSM = (props: { children: any }): JSX.Element => (
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
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [info, setInfo] = useState<DeriveSociety | any>()
  const [rotationPeriod, setRotationPeriod] = useState<number>(0)
  const [strikes, setStrikes] = useState<number | any>(10)
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
              <FormatedKSM>
                {formatBalance(info?.pot.toString(), { decimals: 0 }).substring(0, 5).replace('.', ',')}
              </FormatedKSM>
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
              <Value>{JSON.stringify(strikes)}</Value>
              <FormatedKSM>{accountBid}</FormatedKSM>
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
              <Value>{strikes}</Value>&nbsp;<Unit>/&nbsp;10</Unit>
            </Col>
          </Row>
          <Row>
            <Col>
              <Strikes count={strikes} />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export { CurrentRoundRow }
