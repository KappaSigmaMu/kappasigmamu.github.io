# Polkadot Bulletin Chain — Research Handoff

**Compiled:** 2026-08-10
**Audience:** a dev agent building a POC, exploring the chain, and debugging against it.
**Verification note:** every repo path and npm package linked below was checked live against `main` on 2026-08-10 (GitHub contents API + npm registry). Endpoints and runtime constants were **not** dialed — verify those first thing (see §15). Facts sourced from docs pages are attributed inline so you can re-read the primary source rather than trusting this summary.

---

## 1. What it is

The Polkadot Bulletin Chain is a Polkadot SDK–based parachain providing **decentralized file storage with IPFS-compatible content addressing**. Submit raw bytes in an extrinsic, get back an IPFS CID, retrieve by CID with standard IPFS tooling.

Mental model: **write to chain, read from network.**

1. **Write** — data lands in on-chain transaction storage via `store`.
2. **Read** — collator nodes speak the IPFS **Bitswap** wire protocol, so IPFS clients (Helia in-browser, Kubo, or an HTTP gateway) fetch chunks directly from collators by CID.

Two things make it unlike a normal parachain:

- **No token balances, no fees.** Storage extrinsics are *unconditionally feeless*. Authorization is the sole economic control. — [docs/authorizations.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/authorizations.md)
- **No permanent storage by default.** Data is retained ~14 days and pruned unless **renewed**.

Good for: static sites, images/media, NFT and app metadata, JSON documents, dApp state snapshots. Bad for: anything needing set-and-forget permanence.

