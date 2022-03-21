import Identicon from '@polkadot/react-identicon'
import { Col, Row, Offcanvas, Container, Badge } from 'react-bootstrap'
import styled from 'styled-components'
import { hashToPoI } from '../helpers/hashToPoI'

const formatHash = (str: string) => {
  if (!str) return ""
  const numChars = 6
  const sep = "..."
  const strLen = str.length
  const head = str.slice(0, numChars)
  const tail = str.slice(strLen - 5, strLen)
  return head + sep + tail
}

const MemberOffcanvas = (props: { show: boolean, handleClose: any, member: any }) => {
  const { member } = props

  return (
    <StyledOffcanvas show={props.show} onHide={props.handleClose} placement="end" backdrop={true}>

      <Offcanvas.Header closeButton>

      </Offcanvas.Header>
      <Offcanvas.Body>
        <Container>
          <StyledRow>
            <Col className="d-flex justify-content-center">
              <Identicon
                value={member?.hash}
                size={200}
                theme={'polkadot'}
              />
            </Col>
          </StyledRow>
          <StyledRow>
            <Col>
              <Badge pill>{member?.level?.toUpperCase()}</Badge>
            </Col>
            <Col className="d-flex justify-content-end">
              <Badge pill>Strikes: {member?.strikes}</Badge>
            </Col>
          </StyledRow>
          <StyledRow>
            <Col>
              <div className="h2">{formatHash(member?.hash)}</div>
            </Col>
          </StyledRow>
          <StyledRow>
            {hashToPoI[member?.hash] ?
              <Col>
                <p>Proof of Ink</p>
                <img src={hashToPoI[member?.hash]} width={"340px"} />
              </Col>
              :
              <Col>
                <p>Proof of Ink not found. Contact the development team on
                  &nbsp;
                  <a href="https://matrix.to/#/!BUmiAAnAYSRGarqwOt:matrix.parity.io?via=matrix.parity.io">Element</a>
                  &nbsp;
                  if this is your address.
                </p>
              </Col>
            }
          </StyledRow>
        </Container>
      </Offcanvas.Body>
    </StyledOffcanvas >
  )
}

const StyledOffcanvas = styled(Offcanvas)`
  background: #33393F;
`

const StyledRow = styled(Row)`
  margin-top: 30px;
`

export { MemberOffcanvas }
