import { useEffect, useState } from 'react'
import { Col, Row, Offcanvas, Container, Badge, Spinner } from 'react-bootstrap'
import styled from 'styled-components'
import { Identicon } from '../pages/explore/components/Identicon'
import { apillonClient } from '../services/apillonClient'

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
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchTattooImage = async () => {
      if (!member?.hash) {
        setError(true)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(false)
        const listData = await apillonClient.listFiles(1000) // Fetch up to 1000 files
        const allFiles = listData.data?.items || []

        // Find the approved tattoo for this member
        const approvedFile = allFiles.find((file: any) => {
          const fileAddress = file.name.replace(/\.(jpg|png|heic|webp)$/i, '')
          return (
            (file.path === 'approved/' || file.path?.startsWith('approved/')) && fileAddress === member.hash
          )
        })

        if (approvedFile) {
          setImageUrl(approvedFile.link)
        } else {
          setError(true)
        }
      } catch (error) {
        console.error('Failed to fetch tattoo:', error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchTattooImage()
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

                    <p>Loading proof-of-ink from Apillon...</p>
                  </>
                )}

                {imageUrl && (
                  <img
                    src={imageUrl}
                    width={'340px'}
                    onError={() => setError(true)}
                    onLoad={() => setLoading(false)}
                    style={loading ? { display: 'none' } : {}}
                  />
                )}
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