**Primary sources**
- [Data Storage reference — Polkadot Developer Docs](https://docs.polkadot.com/reference/polkadot-hub/data-storage/)
- [Store and Retrieve Data on the Bulletin Chain — tutorial](https://docs.polkadot.com/chain-interactions/store-data/bulletin-chain/)
- [Repo README](https://github.com/paritytech/polkadot-bulletin-chain#readme)

---

## 2. Live endpoints

| Resource | URL |
|---|---|
| Console UI (upload / download / renew / faucet) | https://paritytech.github.io/polkadot-bulletin-chain/ |
| Authorizations page | https://paritytech.github.io/polkadot-bulletin-chain/authorizations |
| Paseo RPC / WebSocket | `wss://paseo-bulletin-rpc.polkadot.io` |
| Paseo "next" RPC (appears in Rust SDK example) | `wss://paseo-bulletin-next-rpc.polkadot.io` |
| IPFS HTTP gateway | `https://paseo-bulletin-next-ipfs.polkadot.io/ipfs/<CID>` |
| Polkadot.js Apps, pre-pointed | https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpaseo-bulletin-rpc.polkadot.io |
| Local dev node | `ws://127.0.0.1:9944` |

**Which RPC is canonical is unresolved** — docs use `paseo-bulletin-rpc`, [`sdk/README.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/sdk/README.md) uses `paseo-bulletin-next-rpc`. Dial both before committing.

A **Polkadot Products DevNet** Bulletin deployment also exists; its faucet has been reported empty — [forum thread](https://forum.polkadot.network/t/insufficientauthorizerbudget-failures-on-polkadot-products-devnet-bulletin-chain-authorisation/18307).

---

## 3. Authorization model — read before writing any code

Nothing can be stored until an authorization exists. `authorize_account` is **not** self-callable; it requires the configured `T::Authorizer` origin (Root, XCM from a sibling parachain, a registered authorizer, or e.g. Proof-of-Personhood).

Source of truth: [docs/authorizations.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/authorizations.md) ([raw](https://raw.githubusercontent.com/paritytech/polkadot-bulletin-chain/main/docs/authorizations.md)) and [concepts/authorization.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/concepts/authorization.md).

### Scopes

| Scope | Grants |
|---|---|
| **Account-scoped** | A named account may store up to *N transactions* / *N bytes* |
| **Preimage-scoped** | Single-shot: anyone supplying data matching a pre-registered hash may store it (sponsored uploads) |

### `AuthorizationExtent` fields

- `transactions`, `bytes` — soft-limit consumed counters for temporary storage
- `bytes_permanent` — renewed storage consumed in the current window
- `transactions_allowance`, `bytes_allowance` — capability caps
- `expiration` — block number

### Extrinsics

**Authorization**
- `authorize_account(account, bytes, transactions)` — grant or extend account rights
- `authorize_preimage(hash, bytes)` — single-shot preimage right
- `refresh_account_authorization(account)` — extend `expiration` by one `AuthorizationPeriod`, **no added capacity**
- `remove_expired_account_authorization(account)` — cleanup

**Storage**
- `store(data)` — temporary storage, feeless, authorization-gated
- `store_with_cid_config(data, config)` — same, with non-default CID config
- `force_renew(entry)` — synchronous renewal
- `renew(entry)` — one-shot scheduler with prepayment
- `enable_auto_renew(content_hash)` / `disable_auto_renew(content_hash)` — recurring renewal

### Expiry semantics — subtle and important

| Prior state on `authorize_account` | Behavior |
|---|---|
| **Unexpired** | Caps are **additive**; consumed counters **preserved** |
| **Expired-but-present** | Caps **re-granted**; **all consumed counters reset to zero**, including `bytes_permanent` |
| **Missing** | Fresh entry, all counters zero |

Consequence: to reset a consumption quota you must let the authorization **expire** and re-authorize. `refresh_account_authorization` extends the window but does **not** reset consumption.

### Getting authorized, by network

- **Paseo TestNet:** [Console UI](https://paritytech.github.io/polkadot-bulletin-chain/) → **Faucet** → **Storage Faucet** tab → *Authorize Account*, enter transactions + bytes → confirm in wallet → verify on **Accounts** tab. Per the [tutorial](https://docs.polkadot.com/chain-interactions/store-data/bulletin-chain/).
- **Mainnet:** **OpenGov only**, no faucet. Budget referendum lead time. — [Data Storage reference](https://docs.polkadot.com/reference/polkadot-hub/data-storage/)
- **Local/dev:** sudo/Root, or the scripts in [`examples/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/examples).

Pre-flight your quota from the app SDK before every upload — [Store Data on Chain](https://docs.polkadot.com/apps/build/store-data-on-chain/):

```javascript
const auth = await client.checkAuthorization(address);
// → remaining transactions, remaining bytes, expiration block
```

---

## 4. Hard numbers

| Parameter | Value | Source |
|---|---|---|
| Max bytes per transaction | **~8 MiB** | [Data Storage reference](https://docs.polkadot.com/reference/polkadot-hub/data-storage/) |
| Max file via chunking + DAG-PB manifest | **~64 MiB** | same |
| `RetentionPeriod` | **14 days** | [docs/authorizations.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/authorizations.md) |
| `AuthorizationPeriod` | **14 days** (Westend/Paseo) | same |
| `MaxPermanentStorageSize` | chain-wide renewed cap, **1.7 TiB** in the doc's example | same |
| `ALLOWANCE_PRIORITY_BOOST` | priority multiplier for in-budget transactions | same |
| Block time | 24 s slots | [docs/architecture.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/architecture.md) |
| Block size limit | 10 MiB | same |
| CID hash / codec | Blake2b-256 / Raw (default) | [tutorial](https://docs.polkadot.com/chain-interactions/store-data/bulletin-chain/) |

**Per-account peak renewed-bytes bound:** `(K + 1) × bytes_allowance` where `K = RetentionPeriod / AuthorizationPeriod`. Westend/Paseo have `K = 1`, so **2 × bytes_allowance** during window overlap. Size capacity planning off this, not off `bytes_allowance` alone.

Enforcement asymmetry: `store` is **soft**-enforced (priority signal); `renew` is **hard**-enforced against a per-window quota plus the chain-wide cap. **Renewal is the contended resource.**

---

## 5. Errors and events to handle

From [docs/authorizations.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/authorizations.md):

| Error | Cause |
|---|---|
| `Error::PermanentAllowanceExceeded` | `bytes_permanent + size > bytes_allowance` — per-account renewal quota blown |
| `Error::ChainPermanentCapReached` | `PermanentStorageUsed + size > MaxPermanentStorageSize` — chain-wide cap hit, not your fault, retry later |
| `CannotDisablePrepaidAutoRenewal` | Signed caller tried to disable auto-renewal inside its prepaid window. Only root can, and doing so forfeits the prepayment |
| `InsufficientAuthorizerBudget` | Authorizer (faucet) itself is out of budget — see [forum report](https://forum.polkadot.network/t/insufficientauthorizerbudget-failures-on-polkadot-products-devnet-bulletin-chain-authorisation/18307) |

| Event | Meaning |
|---|---|
| `Renewed` | Carries the **new** `(block, index)` — you must capture this (see §8, caveat 3) |
| `PermanentStorageUsedUpdated { used }` | Fires on every renewal and on obsolete-block cleanup |
| `PermanentStorageNearCap { used, cap }` | Fires at **80%** of `MaxPermanentStorageSize` — treat as a capacity alarm |

SDK-side error handling guides: [typescript/error-handling.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/error-handling.md), [rust/error-handling.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/error-handling.md).

---

## 6. Repo map — every path verified on `main`, 2026-08-10

Repo: **https://github.com/paritytech/polkadot-bulletin-chain**

### Pallets — [`pallets/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/pallets)

| Dir | Crate name | Role |
|---|---|---|
| [`pallets/transaction-storage`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/pallets/transaction-storage) | `pallet-bulletin-transaction-storage` | Core: `store`, `store_with_cid_config`, `renew`, authorization extrinsics, Merkle storage proofs with chunk validation |
| [`pallets/data-renewal`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/pallets/data-renewal) | `pallet-bulletin-data-renewal` | Renewal scheduling / auto-renew |
| [`pallets/hop-promotion`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/pallets/hop-promotion) | `pallet-bulletin-hop-promotion` | Promotes expiring HOP (Handoff Protocol) pool data into chain storage via unsigned transactions |
| [`pallets/common`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/pallets/common) | `bulletin-pallets-common` | Shared utilities incl. the no-op currency impl that makes "no token balances" work |

### Runtimes — [`runtimes/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/runtimes)

| Dir | Crate name |
|---|---|
| [`runtimes/bulletin-westend`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/runtimes/bulletin-westend) | `bulletin-westend-runtime` |
| [`runtimes/bulletin-paseo`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/runtimes/bulletin-paseo) | `bulletin-paseo-runtime` |

### Everything else

| Path | What |
|---|---|
| [`docs/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/docs) | architecture, authorizations, development, playbook, book |
| [`sdk/rust`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/sdk/rust) | crate `bulletin-sdk-rust` (import as `bulletin_sdk_rust`) |
| [`sdk/typescript`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/sdk/typescript) | package `@parity/bulletin-sdk` |
| [`sdk/metadata.scale`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/sdk/metadata.scale) | checked-in chain metadata — useful for offline codegen |
| [`console-ui/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/console-ui) | React 19 + Vite console; Smoldot light client + Helia. **Best worked example of browser integration** |
| [`examples/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/examples) | runnable JS/TS/Rust scripts — see §9 |
| [`chainspecs/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/chainspecs) | generated chain specs |
| [`zombienet/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/zombienet) | `bulletin-westend-local.toml`, `bulletin-paseo-local.toml`, `bulletin-polkadot-local.toml` |
| [`zombienet-sdk-tests/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/zombienet-sdk-tests) | e2e test suite |
| [`stress-test/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/stress-test) | load testing |
| [`templates/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/templates) · [`utils/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/utils) · [`scripts/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/scripts) | scaffolding, helpers, binary fetcher |
| [`justfile`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/justfile) | all build/test recipes; mirrors CI |
| [`.github/env`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/.github/env) | pinned external binary versions |
| [`CLAUDE.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/CLAUDE.md) | **agent instructions the maintainers wrote for this repo — read this first** |
| [`CONTRIBUTING.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/CONTRIBUTING.md) | contribution rules |

**License:** GPL-3.0-only with an Apache-2.0 alternative.

---

## 7. The mdbook — the deepest documentation, one page per topic

Serve locally with `mdbook serve --open` from [`docs/book/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/docs/book), or read the sources directly. Full TOC from [`SUMMARY.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/SUMMARY.md):

**Intro**
- [Introduction](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/README.md)
- [Quick Start](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/quickstart.md)

**Core concepts** — [index](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/concepts/README.md)
- [Authorization](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/concepts/authorization.md)
- [Storage Model](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/concepts/storage.md)
- [Data Retrieval](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/concepts/retrieval.md)
- [Data Renewal](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/concepts/renewal.md)
- [DAG-PB Manifests](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/concepts/manifests.md)

**TypeScript SDK** — [index](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/README.md)
- [Installation](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/installation.md) · [Authorization](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/authorization.md) · [Basic Storage](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/basic-storage.md) · [Chunked Uploads](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/chunked-uploads.md) · [Renewal](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/renewal.md) · [Error Handling](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/error-handling.md) · [PAPI Integration](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/papi-integration.md) · [API Reference](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/api-reference.md)

**Rust SDK** — [index](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/README.md)
- [Installation](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/installation.md) · [Authorization](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/authorization.md) · [Basic Storage](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/basic-storage.md) · [Chunked Uploads](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/chunked-uploads.md) · [Renewal](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/renewal.md) · [Error Handling](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/error-handling.md) · [Testing / mocks](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/mock-testing.md) · [no_std Support](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/no_std.md) · [API Reference](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/api-reference.md)

Other in-repo docs:
- [`docs/architecture.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/architecture.md) ([raw](https://raw.githubusercontent.com/paritytech/polkadot-bulletin-chain/main/docs/architecture.md))
- [`docs/authorizations.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/authorizations.md) ([raw](https://raw.githubusercontent.com/paritytech/polkadot-bulletin-chain/main/docs/authorizations.md))
- [`docs/development.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/development.md) ([raw](https://raw.githubusercontent.com/paritytech/polkadot-bulletin-chain/main/docs/development.md))
- [`docs/playbook.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/playbook.md) ([raw](https://raw.githubusercontent.com/paritytech/polkadot-bulletin-chain/main/docs/playbook.md))

---

## 8. Client paths — pick deliberately

Four surfaces exist for different users. npm versions below were the latest on 2026-08-10.

### 8.1 `@parity/product-sdk` — highest level, for "Polkadot Products"

npm: [`@parity/product-sdk`](https://www.npmjs.com/package/@parity/product-sdk) **0.21.0** · API reference: https://paritytech.github.io/product-sdk/ · Guide: [Store Data on Chain](https://docs.polkadot.com/apps/build/store-data-on-chain/)

```bash
npm install @parity/product-sdk
```

Bundles [`@parity/product-sdk-cloud-storage`](https://www.npmjs.com/package/@parity/product-sdk-cloud-storage) (0.10.0), [`@parity/product-sdk-host`](https://www.npmjs.com/package/@parity/product-sdk-host) (0.15.1, preimage management), and [`polkadot-api`](https://www.npmjs.com/package/polkadot-api).

```javascript
const app = await createApp({ name: 'my-product' });
await app.wallet.connect();
const cid = await app.cloudStorage.upload('Hello, Bulletin!');
const bytes = await app.cloudStorage.fetch(cid);
```

Storage path selection, per the same guide:

| Scenario | Method | Atomic? |
|---|---|---|
| Small data | `app.cloudStorage.upload(data)` | Yes, single transaction |
| Large files (>8 MiB) | `client.store().withChunkSize()` | **No** — multi-transaction + manifest |
| Cross-chain | People Chain XCM dispatch | Eventually consistent |
| Sponsored uploads | Preimage authorization | Yes, single unsigned transaction |

Also in the family: [`@parity/product-sdk-statement-store`](https://www.npmjs.com/package/@parity/product-sdk-statement-store) (0.6.4) for the pub/sub side.

### 8.2 `@parity/bulletin-sdk` — direct TypeScript SDK

npm: [`@parity/bulletin-sdk`](https://www.npmjs.com/package/@parity/bulletin-sdk) **0.4.0** · source: [`sdk/typescript`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/sdk/typescript) · docs: [book TypeScript section](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/README.md)

Node ≥ 22, browser-compatible. Supports `authorizeAccount`, `authorizePreimage`, `renew`, automatic chunking, DAG-PB manifest generation, progress callbacks.

```typescript
import { AsyncBulletinClient } from '@parity/bulletin-sdk';

const client = new AsyncBulletinClient(api, signer, papiClient.submit);
const data = new TextEncoder().encode("Hello, Bulletin!");
const result = await client.store(data).send();
```

```bash
cd sdk/typescript && npm install && npm run build
```

### 8.3 `bulletin-sdk-rust` — Rust SDK

Source: [`sdk/rust`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/sdk/rust) · docs: [book Rust section](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/rust/README.md) · crate name `bulletin-sdk-rust`, imported as `bulletin_sdk_rust`. `no_std`-compatible with optional `std`.

```rust
use bulletin_sdk_rust::prelude::*;

let client = BulletinClient::new();
let data = b"Hello, Bulletin!".to_vec();
let operation = client.prepare_store(data, StoreOptions::default())?;

let tx_client = TransactionClient::new("wss://paseo-bulletin-next-rpc.polkadot.io").await?;
let receipt = tx_client.store(operation.data, &signer, WaitFor::InBlock).await?;
```

```bash
cd sdk/rust && cargo build --release --all-features
```

### 8.4 Raw PAPI — what the official tutorial uses

From [the tutorial](https://docs.polkadot.com/chain-interactions/store-data/bulletin-chain/). Note the exact pins — the API surface is still moving.

```bash
npm install polkadot-api@2.1.0 @polkadot-labs/hdkd@0.0.28 @polkadot-labs/hdkd-helpers@0.0.30 multiformats
npx papi add bulletin -w wss://paseo-bulletin-rpc.polkadot.io
```

PAPI integration notes: [book page](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/papi-integration.md). Offline codegen alternative: [`sdk/metadata.scale`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/sdk/metadata.scale).

---

## 9. Runnable examples — start here for the POC

[`examples/README.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/README.md) · [`examples/justfile`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/justfile) · [`examples/package.json`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/package.json)

| Script | Demonstrates |
|---|---|
| [`authorize_and_store_papi.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/authorize_and_store_papi.js) | **Canonical happy path** — authorize then store via PAPI |
| [`authorize_and_store_papi_smoldot.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/authorize_and_store_papi_smoldot.js) | Same, over a Smoldot light client |
| [`authorize_preimage_and_store_papi.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/authorize_preimage_and_store_papi.js) | Preimage / sponsored-upload flow |
| [`store_chunked_data.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/store_chunked_data.js) | Chunked upload |
| [`store_big_data.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/store_big_data.js) | Large-file path |
| [`native_ipfs_dag_pb_chunked_data.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/native_ipfs_dag_pb_chunked_data.js) | DAG-PB manifest interop with native IPFS |
| [`cid_dag_metadata.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/cid_dag_metadata.js) | CID / DAG metadata inspection |
| [`check_auto_renew_chopsticks.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/check_auto_renew_chopsticks.js) | **Auto-renewal tested under Chopsticks** — the reference for renewal logic |
| [`check_chopsticks.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/check_chopsticks.js) | Chopsticks fork-testing harness |
| [`hop_round_trip.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/hop_round_trip.js) | HOP / Handoff Protocol round trip |
| [`upgrade_runtime.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/upgrade_runtime.js) | Sudo runtime upgrade |
| [`api.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/api.js) · [`common.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/common.js) · [`logger.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/logger.js) | Shared helpers |
| [`examples/rust/authorize-and-store`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/examples/rust/authorize-and-store) | Rust equivalent — [README](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/rust/README.md) |
| [`examples/typescript/authorize_and_store.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/typescript/authorize_and_store.js) | TS equivalent |

**Chopsticks** shows up twice — that is the intended way to test renewal behavior without waiting 14 real days. Use it.

---

## 10. Retrieval

| Method | How | When |
|---|---|---|
| HTTP gateway | `GET https://paseo-bulletin-next-ipfs.polkadot.io/ipfs/<CID>` | Fastest to wire; centralized read path |
| Direct P2P (Helia) | libp2p + Bitswap in-browser — [helia.io](https://helia.io/) | Production decentralized read |
| Kubo / any IPFS client | Standard Bitswap against collators — [Kubo docs](https://docs.ipfs.tech/install/command-line/) | Server-side, scripting |
| Console UI Download page | P2P or gateway toggle — [console](https://paritytech.github.io/polkadot-bulletin-chain/) | Manual verification while debugging |
| Smoldot light client | — | **Announced "coming soon", not shipped** — [smoldot](https://github.com/smol-dot/smoldot) |

Bitswap serving of transaction-storage chunks is implemented in [**litep2p**](https://github.com/paritytech/litep2p) and in the litep2p backend of `sc-network` ([polkadot-sdk](https://github.com/paritytech/polkadot-sdk)). Design origin: [substrate PR #7963 — "Storage chains: serve transactions over IPFS/bitswap"](https://github.com/paritytech/substrate/pull/7963). Related: [litep2p PR #482](https://github.com/paritytech/litep2p/pull/482).

Concept page: [concepts/retrieval.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/concepts/retrieval.md).

---

## 11. Caveats and gotchas

Ordered by likelihood of biting you.

1. **Repo self-labels experimental and unaudited.** From [`sdk/README.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/sdk/README.md): *"This code has not been fully audited. It is actively under development and may contain bugs, vulnerabilities, or incomplete features. It is not recommended for production use without independent review."* POC is fine; production is a separate decision.

2. **Data disappears at ~14 days.** Pruned and unrecoverable. A renewal daemon or `enable_auto_renew` is day-one work, not a follow-up. This is the single biggest operational difference from an IPFS pinning service. — [concepts/renewal.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/concepts/renewal.md)

3. **Renewal invalidates the old `(block, index)` pair.** After renewing, the original block number and transaction index are dead. Capture the new pair from the `Renewed` event and use it for the *next* renewal. Persisting the original and reusing it silently breaks the renewal chain. — [tutorial](https://docs.polkadot.com/chain-interactions/store-data/bulletin-chain/)

4. **Renewals key off `(block, index)`, not the CID.** If you only persist the CID at store time you cannot renew. Persist both.

5. **Chunked uploads are not atomic.** If chunk N fails after 1..N-1 succeeded, earlier chunks stay on-chain, consume authorization, and there is no rollback. Needs retry + reconciliation logic. — [Store Data on Chain](https://docs.polkadot.com/apps/build/store-data-on-chain/), [chunked-uploads.md](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/typescript/chunked-uploads.md)

6. **No self-authorization.** `authorize_account` needs the `T::Authorizer` origin. On mainnet that means an OpenGov referendum. Do not architect around a call your app can make itself.

7. **`refresh` ≠ reset.** `refresh_account_authorization` extends `expiration` without adding capacity or clearing consumed counters. Only an **expired-then-re-authorized** account gets counters zeroed. Easy to misread as a quota reset.

8. **Faucets run dry.** `InsufficientAuthorizerBudget` is a live, reported failure on Products DevNet — [forum thread](https://forum.polkadot.network/t/insufficientauthorizerbudget-failures-on-polkadot-products-devnet-bulletin-chain-authorisation/18307). Surface it as its own error state, not a generic extrinsic failure.

9. **Renewal capacity is shared and contended.** `ChainPermanentCapReached` is other people's usage, not your bug. Watch `PermanentStorageNearCap` (fires at 80%) and back off.

10. **Real footprint is `2 × bytes_allowance` on Westend/Paseo,** not `bytes_allowance`, because of authorization/retention window overlap. Plan quotas accordingly.

11. **Endpoint drift.** `paseo-bulletin-rpc` (docs) vs `paseo-bulletin-next-rpc` (Rust SDK example). Verify before wiring.

12. **`--ipfs-server` is required on a local node.** Without it Bitswap serving is off and retrieval by CID silently does not work.

13. **Docs disagree with each other.** [`docs/architecture.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/architecture.md) documents neither IPFS integration nor XCM, while the README and developer docs describe both. Trust the pallet source over any doc.

14. **Smoldot retrieval not shipped.** If the design assumes trustless in-browser reads without a gateway, check status first.

15. **Do not confuse with Polkadot Cloud's Data Availability Service** — [polkadot.cloud/service/data-availability](https://polkadot.cloud/service/data-availability) is parachain DA, an unrelated product that dominates search results for "Polkadot data availability".

16. **Migration horizon.** Bulletin's role is expected to be absorbed by the JAM data lake — see §13. Do not build anything that cannot be migrated.

---

## 12. Running and debugging locally

Source: [`docs/development.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/development.md) and [`docs/playbook.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/playbook.md).

### Setup

Prereqs: Rust toolchain + [`just`](https://github.com/casey/just).

```bash
cargo install just --locked
just --list          # every recipe; these mirror CI exactly
```

External binaries (polkadot, workers, chain-spec-builder, omni-node, frame-omni-bencher, try-runtime, zombienet) download via [`scripts/get_polkadot_binaries.sh`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/scripts/get_polkadot_binaries.sh) and cache in `./.polkadot-binaries/`.

Versions pinned in [`.github/env`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/.github/env) via `POLKADOT_NODE_VERSION`, `FRAME_OMNI_BENCHER_VERSION`, `CHAIN_SPEC_BUILDER_VERSION`, `TRY_RUNTIME_VERSION`, `ZOMBIENET_VERSION`. Each accepts a release tag (`polkadot-stable2603`) or a 40-char commit hash. Override per session:

```bash
POLKADOT_NODE_VERSION=polkadot-stable2603 just binaries-polkadot
```

### Bring up a dev node

```bash
just binaries-polkadot                  # omni-node + workers
just chain-spec westend                 # runtime + chain spec
$OMNI_NODE --chain ./zombienet/bulletin-westend-spec.json --dev --ipfs-server
```

RPC on `ws://127.0.0.1:9944`. **`--ipfs-server` is mandatory for retrieval.**

### Build and test

```bash
cargo build --profile production -p bulletin-westend-runtime
cargo build --release -p bulletin-paseo-runtime
cargo test -p pallet-bulletin-transaction-storage
just test-pallets
just test-zombienet-auto-renew          # e2e, westend|paseo matrix
just test-zombienet-sync
just bench <args>
just try-runtime <args>
just chain-spec westend | just chain-spec paseo
```

Zombienet configs: [`bulletin-westend-local.toml`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/zombienet/bulletin-westend-local.toml), [`bulletin-paseo-local.toml`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/zombienet/bulletin-paseo-local.toml), [`bulletin-polkadot-local.toml`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/zombienet/bulletin-polkadot-local.toml).

### Troubleshooting table — from `docs/playbook.md`

| Problem | Fix |
|---|---|
| macOS compilation failure | Symlink libclang using brew prefix paths |
| Lingering zombienet processes | Kill stale processes, clean temp dirs |
| WASM hash mismatch | Verify locally with `b2sum -l 256` |
| IPFS retrieval not working | Check bitswap logs; confirm `--ipfs-server` is set |

### Runtime upgrades (for a POC that needs a patched runtime)

- **Sudo:** [`examples/upgrade_runtime.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/upgrade_runtime.js) with seed + RPC, or manually `sudo.sudo(system.setCode(code))` through Polkadot.js Apps.
- **Authorized:** take the Blake2-256 hash from the release notes, `system.authorizeUpgrade()`, then `system.applyAuthorizedUpgrade()`.
- Release tags: `v0.0.X` for testnets, `v1.x.y` for production. One tag triggers CI builds for all runtimes; the tag format picks the track. Compiled WASM artifacts come from the [GitHub releases](https://github.com/paritytech/polkadot-bulletin-chain/releases).
- Pre-release gate: test suite, `clippy` across all targets/features, `fmt` on nightly. Version bump = `spec_version` in the runtime, branch named `bump-<RUNTIME>-spec-version-<VERSION>`.
- Playbook covers three networks: **westend, paseo, pop**.

### Fork testing

Use [Chopsticks](https://github.com/AcalaNetwork/chopsticks) — the repo ships [`check_chopsticks.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/check_chopsticks.js) and [`check_auto_renew_chopsticks.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/check_auto_renew_chopsticks.js). This is how you exercise 14-day renewal logic in seconds.

---

## 13. Ecosystem context and direction

- **Levity** — Parity's umbrella for the decentralized storage + content-delivery layer: **Bulletin Chain + Handoff Protocol (HOP)**. `pallet-hop-promotion` is the seam. Aimed at apps serving profile photos, documents, media, frontends. Outlined in [Socials digest 2026-07-30](https://forum.polkadot.network/t/polkadot-socials-daily-digest-2026-07-30/18285).
- **Status** — moved prototype → production in late 2025 ahead of project **Individuality**; growing adoption as default storage for product teams. — [Polkadot Roundup 2025 (Parity)](https://www.parity.io/blog/polkadot-roundup-2025) · [Medium mirror](https://medium.com/polkadot-network/polkadot-roundup-2025-3c3c71c7e9c4)
- **Sunset path** — expected to expand through 2026, then absorbed by the **JAM chain's data lake**. — [JAM Chain wiki](https://wiki.polkadot.com/learn/learn-jam-chain/) · [JAM explainer](https://blockeden.xyz/blog/2025/10/28/jam-chain-polkadot-s-paradigm-shift-toward-the-decentralized-global-computer/)
- **Individuality / proof-of-personhood** — the driving use case. — [Proof of Personhood: the Individuality layer of Polkadot](https://medium.com/@polk_gov/proof-of-personhood-the-individuality-layer-of-polkadot-74aba1c53c66)
- **Complementary primitive: the Statement Store** — ephemeral, 512-byte-capped pub/sub gossip. Canonical pattern: *Bulletin for durable snapshots, Statement Store to announce the CID with a short TTL.* — [Statement Store reference](https://docs.polkadot.com/reference/apps/infrastructure/statement-store/) · [Pub/Sub Off-Chain Data](https://docs.polkadot.com/apps/build/pub-sub-off-chain-data/)
- **Shipped examples** — SoverStore (QR unlocking an encrypted Bulletin file, [digest 2026-07-15](https://forum.polkadot.network/t/polkadot-socials-daily-digest-2026-07-15/18144)), fully on-chain NES-style games ([digest 2026-08-01](https://forum.polkadot.network/t/polkadot-socials-daily-digest-2026-08-01/18299)), static-site hosting.

---

## 14. Suggested POC path

1. Read [`CLAUDE.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/CLAUDE.md) in the repo — maintainer-written agent instructions.
2. Skim [Data Storage reference](https://docs.polkadot.com/reference/polkadot-hub/data-storage/) (~10 min) for the model.
3. Do the [Console tutorial](https://docs.polkadot.com/chain-interactions/store-data/bulletin-chain/) by hand **before** writing code — confirms the faucet works and yields a live CID to poke at.
4. Run [`examples/authorize_and_store_papi.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/authorize_and_store_papi.js) against Paseo. This is the shortest working end-to-end.
5. Read [`docs/authorizations.md`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/authorizations.md) fully — it is where the non-obvious semantics live.
6. Stand up a local node with `--ipfs-server` (§12) so you can debug without faucet dependency.
7. Exercise renewal under [Chopsticks](https://github.com/AcalaNetwork/chopsticks) via [`check_auto_renew_chopsticks.js`](https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/check_auto_renew_chopsticks.js) before designing the renewal daemon.
8. For a full-stack shape, read [Build a Shared Todo App](https://docs.polkadot.com/apps/tutorials/shared-todo-app/) — the only example combining Bulletin + Statement Store + wallet + local storage.
9. For browser integration, read [`console-ui/`](https://github.com/paritytech/polkadot-bulletin-chain/tree/main/console-ui) (Smoldot + Helia).

---

## 15. Verify first — open questions

Resolve these before designing around them; nothing below was confirmed live.

- Which Paseo RPC is canonical: `paseo-bulletin-rpc` or `paseo-bulletin-next-rpc`?
- Is there a **mainnet/Polkadot** deployment with a public RPC? The playbook names a `pop` network and there is a `bulletin-polkadot-local.toml` — what are they?
- Current OpenGov process and lead time for a mainnet storage authorization.
- Actual **mainnet** retention period — the 14-day figure is documented for Westend/Paseo.
- Live values of `MaxPermanentStorageSize` (docs example: 1.7 TiB), `bytes_allowance`, and the per-window renewal quota. Query chain constants rather than trusting docs.
- Status of Smoldot light-client retrieval.
- Whether `enable_auto_renew` is reachable from `@parity/bulletin-sdk` or chain-side only.
- Concrete HOP / Levity documentation — currently only forum-summary level. What does `pallet-bulletin-hop-promotion` actually integrate with?
- What role `pallet-bulletin-data-renewal` plays vs the renewal extrinsics on `pallet-bulletin-transaction-storage` — the two overlap and the docs do not distinguish them.
- Cost model at scale: with no fees, what rate-limits storage beyond governance-granted authorizations?

---

## 16. Full link index

### Official Polkadot docs
- Store and Retrieve Data on the Bulletin Chain — https://docs.polkadot.com/chain-interactions/store-data/bulletin-chain/
- Data Storage reference (Polkadot Hub) — https://docs.polkadot.com/reference/polkadot-hub/data-storage/
- Preimage Authorization section — https://docs.polkadot.com/reference/polkadot-hub/data-storage/#preimage-authorization
- Store Data on Chain (Products SDK) — https://docs.polkadot.com/apps/build/store-data-on-chain/
- Build a Shared Todo App — https://docs.polkadot.com/apps/tutorials/shared-todo-app/
- Pub/Sub Off-Chain Data — https://docs.polkadot.com/apps/build/pub-sub-off-chain-data/
- Persist Data Locally — https://docs.polkadot.com/apps/build/persist-data-locally/
- Deploy Your App — https://docs.polkadot.com/apps/deploy-your-app/
- Statement Store reference — https://docs.polkadot.com/reference/apps/infrastructure/statement-store/
- Chain Data basics — https://docs.polkadot.com/polkadot-protocol/basics/chain-data/
- dApp tutorials index — https://docs.polkadot.com/tutorials/dapps/
- Polkadot Wiki — https://wiki.polkadot.com/
- Polkadot-JS account guides — https://wiki.polkadot.network/docs/learn-guides-accounts

### Repository (all verified on `main`, 2026-08-10)
- Repo root — https://github.com/paritytech/polkadot-bulletin-chain
- README — https://github.com/paritytech/polkadot-bulletin-chain#readme
- CLAUDE.md — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/CLAUDE.md
- CONTRIBUTING.md — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/CONTRIBUTING.md
- justfile — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/justfile
- .github/env — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/.github/env
- scripts/get_polkadot_binaries.sh — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/scripts/get_polkadot_binaries.sh
- Releases — https://github.com/paritytech/polkadot-bulletin-chain/releases
- Issues — https://github.com/paritytech/polkadot-bulletin-chain/issues
- Issue #631, TypeScript SDK CI integration — https://github.com/paritytech/polkadot-bulletin-chain/issues/631

**Docs**
- docs/architecture.md — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/architecture.md
- docs/authorizations.md — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/authorizations.md
- docs/development.md — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/development.md
- docs/playbook.md — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/playbook.md
- docs/book — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/docs/book
- book SUMMARY.md — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/docs/book/src/SUMMARY.md
- (individual book pages listed in §7)

**Code**
- pallets/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/pallets
- runtimes/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/runtimes
- sdk/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/sdk
- sdk/README.md — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/sdk/README.md
- sdk/metadata.scale — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/sdk/metadata.scale
- console-ui/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/console-ui
- examples/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/examples
- examples/README.md — https://github.com/paritytech/polkadot-bulletin-chain/blob/main/examples/README.md
- chainspecs/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/chainspecs
- zombienet/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/zombienet
- zombienet-sdk-tests/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/zombienet-sdk-tests
- stress-test/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/stress-test
- templates/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/templates
- utils/ — https://github.com/paritytech/polkadot-bulletin-chain/tree/main/utils

### npm packages
- @parity/bulletin-sdk — https://www.npmjs.com/package/@parity/bulletin-sdk (0.4.0)
- @parity/product-sdk — https://www.npmjs.com/package/@parity/product-sdk (0.21.0)
- @parity/product-sdk-cloud-storage — https://www.npmjs.com/package/@parity/product-sdk-cloud-storage (0.10.0)
- @parity/product-sdk-host — https://www.npmjs.com/package/@parity/product-sdk-host (0.15.1)
- @parity/product-sdk-statement-store — https://www.npmjs.com/package/@parity/product-sdk-statement-store (0.6.4)
- polkadot-api (PAPI) — https://www.npmjs.com/package/polkadot-api
- @polkadot-labs/hdkd — https://www.npmjs.com/package/@polkadot-labs/hdkd
- @polkadot-labs/hdkd-helpers — https://www.npmjs.com/package/@polkadot-labs/hdkd-helpers
- multiformats — https://www.npmjs.com/package/multiformats
- Parity npm org — https://www.npmjs.com/org/parity
- Product SDK API reference — https://paritytech.github.io/product-sdk/

### Tooling
- just — https://github.com/casey/just
- Chopsticks — https://github.com/AcalaNetwork/chopsticks
- Zombienet — https://github.com/paritytech/zombienet
- Helia (IPFS in JS) — https://helia.io/
- Kubo (IPFS CLI) — https://docs.ipfs.tech/install/command-line/
- Smoldot — https://github.com/smol-dot/smoldot
- litep2p — https://github.com/paritytech/litep2p
- polkadot-sdk — https://github.com/paritytech/polkadot-sdk
- Polkadot.js Apps — https://polkadot.js.org/apps/
- Polkadot.js docs — https://polkadot.js.org/docs/

### Protocol background
- substrate PR #7963, storage chains over IPFS/bitswap — https://github.com/paritytech/substrate/pull/7963
- litep2p PR #482 — https://github.com/paritytech/litep2p/pull/482

### Forum
- InsufficientAuthorizerBudget on Products DevNet — https://forum.polkadot.network/t/insufficientauthorizerbudget-failures-on-polkadot-products-devnet-bulletin-chain-authorisation/18307
- Intended data/storage consumption design for a social Polkadot Product — https://forum.polkadot.network/t/whats-the-intended-data-storage-consumption-design-for-a-social-polkadot-product/18278
- Socials digest 2026-07-15 (SoverStore demo) — https://forum.polkadot.network/t/polkadot-socials-daily-digest-2026-07-15/18144
- Socials digest 2026-07-30 (Levity) — https://forum.polkadot.network/t/polkadot-socials-daily-digest-2026-07-30/18285
- Socials digest 2026-08-01 (on-chain NES games) — https://forum.polkadot.network/t/polkadot-socials-daily-digest-2026-08-01/18299
- Socials digest 2026-08-06 — https://forum.polkadot.network/t/polkadot-socials-daily-digest-2026-08-06/18346
- Forum root — https://forum.polkadot.network/

### Context and background
- Polkadot Roundup 2025 (Parity) — https://www.parity.io/blog/polkadot-roundup-2025
- Polkadot Roundup 2025 (Medium) — https://medium.com/polkadot-network/polkadot-roundup-2025-3c3c71c7e9c4
- Parity blog — https://www.parity.io/blog
- JAM Chain wiki — https://wiki.polkadot.com/learn/learn-jam-chain/
- JAM explainer (BlockEden) — https://blockeden.xyz/blog/2025/10/28/jam-chain-polkadot-s-paradigm-shift-toward-the-decentralized-global-computer/
- Proof of Personhood / Individuality layer — https://medium.com/@polk_gov/proof-of-personhood-the-individuality-layer-of-polkadot-74aba1c53c66
- Polkadot Cloud DA Service (**different product**) — https://polkadot.cloud/service/data-availability
- Polkadot Cloud DA blog post — https://polkadot.cloud/blog/polkadot-cloud-s-data-availability-service-powering-web3-s-resilient-infrastructure
- Polkadot Ecosystem concepts — https://polkadotecosystem.com/resources/concepts/
