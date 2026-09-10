/**
 * Configuration, resolved once at boot.
 *
 * Everything that differs between local, Paseo and mainnet is an environment
 * variable, so moving networks is a compose-file change rather than a code change.
 * Anything without a safe default is required and the process refuses to start
 * without it — a backend that boots with a missing origin allowlist or an unfunded
 * key is worse than one that does not boot at all.
 */

const required = (name) => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

const optional = (name, fallback) => process.env[name] || fallback

export const config = {
  port: Number(optional('PORT', 8787)),

  /** Bulletin node. Local dev node, or wss://paseo-bulletin-rpc.polkadot.io. */
  bulletinWs: required('BULLETIN_WS'),

  /** Asset Hub Kusama — where Society membership actually lives. */
  assetHubWs: required('ASSET_HUB_WS'),

  /** Comma-separated exact origins. No wildcards: this is the CORS allowlist. */
  allowedOrigins: required('ALLOWED_ORIGINS')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean),

  /**
   * Ops key seed. Holds the Bulletin authorization and pays for `authorize_preimage`.
   * Injected as a secret; never written to an image or a compose file.
   */
  opsSeed: required('OPS_SEED'),

  /** Bulletin's own per-transaction ceiling is ~8 MiB; this is the app's policy limit. */
  maxImageBytes: Number(optional('MAX_IMAGE_BYTES', 8388608)),

  /**
   * Whether this deployment may call `add_authorizer` via sudo.
   *
   * Only true on a local dev chain, where `//Alice` holds Root. On Paseo the ops
   * account is authorized out-of-band through the Console faucet, and on mainnet
   * through OpenGov — in neither case can the backend authorize itself.
   */
  sudoBootstrap: optional('SUDO_BOOTSTRAP', 'false') === 'true',

  /**
   * Local-testing signing oracle. Signs arbitrary payloads for dev seeds so the e2e
   * script can stand in for a browser wallet. Must never be enabled anywhere real.
   */
  allowDevSigning: optional('ALLOW_DEV_SIGNING', 'false') === 'true',

  /** Warn when the ops authorization is within this many blocks of expiring. */
  renewalWarningBlocks: Number(optional('RENEWAL_WARNING_BLOCKS', 10_000)),

  /** How often the keeper re-checks the ops authorization, in ms. Default 1 hour. */
  keeperIntervalMs: Number(optional('KEEPER_INTERVAL_MS', 3_600_000)),

  /** Where the Proof-of-Ink upload manifest is written. Mount as a volume to persist it. */
  manifestPath: optional('MANIFEST_PATH', 'data/manifest.json'),

  /** Cap on a verification video, which goes to Matrix rather than the 2 MiB chain. */
  maxVideoBytes: Number(optional('MAX_VIDEO_BYTES', 26214400)),

  /**
   * Matrix room for Proof-of-Ink verification videos.
   *
   * Videos exceed Bulletin's 2 MiB per-blob cap and are not gallery content, so they are
   * posted to a Matrix room instead of stored on chain. The member still signs the video's
   * content hash — ownership is proven the same way — but the bytes land here.
   */
  matrix: {
    homeserver: optional('MATRIX_HOMESERVER', ''),
    token: optional('MATRIX_TOKEN', ''),
    room: optional('MATRIX_ROOM', ''),
    userId: optional('MATRIX_USER_ID', '')
  }
}
