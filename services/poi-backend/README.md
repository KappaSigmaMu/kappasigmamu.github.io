# Proof-of-Ink backend

Gates tattoo uploads and makes the two Bulletin Chain calls the browser cannot sign.

Design and rationale: [`docs/poi-bulletin-design-decisions.md`](../../docs/poi-bulletin-design-decisions.md).
Local bring-up: [`docs/poi-bulletin-poc-local.md`](../../docs/poi-bulletin-poc-local.md).
Paseo cutover: [`docs/poi-bulletin-paseo.md`](../../docs/poi-bulletin-paseo.md).

## Why this is self-hosted

The earlier design was a Cloudflare Worker plus a Node signer beside it. That split was
not a preference — Workers refuse runtime WASM instantiation, `@polkadot/api`
initialises `@polkadot/wasm-crypto` on import, and the failure covers reads as much as
writes:

```
FATAL: Unable to initialize @polkadot/wasm-crypto::
WebAssembly.instantiate(): Wasm code generation disallowed by embedder
```

Self-hosting removes the constraint and, with it, the second network hop, the shared
secret between the two processes, and the hand-written xxhash storage-key derivation
the Worker needed to read Society state. Membership is a plain
`api.query.Society.Members` lookup again.

## Stack

PAPI (`polkadot-api`), the same client the frontend uses, against descriptors generated
at the repo root and consumed here through a `portal:` dependency.

That is not only consistency. `@polkadot/api` cannot sign against a runtime carrying
custom transaction extensions — on Paseo Asset Hub even a bare `system.remark` makes
`validate_transaction` trap, because the runtime declares extensions
(`AuthorizeValueTransfer`, `AsPgas`, `AsRingAlias`, `EthSetOrigin`) it has no encoder
for. PAPI reads the extension list from metadata, so it signs whatever the chain
actually asks for. Kusama Asset Hub is likely to adopt the same extensions; on
polkadot-js this service would have broken there silently, in the signing path.

Keys use `@polkadot-labs/hdkd`, so no `@polkadot/*` package remains.

Signature verification uses `@scure`/`@noble` rather than a chain library at all. The
gate is the security-critical path, and these are small pure-JS dependencies with no
WASM init to fail at boot.

### Two things this costs

**`--preserve-symlinks` is mandatory.** The `portal:` dependency is a symlink; without
the flag Node loads a second copy of the PAPI runtime and the first storage query fails.
It is set in every `package.json` script and in the image's `CMD`.

**The descriptors must be generated before building.** Run `yarn papi generate` at the
repo root. The Docker build takes the repo root as its context (not this directory) so
that `.papi/` is reachable, and fails with an explicit message if `dist` is absent.

### The whitelist is load-bearing

`.papi/whitelist.ts` narrows the generated descriptors. A call or storage entry missing
from the `bulletin` list there is **not** a build error — it surfaces at runtime as:

```
Incompatible runtime entry Storage(System.Account)
```

Add the entry, re-run `yarn papi generate`, then `yarn install` here to refresh the
portal.

## What it does

| Route | Purpose |
|---|---|
| `GET /health` | Liveness plus ops address, balance and authorization expiry. No secrets. |
| `POST /authorize` | Gate the uploader, then ops-sign `store` and `enable_auto_renew`. |
| `POST /dev-sign` | Local testing only. Refused unless `ALLOW_DEV_SIGNING=true`. |

**The ops account signs every `store`.** The browser hashes the image, signs that
content hash, and sends the bytes here; the service verifies the uploader, asserts the
bytes hash to the signed hash, then signs `store` and `enable_auto_renew` itself. This
is the only path that works on Paseo, where the faucet grants an account authorization
but not the authorizer status the unsigned `authorize_preimage` path needs. The ops key
can refuse an upload but cannot substitute content for one it has approved.

### The gate

Checks run cheapest-first and each refuses a specific attack:

| Attempt | Result |
|---|---|
| Claims another member's address | `401 Invalid signature` |
| Replays a signature onto different bytes | `401 Invalid signature` |
| Valid signature, not in Society | `403 Not a Society member or candidate` |
| Oversize image | `400 Size must be between …` |
| Missing fields | `400 Missing required fields` |
| Origin not on the allowlist | `403 Unauthorized origin` |

Candidates are accepted as well as members: submitting a tattoo is part of candidacy,
so gating on members alone would lock out the people the feature exists for.

This is what the Apillon predecessor could not do — it checked only `Origin`, so any
allowed page could overwrite any member's image.

Reproduce: `yarn test:gate` against a running backend.

## Running it

### Production / Paseo

```bash
# Descriptors first — the image will not build without them.
(cd ../.. && yarn papi generate)
yarn install

node scripts/generate-ops-key.mjs   # writes secrets/ops_seed, prints the addresses
node scripts/seed-to-env.mjs        # copies the mnemonic into .env as OPS_SEED

cp env.example .env                 # if not already created; set endpoints and origins

docker compose up -d
docker compose exec poi-backend yarn status
```

