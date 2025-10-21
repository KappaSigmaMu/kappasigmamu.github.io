import { ApiPromise } from '@polkadot/api'
import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import toast from 'react-hot-toast'
import styled from 'styled-components'
import { useAccount } from '../../../account/AccountContext'
import { apillonClient } from '../../../services/apillonClient'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB in bytes

type SubmitPageProps = {
  api: ApiPromise | null
}

const SubmitPage = ({ api }: SubmitPageProps): JSX.Element => {
  const { activeAccount } = useAccount()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isCandidate, setIsCandidate] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  // Check if user is a candidate or member
  useEffect(() => {
    const checkMembershipStatus = async () => {
      if (!api || !activeAccount) {
        setCheckingStatus(false)
        return
      }

      try {
        setCheckingStatus(true)

        // Check if user is a member
        const memberEntry = await api.query.society.members(activeAccount.address)
        const isMemberResult = memberEntry.isSome
        setIsMember(isMemberResult)

        // Check if user is a candidate
        const candidatesEntries = await api.query.society.candidates.entries()
        const candidateAddresses = candidatesEntries.map(([key]) => key.args[0].toString())
        const isCandidateResult = candidateAddresses.includes(activeAccount.address)
        setIsCandidate(isCandidateResult)
      } catch (error) {
        // Silent fail - user will see "not eligible" message
      } finally {
        setCheckingStatus(false)
      }
    }

    checkMembershipStatus()
  }, [api, activeAccount])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (JPG or PNG)')
        return
      }
      // Validate file size (2MB max)
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 2MB. Please compress your image before uploading.')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedFile || !activeAccount) {
      return
    }

    // Validate user is candidate or member
    if (!isCandidate && !isMember) {
      toast.error('Only Society candidates and members can submit proof-of-ink')
      return
    }

    setUploading(true)

    try {
      // Step 1: Check for existing tattoo using read-only Apillon API
      const memberHash = activeAccount.address
      const listData = await apillonClient.listFiles()
      const allFiles = listData.data?.items || []

      const fileName = `${memberHash}.jpg`

      // Check for existing tattoo in both pending and approved folders
      const existingApproved = allFiles.find(
        (file: any) => file.name === fileName && (file.path === 'approved/' || file.path?.startsWith('approved/'))
      )

      const existingPending = allFiles.find(
        (file: any) => file.name === fileName && (file.path === 'pending/' || file.path?.startsWith('pending/'))
      )

      // Step 2: Determine upload path based on membership status and existing files
      let directoryPath: 'pending' | 'approved'
      let successMessage: string

      if (existingApproved) {
        // Replace existing approved tattoo
        const confirmed = window.confirm('Replace your existing tattoo?')
        if (!confirmed) {
          setUploading(false)
          setSelectedFile(null)
          const fileInput = document.getElementById('file-input') as HTMLInputElement
          if (fileInput) fileInput.value = ''
          return
        }
        directoryPath = 'approved'
        successMessage = 'Tattoo updated!'
      } else if (existingPending) {
        // Replace existing pending submission
        const confirmed = window.confirm('You already have a pending submission. Replace it with this new image?')
        if (!confirmed) {
          setUploading(false)
          setSelectedFile(null)
          const fileInput = document.getElementById('file-input') as HTMLInputElement
          if (fileInput) fileInput.value = ''
          return
        }
        // Members upload directly to approved, candidates to pending
        directoryPath = isMember ? 'approved' : 'pending'
        successMessage = isMember ? 'Tattoo submitted to approved!' : 'Pending submission updated!'
      } else {
        // New submission: Members go to approved, candidates to pending
        if (isMember) {
          directoryPath = 'approved'
          successMessage = 'Tattoo submitted to approved folder!'
        } else {
          directoryPath = 'pending'
          successMessage = 'Submitted for approval! Your tattoo will be approved after you become a member.'
        }
      }

      // Step 3: Upload via Cloudflare Worker
      const result = await apillonClient.uploadFile(selectedFile, fileName, directoryPath)

      if (!result.success) {
        throw new Error(result.message || 'Upload failed')
      }

      // Step 4: Show success message
      toast.success(successMessage)

      // Step 5: Clear form
      setSelectedFile(null)
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      toast.error(`Upload failed: ${(error as Error).message}`)
    } finally {
      setUploading(false)
    }
  }

  const isFormDisabled = !activeAccount || uploading || checkingStatus || (!isCandidate && !isMember)

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

            {activeAccount && !checkingStatus && !isCandidate && !isMember && (
              <Alert variant="danger">
                <strong>Not Eligible</strong>
                <br />
                Only Society candidates and members can submit proof-of-ink. Please apply to join the Society first.
              </Alert>
            )}

            {activeAccount && !checkingStatus && isCandidate && !isMember && (
              <Alert variant="info">
                <strong>Candidate</strong>
                <br />
                Your submission will be reviewed when you become a member.
              </Alert>
            )}

            {activeAccount && !checkingStatus && isMember && (
              <Alert variant="success">
                <strong>Member</strong>
                <br />
                Your tattoo will appear in the gallery after upload.
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Select Tattoo Image</Form.Label>
                <Form.Control
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isFormDisabled}
                />
                <Form.Text className="text-muted">
                  Accepted formats: JPG, PNG. Maximum size: 2MB. Please compress your image if it exceeds this limit.
                </Form.Text>
              </Form.Group>

              <Button variant="primary" type="submit" disabled={isFormDisabled || !selectedFile} className="w-100">
                {uploading ? 'Uploading...' : 'Submit Tattoo'}
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
