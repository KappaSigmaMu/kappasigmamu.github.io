import { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../../account/AccountContext'
import { useConsts } from '../../hooks/useConsts'
import { useKusama } from '../../kusama'

const Circle = ({ active = false }: { active?: boolean }): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="6" fill={active ? '#E6007A' : '#FFF'} />
  </svg>
)

const StrikesCounter = (props: { count: number; maxStrikes: number }): JSX.Element => {
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

const Strikes = () => {
  const { api } = useKusama()
  const { activeAccount } = useAccount()
  const [strikes, setStrikes] = useState<number>(0)
  const { maxStrikes } = useConsts()

  useEffect(() => {
    if (api) {
      api.derive.society.members().then((members) => {
        const account = members.find((member) => {
          activeAccount && member.accountId.toString() === activeAccount.address
        })
        if (!account) return setStrikes(0)

        setStrikes(account.strikes.toNumber())
      })
    }
  }, [api])

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h4>Strikes</h4>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <Value>{strikes}</Value>&nbsp;<Unit>/&nbsp;{maxStrikes.toNumber()}</Unit>
        </Col>
      </Row>
      <Row>
        <Col>
          <StrikesCounter count={strikes} maxStrikes={maxStrikes.toNumber()} />
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

export { Strikes }
