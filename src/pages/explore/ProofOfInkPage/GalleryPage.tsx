import { ApiPromise } from '@polkadot/api'
import Identicon from '@polkadot/react-identicon'
import { StorageKey } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { Container, Row, Col, Modal, Spinner } from 'react-bootstrap'
import styled from 'styled-components'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { hashToPoI } from '../../../helpers/hashToPoI'

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
  if (!hashToPoI[member]) return <></>

  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const [modalShow, setModalShow] = useState(false)

  const handleImageClick = (image: string) => {
    setSelectedImage(image)
    setModalShow(true)
  }

  useEffect(() => {
    setLoading(true)
  }, [member])

  return (
    <>
      <Col xs={6} md={4} lg={3} className="mb-3">
        <ImageContainer onClick={() => handleImageClick(hashToPoI[member])}>
          {loading && <Spinner className="mb-2" animation="border" role="status" variant="secondary"></Spinner>}
          <Row>
            <Col xs={12} className="p-0">
              <StyledImage
                src={hashToPoI[member]}
                onLoad={() => setLoading(false)}
                style={loading ? { display: 'none' } : {}}
              />
            </Col>
            <MemberInformation>
              <Row className="d-flex align-items-center">
                <Col xs={1} className="text-center">
                  <Identicon value={member} size={32} theme={'polkadot'} />
                </Col>
                <Col xs={11} className="text-center text-truncate">
                  <AccountIdentity api={api} accountId={api.registry.createType('AccountId', member)} />
                </Col>
              </Row>
            </MemberInformation>
          </Row>
        </ImageContainer>
      </Col>

      <Modal
        size="lg"
        show={modalShow}
        onHide={() => setModalShow(false)}
        centered
        style={{
          width: 'auto',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Modal.Body style={{ display: 'flex', justifyContent: 'center' }}>
          {selectedImage && <StyledModalImage src={selectedImage} />}
        </Modal.Body>
      </Modal>
    </>
  )
}

const MemberInformation = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 13px 10px 10px 10px;
  background-color: ${(props) => props.theme.colors.lightGrey};
`

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
  overflow: hidden;
  padding: 5px;
  cursor: pointer;
  position: relative;
  border: ${(props) => '3px solid ' + props.theme.colors.lightGrey};
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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
