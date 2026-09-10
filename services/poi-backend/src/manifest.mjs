/**
 * The Proof-of-Ink manifest: every blob this backend has stored, by owner.
 *
 * Bulletin's `TransactionByContentHash` holds every blob on the shared testnet — tens of
 * thousands, from every user of the chain — with nothing marking which are Proof-of-Ink.
 * This backend is the only thing that stores POI blobs, so it is the only thing that can
 * cheaply say which of those are ours: it records each upload here as it makes it, and the
 * gallery reads this list instead of scanning the chain.
 *
 * A flat JSON file, upserted by `address` + `kind` so a member re-uploading overwrites
 * their previous entry of that kind. Fine for the testnet scope: one serial ops signer
 * (no concurrent writers), and mountable as a Docker volume where persistence matters.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { config } from './config.mjs'

async function readAll() {
  try {
    return JSON.parse(await readFile(config.manifestPath, 'utf8'))
  } catch (error) {
    // A missing file is an empty manifest, not an error — first run has stored nothing yet.
    if (error.code === 'ENOENT') return []
    throw error
  }
}

/** Every recorded upload, newest last. The gallery filters kind and dedupes per owner. */
export async function readManifest() {
  return readAll()
}

/**
 * Record one stored blob, replacing any prior entry for the same owner and kind.
 *
 * Images carry a `cid` (on chain); videos carry an `mxc`/`eventId` (in Matrix). The upsert
 * key is owner + kind, so a member re-uploading their image or video overwrites the last.
 * Serial by construction — the single ops account acts one at a time — so a read-modify-
 * write with no lock is safe here.
 */
export async function recordUpload(entry) {
  const entries = await readAll()
  const next = entries.filter((existing) => !(existing.address === entry.address && existing.kind === entry.kind))
  next.push({ ...entry, at: new Date().toISOString() })

  await mkdir(dirname(config.manifestPath), { recursive: true })
  await writeFile(config.manifestPath, JSON.stringify(next, null, 2))
}
