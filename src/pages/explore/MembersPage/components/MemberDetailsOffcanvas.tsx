import { useEffect } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { ChainState, useAssetHub, usePeople } from '../../../../chain/ChainProvider'
import { useChainQuery } from '../../../../chain/hooks'
import type { AccountId, SocietyMemberDetails } from '../../../../chain/types'
import { AccountHeader } from '../../components/AccountHeader'
import { ChainError } from '../../components/ChainError'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { Offcanvas } from '../../components/Offcanvas'
import { fetchMemberDetails } from '../helpers/fetchMemberDetails'

type Props = { accountId: AccountId; show: boolean; onClose: () => void }

const MemberDetailsOffCanvas = ({ accountId, show, onClose }: Props) => {
  const { api } = useAssetHub()
  const people = usePeople()
  const peopleReady = people.state === ChainState.ready
  const state = useChainQuery(
    () =>
      api && (peopleReady || people.state === ChainState.error || people.state === ChainState.disconnected)
        ? fetchMemberDetails(api, peopleReady ? people.api : null, accountId)
        : undefined,
    [api, people.api, people.state, accountId]
  )
  useEffect(() => {
    if (show) state.refetch()
  }, [show])
  return (
    <Offcanvas show={show} placement="end" onClose={onClose} header={<h3>{state.data?.identity?.name}</h3>}>
      {state.error ? (
        <ChainError error={state.error} onRetry={state.refetch} />
      ) : state.isLoading || !state.data ? (
        <LoadingSpinner />
      ) : (
        <CanvasBody memberDetails={state.data} />
      )}
    </Offcanvas>
  )
}

const CanvasBody = ({ memberDetails }: { memberDetails: SocietyMemberDetails }) => {
  const { name, email, legal, webpage, riot, twitter } = memberDetails.identity ?? {}
  return (
    <Container>
      <AccountHeader accountId={memberDetails.accountId} />
      <StyledRow>{memberDetails.index && <>Index: {memberDetails.index}</>}</StyledRow>
      <StyledRow>{memberDetails.identity && <h4 className="p-0 m-0">Identity</h4>}</StyledRow>
      <StyledRow>
        <Row>{name}</Row>
        {legal && <Row>{legal}</Row>}
      </StyledRow>
      <StyledRow>
        <Col xs={3} className="text-uppercase extra-vertical-spacing">
          {email && <Row>email</Row>}
          {webpage && <Row>web</Row>}
          {riot && <Row>riot</Row>}
          {twitter && <Row>twitter</Row>}
        </Col>
        <Col xs={9} className="extra-vertical-spacing">
          {email && <Row>{email}</Row>}
          {webpage && <Row>{webpage}</Row>}
          {riot && <Row>{riot}</Row>}
          {twitter && <Row>{twitter}</Row>}
        </Col>
      </StyledRow>
    </Container>
  )
}
const StyledRow = styled(Row)`
  margin-top: 30px;
  .extra-vertical-spacing .row {
    margin-bottom: 5px;
  }
`
export { MemberDetailsOffCanvas }
