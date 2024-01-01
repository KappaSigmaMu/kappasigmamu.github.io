import { ApiPromise } from '@polkadot/api'
import Identicon from '@polkadot/react-identicon'
import { StorageKey } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { Container, Row, Col, Modal, Spinner } from 'react-bootstrap'
import styled from 'styled-components'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { imageUrl } from '../../../helpers/imageUrl'

type ExamplesPageProps = {
  api: ApiPromise | null
}

const GalleryPage = ({ api }: ExamplesPageProps): JSX.Element => {
  const [members, setMembers] = useState<Array<string>>([])

  const society = api?.query?.society

  useEffect(() => {
    society?.members.keys().then((members: StorageKey<[AccountId32]>[]) => {
      const ids = members.map((account) => account.toHuman()!.toString())
      ids.sort((a, b) => a.toString().localeCompare(b.toString()))
      setMembers(ids)
    })
  }, [society])

  return (
    <Container>
      <Row>
        {members.map((member) => (
          <ProofOfInkImage key={member} member={member} api={api!} />
        ))}
      </Row>
    </Container>
  )
}

const ProofOfInkImage = ({ member, api }: { member: string; api: ApiPromise }): JSX.Element => {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const [modalShow, setModalShow] = useState(false)

  const handleImageClick = (image: string) => {
    if (loading || error) return
    setSelectedImage(image)
    setModalShow(true)
  }

  return (
    <>
      <Col xs={12} sm={6} md={6} lg={3} className="mb-3">
        <Border>
          <ImageContainer onClick={() => handleImageClick(imageUrl(member))} clickable={!error && !loading}>
            <Row>
              <Col xs={12} className="p-0">
                {loading && !error && (
                  <Spinner className="m-0 mt-3" animation="border" role="status" variant="secondary"></Spinner>
                )}
                {error && <p className="m-0 mt-3">Missing Proof-of-Ink</p>}
                <StyledImage
                  src={imageUrl(member)}
                  onError={() => setError(true)}
                  onLoad={() => setLoading(false)}
                  style={loading ? { display: 'none' } : {}}
                />
              </Col>
            </Row>
          </ImageContainer>
          <MemberInformation>
            <Row className="d-flex align-items-center">
              <Col xs={2} className="text-center">
                <Identicon value={member} size={32} theme={'polkadot'} />
              </Col>
              <Col xs={9} md={9} lg={10} className="text-center text-truncate">
                <AccountIdentity api={api} accountId={api.registry.createType('AccountId', member)} />
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

interface ImageContainerProps {
  clickable: boolean
}

const Border = styled.div`
  border: ${(props) => '3px solid ' + props.theme.colors.lightGrey};
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`

const MemberInformation = styled.div`
  padding: 13px 10px 10px 10px;
  background-color: ${(props) => props.theme.colors.lightGrey};
`

const ImageContainer = styled.div<ImageContainerProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 280px;
  width: 100%;
  overflow: hidden;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
  position: relative;
`

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
`

const StyledModalImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
`

export { GalleryPage }
