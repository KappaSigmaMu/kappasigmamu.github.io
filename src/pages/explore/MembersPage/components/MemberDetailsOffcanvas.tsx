import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { AccountHeader } from '../../components/AccountHeader'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { Offcanvas } from '../../components/Offcanvas'
import { fetchMemberDetails } from '../helpers/fetchMemberDetails'

type MemberDetailsOffCanvasProps = {
  api: ApiPromise
  accountId: AccountId
  show: boolean
  onClose: () => any
}

const MemberDetailsOffCanvas = ({ api, accountId, show, onClose }: MemberDetailsOffCanvasProps) => {
  const [loading, setLoading] = useState(true)
  const [memberDetails, setMemberDetails] = useState<SocietyMemberDetails | null>(null)

  useEffect(() => {
    if (!accountId) return
    setLoading(true)
    fetchMemberDetails(api, accountId).then((details) => {
      setMemberDetails(details)
      setLoading(false)
    })
  }, [accountId])

  return (
    <Offcanvas show={show} placement="end" onClose={onClose} header={<h3>{memberDetails?.identity?.name}</h3>}>
      {loading ? <LoadingSpinner /> : <CanvasBody memberDetails={memberDetails!} />}
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
