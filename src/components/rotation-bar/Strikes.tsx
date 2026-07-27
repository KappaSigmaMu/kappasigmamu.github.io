import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../../account/AccountContext'
import { useAssetHub } from '../../chain/ChainProvider'
import { useChainQuery } from '../../chain/hooks'
import { getSocietyMembers } from '../../chain/society/queries'
import { isSameAddress } from '../../chain/ss58'
import { useConsts } from '../../hooks/useConsts'

const Circle = ({ active = false }: { active?: boolean }): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="6" cy="6" r="6" fill={active ? '#E6007A' : '#FFF'} />
  </svg>
)
const StrikesCounter = ({ count, graceStrikes }: { count: number; graceStrikes: number }): JSX.Element => (
  <>
    {Array.from({ length: graceStrikes }, (_, index) => (
      <Circle key={index} active={index < count} />
    ))}
  </>
)

const Strikes = () => {
  const { api } = useAssetHub()
  const { activeAccount } = useAccount()
  const { graceStrikes } = useConsts()
  const { data: members } = useChainQuery(() => (api ? getSocietyMembers(api) : undefined), [api])
  const strikes = members?.find((member) => isSameAddress(member.accountId, activeAccount?.address))?.strikes ?? 0

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h4>Strikes</h4>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <Value>{strikes}</Value>&nbsp;<Unit>/&nbsp;{graceStrikes}</Unit>
        </Col>
      </Row>
      <Row>
        <Col>
          <StrikesCounter count={strikes} graceStrikes={graceStrikes} />
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
