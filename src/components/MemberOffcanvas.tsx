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
            <Col md={2} />
            <Col>
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
          </StyledRow>
          <StyledRow>
            <Col>
              <div className="h1 text-decoration-underline">{member?.name?.toUpperCase()}</div>
            </Col>
          </StyledRow>
          <StyledRow>
            <Col>
              <p>{formatHash(member?.hash)}</p>
            </Col>
          </StyledRow>
          <StyledRow>
            <Col>
              <p>Strikes: {member?.strikes}</p>
            </Col>
          </StyledRow>
          {hashToPoI[member?.hash] &&
            <StyledRow>
              <Col>
                <p>Proof of Ink</p>
                <img src={hashToPoI[member?.hash]} width={"330px"} />
              </Col>
            </StyledRow>
          }
        </Container>
      </Offcanvas.Body>
    </StyledOffcanvas>
  )
}

const StyledOffcanvas = styled(Offcanvas)`
  background: #33393F;
`

const StyledRow = styled(Row)`
  margin-top: 30px;
`

export { MemberOffcanvas }
