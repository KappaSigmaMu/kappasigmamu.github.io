import { ApiPromise } from "@polkadot/api"
import Identicon from "@polkadot/react-identicon"
import { AccountId } from "@polkadot/types/interfaces"
import { useEffect, useState } from "react"
import { Col, Container, Offcanvas, Row } from "react-bootstrap"
import styled from "styled-components"
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
      <Offcanvas.Header closeButton onClick={onClose} />
      <Offcanvas.Body style={{ overflowY: "hidden", overflowX: "hidden" }}>
        {loading
          ? <LoadingSpinner />
          : <CanvasBody memberDetails={memberDetails!} />}
      </Offcanvas.Body>
    </StyledOffcanvas >
  )
}

const CanvasBody = ({ memberDetails }: { memberDetails: SocietyMemberDetails }) => (
  <Container>
    <StyledRow>
      <Col className="d-flex justify-content-center">
        <Identicon value={memberDetails.accountId} size={200} theme={'polkadot'} />
      </Col>
    </StyledRow>
    <StyledRow>
      <Col>
        {memberDetails.accountId.toHuman()}
      </Col>
    </StyledRow>
  </Container>
)

const StyledOffcanvas = styled(Offcanvas)`
  background: #33393F;
  box-shadow: rgba(0, 0, 0, 0.3) -6px 0px 20px 0px;
`

const StyledRow = styled(Row)`
  margin-top: 30px;
`

export { MemberDetailsOffCanvas }
