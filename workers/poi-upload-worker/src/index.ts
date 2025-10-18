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

    // Only allow POST requests
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405)
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
