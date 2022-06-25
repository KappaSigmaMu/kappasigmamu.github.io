import { ApiPromise } from "@polkadot/api"
import Identicon from "@polkadot/react-identicon"
import { AccountId } from "@polkadot/types/interfaces"
import { useEffect, useState } from "react"
import { Col, Container, Offcanvas, Row } from "react-bootstrap"
import styled from "styled-components"
import { CopyButton } from "../../../../components/CopyButton"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { fetchMemberDetails } from "../helpers/fetchMemberDetails"

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
    <StyledOffcanvas show={show} placement="end" backdrop={true}>
      <Offcanvas.Header closeButton onClick={onClose}>
        <h3>{memberDetails?.identity?.name}</h3>
      </Offcanvas.Header>
      <Offcanvas.Body style={{ overflowY: "hidden", overflowX: "hidden" }}>
        {loading
          ? <LoadingSpinner />
          : <CanvasBody memberDetails={memberDetails!} />}
      </Offcanvas.Body>
    </StyledOffcanvas >
  )
}

const CanvasBody = ({ memberDetails }: { memberDetails: SocietyMemberDetails }) => {
  const { name, email, legal, webpage, riot, twitter } = memberDetails.identity ?? {}
  return (
    <Container>
      <Row>
        <Col className="d-flex justify-content-center">
          <Identicon value={memberDetails.accountId} size={100} theme={'polkadot'} />
        </Col>
      </Row>
      <Row>
        <HashRow className="mx-auto">
          {memberDetails.accountId.toHuman()}
        </HashRow>
      </Row>
      <Row className="mt-3">
        <CopyButton content={memberDetails.accountId.toHuman()} />
      </Row>
      <StyledRow>
        {memberDetails.index && <>Index: {memberDetails.index}</>}
      </StyledRow>
      <StyledRow>
        {memberDetails.identity && <h4 className="p-0 m-0">Identity</h4>}
      </StyledRow>
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

const StyledOffcanvas = styled(Offcanvas)`
  background: #33393F;
  box-shadow: rgba(0, 0, 0, 0.3) -6px 0px 20px 0px;
  .offcanvas-header .btn-close {
    margin: unset;
  }
`

const HashRow = styled(Row)`
  margin-top: 30px;
  word-break: break-all;
  display: inline-block;
  width: 27ch;
  font-family: monospace;
`

const StyledRow = styled(Row)`
  margin-top: 30px;
  .extra-vertical-spacing .row {
    margin-bottom: 5px;
  }
`

export { MemberDetailsOffCanvas }
