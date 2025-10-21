/**
 * Cloudflare Worker for Proof-of-Ink Image Uploads
 *
 * This worker acts as a secure proxy between the frontend and Apillon Storage API.
 * It protects write-enabled API credentials while allowing the frontend to upload images.
 *
 * Environment Variables Required:
 * - APILLON_API_KEY: Write-enabled Apillon API key
 * - APILLON_API_SECRET: Apillon API secret
 * - APILLON_BUCKET_UUID: Target bucket UUID
 * - ALLOWED_ORIGINS: Comma-separated list of allowed CORS origins
 */

export interface Env {
  APILLON_API_KEY: string
  APILLON_API_SECRET: string
  APILLON_BUCKET_UUID: string
  ALLOWED_ORIGINS: string
}

interface InitiateUploadRequest {
  fileName: string
  contentType: string
  directoryPath: 'pending' | 'approved'
}

interface CompleteUploadRequest {
  sessionUuid: string
}

interface ApillonUploadResponse {
  data: {
    sessionUuid: string
    files: Array<{
      url: string
      fileUuid: string
    }>
  }
}

interface ApillonCompleteResponse {
  data: {
    success: boolean
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request, env)
    }

    // Validate Origin
    const origin = request.headers.get('Origin')
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    if (!origin || !allowedOrigins.includes(origin)) {
      return jsonResponse({ error: 'Unauthorized origin' }, 403)
    }

    try {
      // Route based on path
      if (path === '/initiate') {
        return handleInitiateUpload(request, env, origin)
      } else if (path === '/complete') {
        return handleCompleteUpload(request, env, origin)
      } else if (path === '/sync-approved-members') {
        return handleSyncApprovedMembers(request, env, origin)
      } else {
        return jsonResponse({ error: 'Invalid endpoint' }, 404, origin)
      }

    } catch (error) {
      return jsonResponse({
        error: 'Internal server error',
        details: (error as Error).message
      }, 500, origin)
    }
  }
}

/**
 * Handle initiate upload request - returns signed S3 URL to frontend
 */
async function handleInitiateUpload(
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  const body = await request.json() as InitiateUploadRequest

  if (!body.fileName || !body.contentType || !body.directoryPath) {
    return jsonResponse({ error: 'Missing required fields' }, 400, origin)
  }

  // Validate directoryPath
  if (body.directoryPath !== 'pending' && body.directoryPath !== 'approved') {
    return jsonResponse({ error: 'Invalid directoryPath' }, 400, origin)
  }

  // Initiate upload session with Apillon
  const initiateResponse = await apillonInitiateUpload(
    env,
    body.fileName,
    body.contentType,
    body.directoryPath
  )

  if (!initiateResponse.data?.sessionUuid || !initiateResponse.data?.files?.[0]?.url) {
    return jsonResponse({ error: 'Failed to initiate upload session' }, 500, origin)
  }

  const { sessionUuid, files } = initiateResponse.data
  const uploadUrl = files[0].url
  const fileUuid = files[0].fileUuid

  // Return signed URL to frontend
  return jsonResponse({
    success: true,
    sessionUuid,
    uploadUrl,
    fileUuid
  }, 200, origin)
}

/**
 * Handle complete upload request - marks session as complete in Apillon
 */
async function handleCompleteUpload(
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  const body = await request.json() as CompleteUploadRequest

  if (!body.sessionUuid) {
    return jsonResponse({ error: 'Missing sessionUuid' }, 400, origin)
  }

  // Complete upload session with Apillon
  const completeResponse = await apillonCompleteUpload(env, body.sessionUuid)

  if (!completeResponse.data?.success) {
    return jsonResponse({ error: 'Failed to complete upload session' }, 500, origin)
  }

  return jsonResponse({
    success: true,
    message: 'Upload completed successfully'
  }, 200, origin)
}

/**
 * Initiate upload session with Apillon
 */
