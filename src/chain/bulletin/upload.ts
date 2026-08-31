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
 * Ask the backend to store one specific image.
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
}): Promise<{ status: 'member' | 'candidate'; cid: string }> {
  const response = await fetch(`${getPoiBackendUrl()}/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) await backendError(response)
  return (await response.json()) as { status: 'member' | 'candidate'; cid: string }
}
