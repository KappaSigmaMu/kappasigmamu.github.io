import Identicon from '@polkadot/react-identicon'
import { useEffect, useState } from 'react'
import { Col, Row, Offcanvas, Container, Badge, Spinner } from 'react-bootstrap'
import styled from 'styled-components'
import { fastestGateway, getLatestPinnedHash, imageUrl } from '../helpers/ipfs'

const formatHash = (str: string) => {
  if (!str) return ''
  const numChars = 6
  const sep = '...'
  const strLen = str.length
  const head = str.slice(0, numChars)
  const tail = str.slice(strLen - 5, strLen)
  return head + sep + tail
}

const MemberOffcanvas = (props: { show: boolean; handleClose: any; member: any }) => {
  const { member } = props
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [folderHash, setFolderHash] = useState('')
  const [gateway, setGateway] = useState('')

  useEffect(() => {
    const fetchPinnedHash = async () => {
      const folderHash = await getLatestPinnedHash()
      setFolderHash(folderHash)
      const gateway = await fastestGateway(folderHash)
      setGateway(gateway)
    }

    fetchPinnedHash()
  }, [])

  useEffect(() => {
    setLoading(true)
  }, [member])

  return (
    <StyledOffcanvas show={props.show} onHide={props.handleClose} placement="start" backdrop={true}>
      <Offcanvas.Header closeButton></Offcanvas.Header>
      <Offcanvas.Body style={{ overflowY: 'scroll' }}>
        <Container>
          <StyledRow>
            <Col className="d-flex justify-content-center">
              <Identicon value={member?.hash} size={200} theme={'polkadot'} />
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
            {!error ? (
              <Col>
                <p>Proof-of-Ink</p>

                {loading && (
                  <>
                    <Spinner className="mb-2" animation="border" role="status" variant="secondary" />

                    <p>Be patient. The proof-of-ink pictures are hosted on IPFS and might take a while to load.</p>
                  </>
                )}

                <img
                  src={imageUrl({ gateway, folderHash, member: member?.hash })}
                  width={'340px'}
                  onError={() => setError(true)}
                  onLoad={() => setLoading(false)}
                  style={loading ? { display: 'none' } : {}}
                />
              </Col>
            ) : (
              <Col>
                <p>
                  Proof of Ink not found. Contact the development team on &nbsp;
                  <a href="https://matrix.to/#/!BUmiAAnAYSRGarqwOt:matrix.parity.io?via=matrix.parity.io">Element</a>
                  &nbsp; if this is your address.
                </p>
              </Col>
            )}
          </StyledRow>
        </Container>
      </Offcanvas.Body>
    </StyledOffcanvas>
  )
}

const StyledOffcanvas = styled(Offcanvas)`
  background: #33393f;
`

const StyledRow = styled(Row)`
  margin-top: 30px;
`

export { MemberOffcanvas }