async function apillonInitiateUpload(
  env: Env,
  fileName: string,
  contentType: string,
  directoryPath: string
): Promise<ApillonUploadResponse> {
  const url = `https://api.apillon.io/storage/buckets/${env.APILLON_BUCKET_UUID}/upload`
  const auth = btoa(`${env.APILLON_API_KEY}:${env.APILLON_API_SECRET}`)

  const requestBody = {
    files: [{
      fileName: fileName,
      contentType: contentType,
      path: directoryPath
    }],
    directoryPath: directoryPath
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Apillon initiate upload failed: ${errorText}`)
  }

  return await response.json()
}

/**
 * Complete upload session with Apillon
 */
async function apillonCompleteUpload(
  env: Env,
  sessionUuid: string
): Promise<ApillonCompleteResponse> {
  const url = `https://api.apillon.io/storage/buckets/${env.APILLON_BUCKET_UUID}/upload/${sessionUuid}/end`

  const auth = btoa(`${env.APILLON_API_KEY}:${env.APILLON_API_SECRET}`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Apillon complete upload failed: ${errorText}`)
  }

  return await response.json()
}

/**
 * Handle sync approved members request - moves images from pending to approved
 */
async function handleSyncApprovedMembers(
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, origin)
  }

  try {
    const body = await request.json() as { addresses?: string[] }
    const addresses: string[] = body.addresses || []

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return jsonResponse({ error: 'Invalid addresses array' }, 400, origin)
    }

    // Limit to 50 addresses per request
    const limitedAddresses = addresses.slice(0, 50)

    // First, list all files in pending folder to find which addresses have images
    const pendingFiles = await listFilesInFolder(env, 'pending')

    // Extract address from each filename (format: {address}.{ext})
    const pendingMap = new Map<string, {
      fileName: string
      fileUuid: string
      extension: string
      link?: string
    }>()
    for (const file of pendingFiles) {
      const match = file.name.match(/^(.+)\.([^.]+)$/)
      if (match) {
        const [, address, extension] = match
        pendingMap.set(address, {
          fileName: file.name,
          fileUuid: file.uuid,
          extension,
          link: file.link
        })
      }
    }

    const results: {
      moved: Array<{ address: string; from: string; to: string }>
      skipped: Array<{ address: string; reason: string }>
      errors: Array<{ address: string; error: string }>
    } = {
      moved: [],
      skipped: [],
      errors: []
    }

    for (const address of limitedAddresses) {
      try {
        const fileInfo = pendingMap.get(address)

        if (!fileInfo) {
          results.skipped.push({
            address,
            reason: 'No pending image found'
          })
          continue
        }

        // Move file from pending to approved
        await moveFile(
          env,
          `pending/${fileInfo.fileName}`,
          `approved/${fileInfo.fileName}`,
          fileInfo.fileUuid,
          fileInfo.link
        )

        results.moved.push({
          address,
          from: `pending/${fileInfo.fileName}`,
          to: `approved/${fileInfo.fileName}`
        })
      } catch (error) {
        results.errors.push({
          address,
          error: (error as Error).message
        })
      }
    }

    return jsonResponse(
      {
        success: true,
        ...results
      },
      200,
      origin
    )
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: 'Sync failed',
        details: (error as Error).message
      },
      500,
      origin
    )
  }
}

/**
 * List files in a specific folder (pending or approved)
 */
async function listFilesInFolder(
  env: Env,
  folder: string
): Promise<Array<{ name: string; uuid: string; link?: string; cid?: string }>> {
  const url = `https://api.apillon.io/storage/buckets/${env.APILLON_BUCKET_UUID}/files`
  const auth = btoa(`${env.APILLON_API_KEY}:${env.APILLON_API_SECRET}`)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to list files: ${errorText}`)
  }

  const data = await response.json() as { data: { items: Array<{
    name: string
    fileUuid: string
    path?: string
    link?: string
    CID?: string
    CIDv1?: string
  }> } }

  // Filter files by folder path (Apillon uses "pending/", "approved/" format)
  return data.data.items
    .filter(file => {
      const filePath = file.path || ''
      // Match "pending/" or "approved/"
      return filePath === `${folder}/`
    })
    .map(file => ({
      name: file.name,
      uuid: file.fileUuid,
      link: file.link,
      cid: file.CIDv1 || file.CID
    }))
}

/**
 * Move file from one location to another
 * Note: Apillon doesn't have a native move operation, so we:
 * 1. Download the file from its current IPFS location (using authenticated link)
 * 2. Upload to new location (approved folder)
 * 3. Delete from old location (pending folder)
 */
async function moveFile(
  env: Env,
  _fromPath: string,
  toPath: string,
  fileUuid: string,
  fileLink?: string
): Promise<void> {
  // Step 1: Download the file content using the authenticated link from Apillon
  if (!fileLink) {
    throw new Error('File link is required to download file')
  }

  const fileResponse = await fetch(fileLink)
  if (!fileResponse.ok) {
    throw new Error(`Failed to download file: ${fileResponse.statusText}`)
  }
  const fileBlob = await fileResponse.blob()

  // Step 2: Extract filename and content type
  const fileName = toPath.split('/').pop() || 'unknown'
  const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream'

  // Step 3: Upload to new location
  const targetFolder = toPath.split('/')[0]
  const uploadSession = await apillonInitiateUpload(env, fileName, contentType, targetFolder)

  if (!uploadSession.data?.sessionUuid || !uploadSession.data?.files?.[0]?.url) {
    throw new Error('Failed to initiate upload to new location')
  }

  const uploadUrl = uploadSession.data.files[0].url

  // Step 4: Upload the file to the signed URL
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: fileBlob,
    headers: {
      'Content-Type': contentType
    }
  })

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file: ${uploadResponse.statusText}`)
  }

  // Step 5: Complete the upload session
  await apillonCompleteUpload(env, uploadSession.data.sessionUuid)

  // Step 6: Delete from old location (pending folder)
  await deleteApillonFile(env, fileUuid)
}

/**
 * Delete a file from Apillon storage
 */
async function deleteApillonFile(env: Env, fileUuid: string): Promise<void> {
  const url = `https://api.apillon.io/storage/buckets/${env.APILLON_BUCKET_UUID}/files/${fileUuid}`
  const auth = btoa(`${env.APILLON_API_KEY}:${env.APILLON_API_SECRET}`)

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to delete file: ${errorText}`)
  }
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin')
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []

  if (!origin || !allowedOrigins.includes(origin)) {
    return new Response(null, { status: 403 })
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}

/**
 * Helper to create JSON responses with CORS headers
 */
function jsonResponse(data: any, status: number, origin?: string): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return new Response(JSON.stringify(data), {
    status,
    headers
  })
}
