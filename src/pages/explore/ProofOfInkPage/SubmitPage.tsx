import { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import toast from 'react-hot-toast'
import styled from 'styled-components'
import { useAccount } from '../../../account/AccountContext'
import { apillonClient } from '../../../services/apillonClient'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB in bytes

const SubmitPage = (): JSX.Element => {
  const { activeAccount } = useAccount()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

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

      // Step 2: Determine upload path based on existing files
      let directoryPath: 'pending' | 'approved'
      let successMessage: string

      if (existingApproved) {
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
        const confirmed = window.confirm(
          'You already have a pending submission. Replace it with this new image?'
        )
        if (!confirmed) {
          setUploading(false)
          setSelectedFile(null)
          const fileInput = document.getElementById('file-input') as HTMLInputElement
          if (fileInput) fileInput.value = ''
          return
        }
        directoryPath = 'pending'
        successMessage = 'Pending submission updated!'
      } else {
        directoryPath = 'pending'
        successMessage = 'Submitted for approval! Check back soon.'
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

  const isFormDisabled = !activeAccount || uploading

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
