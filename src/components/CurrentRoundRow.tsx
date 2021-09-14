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
    <WhiteSpan>{props.children}</WhiteSpan>
    &nbsp;&nbsp;
    <GraySpan>KSM</GraySpan>
  </>
)

const GraySpan = styled.span`
  color: #6c757d;
`

const WhiteSpan = styled.span`
  color: #fff;
`

const CurrentRoundRow = (): JSX.Element => {
  const { api } = useSubstrate()
  const [info, setInfo] = useState<DeriveSociety | any>()
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [rotationPeriod, setRotationPeriod] = useState<number>(0)
  const periodBlocksDone = currentBlock % rotationPeriod
  const periodBlocksLeft = rotationPeriod - periodBlocksDone
  const percentageDone = 100 - (periodBlocksLeft * 100) / rotationPeriod
  const [, , time] = useBlockTime(periodBlocksLeft, api)
  const { days, hours, minutes, seconds } = time
  const strikes = 6 // TODO: get it from api
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
    }
  }, [api])

  return (
    <Container>
      <Row>
        <Col>
          <Row className="mb-3">
            <Col>
              <h4 style={{ color: 'white' }}>Current Round</h4>
            </Col>
          </Row>
          <Row>
            <Col>
              <div style={{ width: 100, height: 100 }}>
                <CircularProgressbar
                  value={percentageDone}
                  styles={buildStyles({
                    pathColor: '#E6007A',
                    trailColor: '#fff',
                    strokeLinecap: 'butt',
                  })}
                />
              </div>
            </Col>
            <Col style={{ paddingLeft: 0 }}>
              <WhiteSpan>{days}</WhiteSpan>
              &nbsp;
              <GraySpan>day</GraySpan>
              <br />
              <WhiteSpan>{hours}</WhiteSpan>
              &nbsp;
              <GraySpan>hrs.</GraySpan>
              <br />
              <WhiteSpan>{minutes}</WhiteSpan>
              &nbsp;
              <GraySpan>mins.</GraySpan>
              <br />
              <WhiteSpan>{seconds}</WhiteSpan>
              &nbsp;
              <GraySpan>secs.</GraySpan>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="mb-3">
            <Col>
              <h4 style={{ color: 'white' }}>Round Payout</h4>
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
              <h4 style={{ color: 'white' }}>My Bid</h4>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
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
              <h4 style={{ color: 'white' }}>Strikes</h4>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col>
              <WhiteSpan>{strikes}</WhiteSpan>
              &nbsp;
              <GraySpan>/&nbsp;10</GraySpan>
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
