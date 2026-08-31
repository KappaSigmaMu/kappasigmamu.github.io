/**
 * Chain connections and the signed calls the browser cannot make.
 *
 * Two long-lived clients: Bulletin (storage) and Asset Hub Kusama (Society membership).
 * Both reconnect on their own; a dropped socket must not take the service down.
 *
 * PAPI, matching the frontend. That is not only tidiness: `@polkadot/api` cannot sign
 * against runtimes carrying custom transaction extensions — on Paseo Asset Hub even a
 * bare `system.remark` makes `validate_transaction` trap, because the runtime declares
 * extensions (`AuthorizeValueTransfer`, `AsPgas`, `AsRingAlias`, `EthSetOrigin`) that
 * polkadot-js has no encoder for. PAPI reads the extension list from metadata, so it
 * signs whatever the chain actually asks for. Kusama Asset Hub will very likely adopt
 * the same extensions; on polkadot-js this service would have broken silently at that
 * point, in the signing path, in production.
 *
 * Keys are derived with `@polkadot-labs/hdkd` (the PAPI-native path) rather than
 * `Keyring`, which keeps `@polkadot/*` out of the dependency tree entirely.
 */
import { bulletin, ksmAssetHub } from '@polkadot-api/descriptors'
import { createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws'
import { getPolkadotSigner } from 'polkadot-api/signer'
import { sr25519CreateDerive } from '@polkadot-labs/hdkd'
import { DEV_PHRASE, entropyToMiniSecret, mnemonicToEntropy, ss58Address } from '@polkadot-labs/hdkd-helpers'
import { base32 } from '@scure/base'
import { config } from './config.mjs'
import { toHex } from './verify.mjs'

let bulletinClient
let assetHubClient
let bulletinApi
let assetHubApi
let signer
let opsAccountId

/** Set once each client's first block arrives; `/health` reports connecting until then. */
let bulletinLive = false
let assetHubLive = false

/**
 * Derive the ops key without touching the network, so the service can listen first.
 *
 * Accepts a BIP39 mnemonic (what the generator script writes, used on Paseo and
 * mainnet) or a `//Name` path (what local dev chains pre-fund). For the dev path the
 * secret is the standard dev mnemonic and `//Name` is the derivation applied to it —
 * deriving `//Name` from itself would silently produce a different, unfunded account.
 */
export async function initKey() {
  const seed = config.opsSeed.trim()
  const isDevPath = seed.startsWith('//')

  const derive = sr25519CreateDerive(
    entropyToMiniSecret(mnemonicToEntropy(isDevPath ? DEV_PHRASE : seed))
  )

  const pair = derive(isDevPath ? seed : '')

  signer = getPolkadotSigner(pair.publicKey, 'Sr25519', pair.sign)
  opsAccountId = ss58Address(pair.publicKey)

  return opsAccountId
}

/**
 * Sign an arbitrary payload as a `//Name` dev account.
 *
 * Stands in for a browser wallet in the end-to-end script. Restricted to dev
 * derivations of the public dev mnemonic, so it can never be tricked into signing with
 * the ops key, and the route that reaches it is refused unless ALLOW_DEV_SIGNING is on.
 */
export function devSign(devPath, payload) {
  if (!devPath.startsWith('//')) throw new Error('Only //Name dev derivations may be signed')

  const derive = sr25519CreateDerive(entropyToMiniSecret(mnemonicToEntropy(DEV_PHRASE)))
  const pair = derive(devPath)

  const message = payload.startsWith('0x')
    ? Uint8Array.from(payload.slice(2).match(/../g).map((byte) => Number.parseInt(byte, 16)))
    : new TextEncoder().encode(payload)

  return {
    address: ss58Address(pair.publicKey),
    publicKey: toHex(pair.publicKey),
    signature: toHex(pair.sign(message))
  }
}

/**
 * Bring up both chain connections.
 *
 * Deliberately does NOT block the caller on the sockets being up. PAPI's provider
 * retries on its own, so awaiting a first block here against an unreachable endpoint
 * would hang boot and serve no health endpoint. The clients are constructed
 * synchronously and liveness is tracked separately.
 */
export async function connect() {
  bulletinClient = createClient(getWsProvider(config.bulletinWs))
  assetHubClient = createClient(getWsProvider(config.assetHubWs))

  bulletinApi = bulletinClient.getTypedApi(bulletin)
  assetHubApi = assetHubClient.getTypedApi(ksmAssetHub)

  const [bulletinSpec, assetHubSpec] = await Promise.all([
    bulletinClient.getChainSpecData(),
    assetHubClient.getChainSpecData()
  ])

  bulletinLive = true
  assetHubLive = true

  return {
    ops: opsAccountId,
    bulletin: bulletinSpec.name,
    assetHub: assetHubSpec.name
  }
}

/** True once both chains have answered. `/health` reports degraded until then. */
export const isReady = () => bulletinLive && assetHubLive

export const opsAddress = () => opsAccountId
export const getBulletinApi = () => bulletinApi
export const getAssetHubApi = () => assetHubApi

export async function disconnect() {
  bulletinClient?.destroy()
  assetHubClient?.destroy()
}

/**
 * Submit a signed extrinsic and resolve once it is in a block.
 *
 * `signAndSubmit` already waits for inclusion and throws on a failed dispatch, so the
 * `Ready -> Finalized` subscription dance the polkadot-js version needed — Bulletin
 * emits no intermediate `InBlock` — is handled inside PAPI here.
 */
async function submit(tx) {
  const result = await tx.signAndSubmit(signer)

  if (!result.ok) {
    const error = result.dispatchError
    throw new Error(error?.type ? `${error.type}: ${JSON.stringify(error.value)}` : 'Dispatch failed')
  }

  return { blockHash: result.block.hash, events: result.events }
}

/**
 * Society membership on Asset Hub Kusama.
 *
 * Candidates are accepted as well as members: submitting a tattoo is part of the
 * candidacy flow, so gating on `members` alone would lock out exactly the people the
 * feature exists for.
 */
export async function membershipStatus(address) {
  const member = await assetHubApi.query.Society.Members.getValue(address)
  if (member !== undefined) return 'member'

  const candidate = await assetHubApi.query.Society.Candidates.getValue(address)
  if (candidate !== undefined) return 'candidate'

  return 'none'
}

/**
 * Grant a single-use authorization for one specific set of bytes.
 *
 * The ops key never sees the image — it pre-approves a hash the browser handed it, so
 * it cannot substitute different content. The browser then submits `store` unsigned;
 * the pallet matches the bytes against this authorization.
 *
 * Unlike `store` and `authorize_account`, this call carries no `feeless_if` and is
 * paid, so the ops account needs a funded, monitored balance on any real network.
 */
export async function authorizePreimage(contentHash, size) {
  const { blockHash } = await submit(
    bulletinApi.tx.TransactionStorage.authorize_preimage({
      // `SizedHex<32>` is a plain 0x-prefixed hex string, not a Binary wrapper — this
      // is the browser-supplied content hash passed straight through.
      content_hash: contentHash,
      max_size: BigInt(size)
    })
  )

  return blockHash
}

/**
 * Submit `store` signed by the ops account against its account authorization.
 *
 * Path B: a signed `store` from an authorized account is feeless and works on Paseo,
 * where `authorize_preimage` cannot — the faucet grants an account authorization, never
 * authorizer status. The ops key holds the image bytes only for the duration of this
 * call; the browser has already proven ownership of the content hash, and the caller
 * has asserted the bytes hash to it, so ops cannot substitute content.
 *
 * Returns both the block hash and the stored CID, read from the `Stored` event and
 * encoded as a CIDv1 base32 string.
 */
export async function storeSigned(envelope) {
  const { blockHash, events } = await submit(
    bulletinApi.tx.TransactionStorage.store({ data: envelope })
  )

  const stored = events.find(
    (event) => event.type === 'TransactionStorage' && event.value.type === 'Stored'
  )

  if (!stored) throw new Error('store succeeded but emitted no Stored event')

  const cidBytes = stored.value.value.cid
  const cid = 'b' + base32.encode(cidBytes).toLowerCase().replace(/=+$/, '')

  return { blockHash, cid }
}

/**
 * Register recurring renewal for stored data.
 *
 * Without it the data is deleted at the end of the retention period (~14 days). The
 * browser cannot make this call: `enable_auto_renew` requires a signed *and authorized*
 * origin, and the store was unsigned.
 */
export async function enableAutoRenew(contentHash) {
  const { blockHash } = await submit(
    bulletinApi.tx.DataRenewal.enable_auto_renew({ content_hash: contentHash })
  )

  return blockHash
}

/**
 * The ops account's own authorization — transactions left, bytes left, expiry block.
 *
 * This is the single most important number to watch. When it lapses, every
 * `authorize_preimage` and every auto-renewal fails, and stored images are eventually
 * deleted rather than merely unwritable.
 */
export async function opsAuthorization() {
  const value = await bulletinApi.query.TransactionStorage.Authorizations.getValue({
    type: 'Account',
    value: opsAccountId
  })

  if (value === undefined) return null

  const current = await bulletinApi.query.System.Number.getValue()
  const expiration = value.expiration ?? 0

  return {
    ...value,
    currentBlock: current,
    blocksRemaining: expiration - current
  }
}

/** Free balance of the ops account. `authorize_preimage` is charged per upload. */
export async function opsBalance() {
  const account = await bulletinApi.query.System.Account.getValue(opsAccountId)
  return account.data.free.toString()
}

/**
 * Extend the ops authorization window.
 *
 * `refresh_account_authorization` carries `feeless_if` and pushes the expiry out
 * without resetting consumed counters. It needs the authorizer origin, which the ops
 * account holds only where it was registered via `add_authorizer` — see
 * `docs/poi-bulletin-paseo.md` for why that does not hold on Paseo.
 */
export async function refreshOpsAuthorization() {
  const { blockHash } = await submit(
    bulletinApi.tx.TransactionStorage.refresh_account_authorization({ who: opsAccountId })
  )

  return blockHash
}

export { submit }
