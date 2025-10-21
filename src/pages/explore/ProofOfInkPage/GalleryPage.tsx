import { ApiPromise } from '@polkadot/api'
import { StorageKey } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { Container, Row, Col, Modal, Spinner } from 'react-bootstrap'
import toast from 'react-hot-toast'
import styled from 'styled-components'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { getLatestPinnedHash, fastestGateway, imageUrl } from '../../../helpers/ipfs'
import { apillonClient } from '../../../services/apillonClient'
import { Identicon } from '../components/Identicon'

type ExamplesPageProps = {
  api: ApiPromise | null
}

const WORKER_URL = process.env.REACT_APP_CLOUDFLARE_WORKER_URL

const GalleryPage = ({ api }: ExamplesPageProps): JSX.Element => {
  const [members, setMembers] = useState<Array<string>>([])
  const [folderHash, setFolderHash] = useState('')
  const [gateway, setGateway] = useState('')
  const [syncAttempted, setSyncAttempted] = useState(false)

  const society = api?.query?.society

  useEffect(() => {
    let founderHash: string
    society?.founder().then((hash) => (founderHash = hash.toString()))

    society?.members.keys().then((members: StorageKey<[AccountId32]>[]) => {
      const hashes = members.map((account) => account.toHuman()!.toString()).filter((hash) => hash !== founderHash)
      hashes.sort((a, b) => a.toString().localeCompare(b.toString()))
      setMembers(hashes)
    })
  }, [society])

  useEffect(() => {
    const fetchPinnedHash = async () => {
      const folderHash = await getLatestPinnedHash()
      setFolderHash(folderHash)
      const gateway = await fastestGateway(folderHash)
      setGateway(gateway)
    }

    fetchPinnedHash()
  }, [])

  // Auto-sync: Move pending tattoos to approved for members
  useEffect(() => {
    if (members.length === 0 || syncAttempted) return

    const syncApprovedMembers = async () => {
      try {
        // Fetch pending files from Apillon
        const listData = await apillonClient.listFiles()
        const allFiles = listData.data?.items || []

        // Extract addresses from pending files
        const pendingAddresses = allFiles
          .filter((file: any) => file.path === 'pending/' || file.path?.startsWith('pending/'))
          .map((file: any) => file.name.replace(/\.(jpg|png|heic|webp)$/i, ''))
          .filter((addr: string) => addr && addr.length > 0)

        // Cross-reference: find members with pending files
        const toSync = members.filter((member) => pendingAddresses.includes(member))

        if (toSync.length > 0) {
          // Limit to 50 addresses per request (backend limit)
          const addresses = toSync.slice(0, 50)

          // Call worker to move files
          const response = await fetch(`${WORKER_URL}/sync-approved-members`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Origin: window.location.origin
            },
            body: JSON.stringify({ addresses })
          })

          const result = await response.json()

          if (result.success && result.moved && result.moved.length > 0) {
            // Notify user and reload page to show new tattoos
            toast.success(
              `${result.moved.length} new tattoo${result.moved.length > 1 ? 's' : ''} approved! Reloading gallery...`
            )
            setTimeout(() => {
              window.location.reload()
            }, 2000)
          }
        }
      } catch (error) {
        // Silent fail - will retry on next page load
      } finally {
        setSyncAttempted(true)
      }
    }

    syncApprovedMembers()
  }, [members, syncAttempted])

  return !folderHash && !gateway ? (
    <Spinner className="mx-auto d-block" animation="border" role="status" variant="primary" />
  ) : (
    <Container>
      <Row>
        {members.map((member) => (
          <ProofOfInkImage key={member} gateway={gateway} folderHash={folderHash} member={member} api={api!} />
        ))}
      </Row>
    </Container>
  )
}

const ProofOfInkImage = ({
  gateway,
  folderHash,
  member,
  api
}: {
  gateway: string
  folderHash: string
  member: string
  api: ApiPromise
}): JSX.Element => {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const [modalShow, setModalShow] = useState(false)
  const loadingTimeout = 10000

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !error) {
        setError(true)
        setLoading(false)
      }
    }, loadingTimeout)

    return () => clearTimeout(timer)
  }, [loading, error])

  const handleImageClick = (image: string) => {
    if (loading || error) return
    setSelectedImage(image)
    setModalShow(true)
  }

  return (
    <>
      <Col xs={12} sm={6} md={6} lg={3} className="mb-3">
        <Border>
          <ImageContainer
            onClick={() => handleImageClick(imageUrl({ gateway, folderHash, member }))}
            $clickable={!error && !loading}
          >
            <Row>
              <Col xs={12} className="p-0">
                {loading && !error && (
                  <Spinner className="m-0 mt-3" animation="border" role="status" variant="secondary" />
                )}
                {!loading && error && <p className="m-0 mt-3">Missing Proof-of-Ink</p>}
                <StyledImage
                  src={imageUrl({ gateway, folderHash, member })}
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
  $clickable: boolean
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
