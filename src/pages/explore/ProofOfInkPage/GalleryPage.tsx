import { useEffect, useState } from 'react'
import { Container, Row, Col, Modal, Spinner } from 'react-bootstrap'
import styled from 'styled-components'
import { fetchGallery, fetchEnvelope, imageObjectUrl, KIND_IMAGE } from '@/chain/bulletin'
import { AccountIdentity } from '@/components/AccountIdentity'
import { Identicon } from '@/pages/explore/components/Identicon'

type GalleryImage = { address: string; url: string }

/**
 * Proof-of-Ink gallery, read straight from the Bulletin chain.
 *
 * The backend enumerates every stored blob and derives its CID; the browser fetches each
 * envelope, keeps the images (kind 1) and drops the verification videos (kind 2), and
 * shows the most recent image per owner. Nothing here is indexed off-chain — every entry
 * is a blob that is actually stored, and its owner is read out of the bytes.
 */
const GalleryPage = (): JSX.Element => {
  const [images, setImages] = useState<GalleryImage[] | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    const urls: string[] = []

    ;(async () => {
      try {
        const items = await fetchGallery()
        const byAddress = new Map<string, string>()

        // Later chain entries overwrite earlier ones, so each member shows their newest image.
        for (const { cid } of items) {
          try {
            const envelope = await fetchEnvelope(cid)
            if (envelope.kind !== KIND_IMAGE) continue
            const url = imageObjectUrl(envelope.media)
            urls.push(url)
            byAddress.set(envelope.address, url)
          } catch {
            // A single unreachable blob should not blank the whole gallery.
          }
        }

        if (!cancelled) {
          setImages(Array.from(byAddress, ([address, url]) => ({ address, url })))
        }
      } catch (caught) {
        if (!cancelled) setError(caught as Error)
      }
    })()

    return () => {
      cancelled = true
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  if (error)
    return (
      <Container>
        <p className="text-center mt-4">Could not load the gallery: {error.message}</p>
      </Container>
    )

  if (!images) return <Spinner className="mx-auto d-block" animation="border" role="status" variant="primary" />

  if (images.length === 0)
    return (
      <Container>
        <p className="text-center mt-4">No Proof-of-Ink submitted yet.</p>
      </Container>
    )

  return (
    <Container>
      <Row>
        {images.map(({ address, url }) => (
          <ProofOfInkImage key={address} member={address} image={url} />
        ))}
      </Row>
    </Container>
  )
}

const ProofOfInkImage = ({ member, image }: { member: string; image: string }): JSX.Element => {
  const [modalShow, setModalShow] = useState(false)

  return (
    <>
      <Col xs={12} sm={6} md={6} lg={3} className="mb-3">
        <Border>
          <ImageContainer onClick={() => setModalShow(true)} $clickable>
            <Row>
              <Col xs={12} className="p-0">
                <StyledImage src={image} />
              </Col>
            </Row>
          </ImageContainer>
          <MemberInformation>
            <Row className="d-flex align-items-center">
              <Col xs={2} className="text-center">
                <Identicon value={member} size={32} theme="polkadot" />
              </Col>
              <Col xs={9} md={9} lg={10} className="text-center text-truncate">
                <AccountIdentity accountId={member} />
              </Col>
            </Row>
          </MemberInformation>
        </Border>
      </Col>
      <StyledModalContent size="lg" show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Body style={{ display: 'flex', justifyContent: 'center' }}>
          <StyledModalImage src={image} />
        </Modal.Body>
      </StyledModalContent>
    </>
  )
}

const StyledModalContent = styled(Modal)`
  .modal-content {
    background-color: ${(props) => props.theme.colors.lightGrey};
  }
`
const Border = styled.div`
  border: 3px solid ${(props) => props.theme.colors.lightGrey};
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`
const MemberInformation = styled.div`
  padding: 13px 10px 10px;
  background-color: ${(props) => props.theme.colors.lightGrey};
`
const ImageContainer = styled.div<{ $clickable: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 280px;
  width: 100%;
  overflow: hidden;
  cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};
  position: relative;
`
const StyledImage = styled.img`
  max-width: 100%;
  max-height: 100%;
`
const StyledModalImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
`
export { GalleryPage }
