import { getPoiBackendUrl } from '@/helpers/bulletinProviders'

/**
 * Proof-of-Ink upload against Bulletin Chain.
 *
 * The browser hashes the bytes and signs the content hash, then hands the image to the
 * backend. The backend verifies the uploader, asserts the bytes hash to the signed
 * content hash, and signs `store` itself against the ops account's authorization — the
 * only path that works on Paseo. So the ops key can refuse an upload, but it cannot
 * substitute different content for one it has approved.
 */

const backendError = async (response: Response): Promise<never> => {
  const body = (await response.json().catch(() => ({}))) as { error?: string }
  throw new Error(body.error || `Backend returned ${response.status}`)
}

/**
 * Ask the backend to store one media blob of a given kind.
 *
 * The signature proves the uploader holds the key for `address`, and covers the content
 * hash specifically, so it cannot be replayed to store different bytes. The backend
 * additionally checks Society membership — candidates count, since submitting a tattoo
 * is part of candidacy — reconstructs the envelope from `image` and asserts it hashes to
 * `contentHash`, then signs `store` and enables auto-renew. It returns the stored CID.
 */
export async function requestAuthorization(payload: {
  address: string
  contentHash: string
  size: number
  signature: string
  image: string
  kind: number
  mimetype?: string
}): Promise<AuthorizationResult> {
  const response = await fetch(`${getPoiBackendUrl()}/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) await backendError(response)
  return (await response.json()) as AuthorizationResult
}

/**
 * Submit a full Proof-of-Ink — image + video — in one signed request.
 *
 * The image is stored on chain (gallery), the video is posted to Matrix (verification).
 * The single signature covers both content hashes, so the backend can bind the member to
 * the exact image and video together.
 */
export async function submitProofOfInk(payload: {
  address: string
  image: string
  video: string
  imageHash: string
  videoHash: string
  videoMimetype: string
  signature: string
}): Promise<{ status: 'member' | 'candidate'; cid?: string; mxc?: string; eventId?: string }> {
  const response = await fetch(`${getPoiBackendUrl()}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) await backendError(response)
  return (await response.json()) as { status: 'member' | 'candidate'; cid?: string; mxc?: string; eventId?: string }
}

// An image is stored on chain and comes back with a `cid`; a video is posted to Matrix and
// comes back with an `mxc` reference and room `eventId`. The caller reads whichever applies.
type AuthorizationResult = {
  status: 'member' | 'candidate'
  cid?: string
  mxc?: string
  eventId?: string
}

/**
 * List every stored Proof-of-Ink blob from the backend.
 *
 * The backend enumerates the chain and derives each blob's CID; the browser then fetches
 * and decodes the envelopes itself to read owner and kind. Returns content hash + CID per
 * stored blob, images and videos alike — the caller filters by kind.
 */
export async function fetchGallery(): Promise<Array<{ contentHash: string; cid: string }>> {
  const response = await fetch(`${getPoiBackendUrl()}/gallery`)
  if (!response.ok) await backendError(response)
  const body = (await response.json()) as { items: Array<{ contentHash: string; cid: string }> }
  return body.items
}
