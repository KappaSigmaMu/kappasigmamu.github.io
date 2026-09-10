import { unpackEnvelope } from './envelope'
import { getIpfsGateway } from '@/helpers/bulletinProviders'

/**
 * Reading Proof-of-Ink images back.
 *
 * The node speaks Bitswap over libp2p, not HTTP, so the browser cannot fetch a CID from
 * it directly — an IPFS gateway must be peered to the node and is what serves these URLs.
 */
export const imageUrlFromCid = (cid: string): string => `${getIpfsGateway()}/ipfs/${cid}`

/**
 * Fetch a stored blob and split it back into owner, kind, and media.
 *
 * The owner is read out of the blob rather than from any index, so a mismatch between
 * the address a gallery entry claims and the address inside the bytes is detectable
 * without trusting whoever published the index.
 */
export async function fetchEnvelope(cid: string): Promise<{ address: string; kind: number; media: Uint8Array }> {
  const response = await fetch(imageUrlFromCid(cid))
  if (!response.ok) throw new Error(`Gateway returned ${response.status}`)

  return unpackEnvelope(new Uint8Array(await response.arrayBuffer()))
}

const MIME_BY_MAGIC: Array<{ bytes: number[]; mime: string }> = [
  { bytes: [0xff, 0xd8, 0xff], mime: 'image/jpeg' },
  { bytes: [0x89, 0x50, 0x4e, 0x47], mime: 'image/png' },
  { bytes: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif' },
  { bytes: [0x1a, 0x45, 0xdf, 0xa3], mime: 'video/webm' }
]

/** Sniff the media type from its magic bytes; the envelope carries no mime field. */
export function imageObjectUrl(image: Uint8Array): string {
  const match = MIME_BY_MAGIC.find(({ bytes }) => bytes.every((byte, index) => image[index] === byte))
  // mp4's 'ftyp' magic sits at offset 4, so the offset-0 matcher above misses it.
  const mime =
    match?.mime ??
    (image[4] === 0x66 && image[5] === 0x74 && image[6] === 0x79 && image[7] === 0x70
      ? 'video/mp4'
      : 'application/octet-stream')
  return URL.createObjectURL(new Blob([image as BlobPart], { type: mime }))
}
