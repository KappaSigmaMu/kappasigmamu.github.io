import { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAccount } from '@/account/AccountContext'
import { packEnvelope, contentHash, combinedHash, submitProofOfInk, KIND_IMAGE, KIND_VIDEO } from '@/chain/bulletin'

// The image is stored on the Bulletin chain, hard-capped at 2 MiB per blob. The video
// goes to a Matrix room instead (too big for the chain, and not gallery content), so it
// gets a far larger cap. Both mirror the backend's per-kind limits.
const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2 MiB — Bulletin per-blob ceiling
const MAX_VIDEO_SIZE = 25 * 1024 * 1024 // 25 MiB — matches backend MAX_VIDEO_BYTES

const toBase64 = (data: Uint8Array): string => {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < data.length; i += chunk) {
    binary += String.fromCharCode(...data.subarray(i, i + chunk))
  }
  return btoa(binary)
}

const SubmitPage = (): JSX.Element => {
  const { activeAccount, polkadotSigner, level, isLevelLoading, isSignerLoading } = useAccount()
  const navigate = useNavigate()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const eligible = level === 'candidate' || level === 'cyborg'

  const pickFile =
    (set: (file: File | null) => void, accept: (file: File) => boolean, reject: string, maxSize: number, tooBig: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      if (!accept(file)) {
        toast.error(reject)
        return
      }
      if (file.size > maxSize) {
        toast.error(tooBig)
        return
      }
      set(file)
    }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!imageFile || !videoFile || !activeAccount || !polkadotSigner) return

    if (!eligible) {
      toast.error('Only Society candidates and members can submit proof-of-ink')
      return
    }

    setUploading(true)

    // Read + hash both media, then sign ONCE over the two hashes combined.
    const imageBytes = new Uint8Array(await imageFile.arrayBuffer())
    const videoBytes = new Uint8Array(await videoFile.arrayBuffer())

    const imageHash = contentHash(packEnvelope(activeAccount.address, imageBytes, KIND_IMAGE))
    const videoHash = contentHash(packEnvelope(activeAccount.address, videoBytes, KIND_VIDEO))
    const toSign = combinedHash(imageHash, videoHash)
    const toSignBytes = Uint8Array.from((toSign.slice(2).match(/../g) as string[]).map((b) => parseInt(b, 16)))

    let signature: string
    try {
      const sigBytes = await polkadotSigner.signBytes(toSignBytes)
      signature = '0x' + Array.from(sigBytes, (b) => b.toString(16).padStart(2, '0')).join('')
    } catch {
      setUploading(false)
      toast.error('Signature cancelled')
      return
    }

    // The on-chain store takes ~30-60s. The moment the member has signed we raise a
    // persistent loading toast and navigate to the gallery — the toast lives on the
    // app-root <Toaster>, so it survives this SPA navigation and the still-pending
    // request below resolves it to success or failure wherever the member now is.
    const toastId = 'poi-submit'
    toast.loading('Submitting — storing your tattoo on chain, this can take a minute…', { id: toastId })

    submitProofOfInk({
      address: activeAccount.address,
      image: toBase64(imageBytes),
      video: toBase64(videoBytes),
      imageHash,
      videoHash,
      videoMimetype: videoFile.type,
      signature
    })
      .then(() => {
        toast.success('Submitted — image in the gallery, video sent for verification', { id: toastId })
      })
      .catch((error: Error) => {
        toast.error(`Upload failed: ${error.message}`, { id: toastId })
      })

    navigate('/explore/poi/gallery')
  }

  const isFormDisabled =
    !activeAccount || uploading || isLevelLoading || isSignerLoading || !eligible || !polkadotSigner

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <StyledCard>
            <h2 className="mb-4">Submit Proof-of-Ink</h2>

            {!activeAccount && (
              <Alert variant="warning">
                <strong>Wallet Not Connected</strong>
                <br />
                Please connect your wallet to submit your tattoo.
              </Alert>
            )}

            {activeAccount && isLevelLoading && <Alert variant="secondary">Checking your Society status…</Alert>}

            {activeAccount && !isLevelLoading && !eligible && (
              <Alert variant="danger">
                <strong>Not Eligible</strong>
                <br />
                Only Society candidates and members can submit proof-of-ink. Please apply to join the Society first.
              </Alert>
            )}

            {activeAccount && !isLevelLoading && level === 'candidate' && (
              <Alert variant="info">
                <strong>Candidate</strong>
                <br />
                Your submission will be reviewed when you become a member.
              </Alert>
            )}

            {activeAccount && !isLevelLoading && level === 'cyborg' && (
              <Alert variant="success">
                <strong>Member</strong>
                <br />
                Your tattoo will appear in the gallery after upload.
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Tattoo image (shown in the gallery)</Form.Label>
                <Form.Control
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={pickFile(
                    setImageFile,
                    (file) => file.type.startsWith('image/'),
                    'Please select an image',
                    MAX_IMAGE_SIZE,
                    'Image must be 2 MB or smaller'
                  )}
                  disabled={isFormDisabled}
                />
                <Form.Text className="text-muted">JPEG, PNG, GIF or WebP, up to 2 MB.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Verification video (proof, not shown in the gallery)</Form.Label>
                <Form.Control
                  id="video-input"
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={pickFile(
                    setVideoFile,
                    (file) => file.type === 'video/mp4' || file.type === 'video/webm',
                    'Please select an MP4 or WebM video',
                    MAX_VIDEO_SIZE,
                    'Video must be 25 MB or smaller'
                  )}
                  disabled={isFormDisabled}
                />
                <Form.Text className="text-muted">MP4 or WebM, up to 25 MB.</Form.Text>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={isFormDisabled || !imageFile || !videoFile}
                className="w-100"
              >
                {uploading ? 'Uploading…' : 'Submit'}
              </Button>
            </Form>
          </StyledCard>
        </Col>
      </Row>
    </Container>
  )
}

const StyledCard = styled.div`
  background-color: ${(props) => props.theme.colors.lightGrey};
  border-radius: 10px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`

export { SubmitPage }
