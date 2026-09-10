/**
 * Posting Proof-of-Ink verification videos to Matrix.
 *
 * Videos are too large for Bulletin's 2 MiB per-blob cap and are not gallery content —
 * they are proof a desk can review, not a public image — so they are posted to a Matrix
 * room instead of stored on chain. The member has already signed the video's content
 * hash, so ownership is proven identically to the on-chain image; only the bytes' home
 * differs. Two calls: upload the bytes for an `mxc://` URI, then post an `m.video` event
 * referencing it, captioned with the owner so a reviewer can tie the clip to a member.
 */
import { config } from './config.mjs'

/** Whether Matrix is configured. When false, video uploads are refused rather than attempted. */
export function matrixEnabled() {
  const { homeserver, token, room } = config.matrix
  return Boolean(homeserver && token && room)
}

const encodeRoom = (roomId) => encodeURIComponent(roomId)

/**
 * Upload a video to the configured Matrix room, captioned with its owner.
 *
 * `filename` is what a reviewer sees; `owner` is the member's address, put in the caption
 * so the clip is traceable. Returns the `mxc://` URI and the room event id.
 */
export async function postVideo({ bytes, mimetype, filename, owner }) {
  const { homeserver, token, room } = config.matrix

  const uploadResponse = await fetch(
    `${homeserver}/_matrix/media/v3/upload?filename=${encodeURIComponent(filename)}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': mimetype },
      body: bytes
    }
  )
  if (!uploadResponse.ok) {
    throw new Error(`Matrix upload failed: ${uploadResponse.status} ${await uploadResponse.text().catch(() => '')}`)
  }
  const { content_uri: mxc } = await uploadResponse.json()

  const txnId = `${Date.now()}${Math.random().toString(36).slice(2)}`
  const sendResponse = await fetch(
    `${homeserver}/_matrix/client/v3/rooms/${encodeRoom(room)}/send/m.room.message/${txnId}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'm.video',
        body: filename,
        url: mxc,
        info: { mimetype },
        // A plain-text caption so the clip is tied to its owner in clients that show it.
        'm.caption': `Proof-of-Ink verification video — ${owner}`
      })
    }
  )
  if (!sendResponse.ok) {
    throw new Error(`Matrix send failed: ${sendResponse.status} ${await sendResponse.text().catch(() => '')}`)
  }
  const { event_id: eventId } = await sendResponse.json()

  return { mxc, eventId }
}