Scripts that talk to a chain must run through the `yarn` scripts (`yarn status`,
`yarn setup:local`, `yarn test:gate`), which pass `--preserve-symlinks`. Running
`node scripts/status.mjs` directly fails to resolve the descriptors.

The printed address is what you paste into the Paseo faucet. `generate-ops-key.mjs`
refuses to overwrite an existing seed, since rotating the key silently orphans whatever
authorization and balance the old account held.

`status.mjs` is the one to run first on a new network. It answers the question the code
cannot: *has the ops account actually been authorized yet?* On Paseo that grant comes
from the Console faucet, out of band — see the Paseo doc.

The container binds to `127.0.0.1`. It speaks plain HTTP and has no rate limiting, so
put a TLS-terminating reverse proxy in front of it.

### Run the whole system locally

Four moving parts: a Bulletin dev node, a Kubo IPFS gateway, and this backend (all three
in `docker-compose.local.yml`), plus a Chopsticks fork of Asset Hub Kusama that runs on
the **host** — it is not in the compose file because it needs the repo's
`config/kusama.yml` fixture to seed Society candidates.

| Part | Where | Endpoint |
|---|---|---|
| Bulletin dev node (`polkadot-omni-node --dev --ipfs-server`) | compose | `ws://…:9944` |
| Kubo IPFS gateway (peers to the node over Bitswap) | compose | `http://…:8283` |
| poi-backend (ops = `//Ops`, dev-signing on) | compose | `http://127.0.0.1:8787` |
| Chopsticks fork of Asset Hub Kusama | host | `ws://127.0.0.1:8000` |

**Prerequisites (once):**

```bash
# From the repo root — the descriptors must exist before the image builds.
(cd ../.. && yarn papi generate && yarn install)

# The Bulletin dev chain-spec. It is ~1.9 MB and gitignored, so a fresh clone has none:
# generate it and drop it at spec/bulletin-dev-spec.json. Full recipe (binaries + runtime
# build + chain-spec-builder) is in docs/poi-bulletin-poc-local.md.
ls spec/bulletin-dev-spec.json   # must exist; the local compose mounts spec/ read-only
```

**Bring it up:**

```bash
# 1. Chopsticks (Society membership), from the repo root, left running in its own shell.
(cd ../.. && yarn chopsticks)                        # ws://127.0.0.1:8000

# 2. Node + gateway + backend.
docker compose -f docker-compose.local.yml up -d

# 3. Register the ops authorizer, fund it, and self-authorize on the dev chain.
docker compose -f docker-compose.local.yml exec poi-backend yarn setup:local

# 4. Confirm the ops account is ready.
docker compose -f docker-compose.local.yml exec poi-backend yarn status
```

The browser app is separate: `yarn start` at the repo root serves it on `:3000`, which is
the origin the local backend allows.

`yarn setup:local` must be rerun after every node restart — `--dev` wipes the database,
taking the authorizer registration and the ops authorization with it. It is idempotent,
so rerunning it is free.

**End-to-end check** (no browser): `yarn test:gate` against the running backend exercises
the gate; a signed upload then stores and reads back through the gateway at
`http://127.0.0.1:8283/ipfs/<cid>`.

## Operational notes

- **`authorize_preimage` is not feeless.** Only `store`, `store_with_cid_config`,
  `authorize_account` and `refresh_account_authorization` carry `feeless_if`. The ops
  account is charged on every upload and needs a funded, monitored balance. `/health`
  and the keeper both report it.
- **The ops authorization expires** after `AuthorizationPeriod` (14 days on
  Westend/Paseo). When it lapses, uploads fail *and* auto-renewals stop — so stored
  images are deleted at the end of their retention window. The in-process keeper
  watches the expiry and refreshes early; where it cannot refresh itself it logs
  loudly, which is the signal to re-authorize out of band.
- **Being an authorizer is not holding an authorization.** Two different things; the
  ops account needs both. Conflating them cost a debugging session once already.
- **Bulletin reports `Ready -> Finalized`** with no intermediate `InBlock`. Any
  submission helper waiting only on `isInBlock` hangs forever.

## Security

- The seed lives in `.env` (gitignored, mode 600) and reaches the container as an
  environment variable. That means `docker inspect` and `docker compose config` will
  print it on the host, so the host must be access-controlled and a host compromise
  should be treated as a compromise of the ops account. If that is ever too weak, the
  alternative is a docker file secret read at entrypoint, which keeps it out of the
  environment entirely.
- `ALLOW_DEV_SIGNING` turns `/dev-sign` into a signing oracle for any dev seed. It is
  off by default and must never be enabled anywhere real.
- `SUDO_BOOTSTRAP` and `setup-local-chain.mjs` only work on a chain with a `sudo`
  pallet. The script refuses to run otherwise, before broadcasting anything, because
  the alternative is funding transfers from a key the whole world knows.
