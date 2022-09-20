/* eslint-disable react/no-unescaped-entities */
import Identicon from '@polkadot/react-identicon'
import { useEffect, useState } from 'react'
import { Col, Row, Offcanvas, Container, Badge, Spinner } from 'react-bootstrap'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
  }, [member])

  return (
    <StyledOffcanvas show={props.show} onHide={props.handleClose} placement="start" backdrop={true}>

      <Offcanvas.Header closeButton>

      </Offcanvas.Header>
      <Offcanvas.Body style={{ overflowY: "hidden" }}>
        <Container>
          <StyledRow>

            {hashToPoI[member?.hash] ?
              <Col>
                <h2>Lauro Gripa</h2>

                {loading &&
                  <>
                    <Spinner
                      className="mb-2"
                      animation="border"
                      role="status"
                      variant="secondary">
                    </Spinner>

                    <p>
                      Carregando
                    </p>
                  </>
                }

                <img
                  src={hashToPoI[member?.hash]}
                  width={"340px"}
                  onLoad={() => setLoading(false)}
                  style={loading ? { display: 'none' } : {}}
                />

                <br /><br />

                <p>
                  "Sou um grande fã do Gil,
                  tanto em seu trabalho artístico quanto político na defesa pelo software livre.
                  É uma grande honra contribuir para esse projeto."
                </p>
              </Col>
              :
              <Col>
                <p>Este contribuiente preferiu não se identificar
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
