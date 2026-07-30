import { useEffect, useState } from 'react'
import { Container, Row, Col, Modal, Spinner } from 'react-bootstrap'
import styled from 'styled-components'
import { useSociety } from '@/chain/society/SocietyContext'
import { AccountIdentity } from '@/components/AccountIdentity'
import { getLatestPinnedHash, fastestGateway, imageUrl } from '@/helpers/ipfs'
import { ChainError } from '@/pages/explore/components/ChainError'
import { Identicon } from '@/pages/explore/components/Identicon'

const GalleryPage = (): JSX.Element => {
  const { memberEntries, info } = useSociety()
  const members = memberEntries.data
    ?.map(({ accountId }) => accountId)
    .filter((accountId) => accountId !== info.data?.founder)
  const [folderHash, setFolderHash] = useState('')
  const [gateway, setGateway] = useState('')
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const nextFolderHash = await getLatestPinnedHash()
        const nextGateway = await fastestGateway(nextFolderHash)
        if (!cancelled) {
          setFolderHash(nextFolderHash)
          setGateway(nextGateway)
        }
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [])
  const error = memberEntries.error ?? info.error
  if (error)
    return (
      <ChainError
        error={error}
        onRetry={() => {
          memberEntries.refetch()
          info.refetch()
        }}
      />
    )
  if (!folderHash || !gateway || !members || !info.data)
    return <Spinner className="mx-auto d-block" animation="border" role="status" variant="primary" />
  return (
    <Container>
      <Row>
        {members.map((member) => (
          <ProofOfInkImage key={member} gateway={gateway} folderHash={folderHash} member={member} />
        ))}
      </Row>
    </Container>
  )
}

const ProofOfInkImage = ({
  gateway,
  folderHash,
  member
}: {
  gateway: string
  folderHash: string
  member: string
}): JSX.Element => {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const [modalShow, setModalShow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !error) {
        setError(true)
        setLoading(false)
      }
    }, 10_000)
    return () => clearTimeout(timer)
  }, [loading, error])
  const image = imageUrl({ gateway, folderHash, member })
  return (
    <>
      <Col xs={12} sm={6} md={6} lg={3} className="mb-3">
        <Border>
          <ImageContainer
            onClick={() => {
              if (!loading && !error) {
                setSelectedImage(image)
                setModalShow(true)
              }
            }}
            $clickable={!error && !loading}
          >
            <Row>
              <Col xs={12} className="p-0">
                {loading && !error && (
                  <Spinner className="m-0 mt-3" animation="border" role="status" variant="secondary" />
                )}
                {!loading && error && <p className="m-0 mt-3">Missing Proof-of-Ink</p>}
                <StyledImage
                  src={image}
                  onLoad={() => {
                    setError(false)
                    setLoading(false)
                  }}
                  style={loading || error ? { display: 'none' } : {}}
                />
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
          {selectedImage && <StyledModalImage src={selectedImage} />}
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
