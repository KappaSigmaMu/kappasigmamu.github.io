# Moving Proof-of-Ink to Paseo

**Date:** 2026-08-16
**Status:** planned, not executed
**Prerequisite:** the local POC, verified end to end — see [`poi-bulletin-poc-local.md`](./poi-bulletin-poc-local.md).

Paseo is the first network where the chain is not ours. That changes exactly one thing
in the architecture, and it is worth stating before the checklist because everything
else follows from it.

---

## The one architectural change: we cannot authorize ourselves

Locally, `setup-local-chain.mjs` does three things — `add_authorizer(ops)` via Alice's
sudo, fund ops, then `ops -> authorize_account(ops)`. **Step 1 and step 3 do not exist
on Paseo.**

`add_authorizer` needs Root. `authorize_account` needs the `T::Authorizer` origin. On a
`--dev` chain we hold both because `//Alice` has sudo. On Paseo we hold neither.

| Network | How ops gets authorized |
|---|---|
| Local `--dev` | `sudo(//Alice) -> add_authorizer`, then self-`authorize_account` |
| **Paseo** | **Console UI faucet, by hand, out of band** |
| Mainnet | OpenGov referendum |

Paseo grant path: [Console](https://paritytech.github.io/polkadot-bulletin-chain/) →
**Faucet** → **Storage Faucet** → *Authorize Account* → enter transactions + bytes →
confirm in wallet → verify on the **Accounts** tab.

Three consequences:

1. **The ops account must exist before the backend is deployed**, because a human has
   to paste its address into the faucet UI and sign the grant with a wallet.
2. **The keeper's `refresh_account_authorization` cannot work on Paseo.** Confirmed:
   after the grant, `allowedAuthorizers(ops)` is `null` — the faucet hands out an
   authorization without making the recipient an authorizer, and that call needs the
   authorizer origin. The keeper already treats a failed refresh as a loud log line
   rather than a crash, and that log is the operational signal to go re-authorize by
   hand.
3. **Re-authorization is a recurring manual task**, on the real expiry (~56 days as
   granted, not the documented 14) until mainnet governance replaces it. This is the
   single largest operational difference from local.

`scripts/status.mjs` exists for exactly this: it is the only way to answer "is ops
actually authorized on this network?", and it should be the first thing run after
pointing at a new endpoint.

---

## What we need, in order

### 1. An ops account

**Done, 2026-08-16.** Generated with `scripts/generate-ops-key.mjs`:

```
5Ew7wBkN61hvKuLrHCLvtLqLahFt6KgLmk2RxTjUhT1NkaML
```

Mnemonic in `services/poi-backend/secrets/ops_seed` and `.env` (both mode 600,
gitignored). No backup exists elsewhere.

### 1b. Funding — OPEN, and the current blocker

The account holds **zero balance**. `authorize_preimage` carries no `feeless_if` and is
charged on **every upload**, forever. Verified on the local chain: it failed with
`1010: Inability to pay some fees` until ops was funded.

On Paseo Bulletin the quoted fees are:

| Call | partialFee |
|---|---|
| `authorize_preimage` | 21 894 727 |
| `store` | 107 482 727 |
| existential deposit | 1 000 000 000 |

`store` is submitted unsigned by the browser and is feeless in practice, so the fee that
matters is `authorize_preimage` — about 0.022 of a whole unit per upload, plus the
existential deposit to keep the account alive.

**Resolved at the source, 2026-08-16.** The official docs say Bulletin "does not use
token balances for transaction fees" and has "no native token balances". That is true of
the calls a *user* makes and false of the one *we* make. From the pallet:

| Call | `feeless_if` | Condition |
|---|---|---|
| `store` | yes | `\|_, _\| true` — unconditionally free |
| `authorize_account` | yes | origin is a `feeless` authorizer with active budget |
| `refresh_account_authorization` | yes | same |
| **`authorize_preimage`** | **none** | **charged, always** |

So the chain is feeless for storing, and charged for granting per-preimage
authorization. Our design puts ops on the charged side of that line once per upload.

Corroborating evidence on Paseo: 22 accounts out of 28 010 hold any balance at all, and
`ChargeTransactionPayment` is in the signed extensions with a `TransactionFeePaid`
event. The chain is not `NoCurrency`; the token is PAS with 10 decimals.

**The storage faucet grants authorization, not balance** — the two are separate and we
have only the first. Funding routes to try, in order:

1. **The standard Paseo faucet** (<https://faucet.polkadot.io/>, 5000 PAS per 24 h) if
   it can target Bulletin directly.
2. **Teleport from the Paseo relay or Asset Hub**, if a channel to Bulletin exists.
3. Ask in the Bulletin/Paseo channels — this is exactly the sort of gap the
   `InsufficientAuthorizerBudget` forum thread suggests others hit too.

### The funding blocker is avoidable — account authorization is enough

Confirmed in the pallet's `check_signed`. `store` resolves authorization in this order:

1. **Preimage** authorization, if one exists for the content hash. Preferred because it
   lets anyone store pre-authorized content *without consuming their own account quota*.
2. **Account** authorization as fallback —
   `check_authorization(&AuthorizationScope::Account(who), size, consume)`.

Both are valid paths, and a **signed** `store` by an authorized account is explicitly
permitted. Our faucet grant is precisely an account authorization (20 000 transactions,
19.5 GiB), so **the ops account can store today, with zero balance and no
`authorize_preimage` at all.**

That reshapes the design's cost model:

| Path | Who signs `store` | Fee | Quota consumed |
|---|---|---|---|
| Current design: per-preimage | browser, **unsigned** | none | preimage authorization |
| Account fallback | **ops**, signed | none (`store` is unconditionally feeless) | ops account quota |

The tradeoff is real and not purely a win:

- The current design's whole point is that the browser submits unsigned, so **image
  bytes never pass through our infrastructure**. Routing `store` through ops means the
  backend handles the bytes, which is a meaningful change to the trust and bandwidth
  story — see the design doc before adopting it.
- Account-quota consumption is bounded by the grant (20 000 uploads), where the
  per-preimage path consumed authorizer budget instead.

So there are two ways forward and they should be chosen deliberately, not by default:

- **A — keep the unsigned browser store**, fund ops so `authorize_preimage` works. Needs
  a PAS funding route (below). Preserves the bytes-never-touch-us property.
- **B — sign `store` from the backend** against the account authorization. Works right
  now, no funding, no faucet dependency. Costs the unsigned-upload property.

**A remains the intended design.** B is the escape hatch if funding proves unavailable,
and is worth wiring as a fallback regardless since it needs no external grant.

### Funding path A: teleport PAS from Asset Hub

**Route confirmed at the source.** Bulletin's `runtimes/bulletin-paseo/src/xcm_config.rs`
declares:

```rust
pub type TrustedTeleporters = ConcreteAssetFromSystem<TokenRelayLocation>;
// "Trust the relay chain and other system parachains to teleport the relay chain
//  native token."
type IsTeleporter = TrustedTeleporters;
```

Asset Hub is a system parachain and PAS is the relay's native token, so a teleport from
Asset Hub is permitted. Asset Hub's *own* assets are not — only PAS itself.

Facts needed to build the call, read live:

| | |
|---|---|
| Bulletin para id | **1501** |
| XCM pallet on Bulletin | `polkadotXcm`, present |
| Token / decimals | PAS / 10 |
| Existential deposit | 1 000 000 000 (0.1 PAS) |

The faucet is <https://faucet.polkadot.io/> (5000 PAS per 24 h) and it funds Asset Hub,
not Bulletin — hence the teleport hop.

**Done, 2026-08-16.** 4000 PAS teleported from Paseo Asset Hub to Bulletin para 1501,
block `0xd1c9ca23d5a65f55887727c24f429444401a192366d091adfab6412d5ebd0fc2`
(`PolkadotXcm.Attempted`, `FeesPaid`, `XcmpQueue.XcmpMessageSent`, `Sent`). Arrival
confirmed on Bulletin: ops free balance `39999928140000`. Fee: 0.0072 PAS. ~1000 PAS
remains on Asset Hub as reserve.

Run it with `scripts/poi-bulletin/teleport-papi.mjs` from the repo root:

```bash
OPS_SEED="$(cat services/poi-backend/secrets/ops_seed)" \
  yarn node scripts/poi-bulletin/teleport-papi.mjs 4000 --dry   # inspect the call
```

Drop `--dry` to submit. It sends less than the full balance so the Asset Hub account
stays above its existential deposit and can pay the XCM fee. XCM delivery is
asynchronous — confirm arrival with `yarn status` against Bulletin rather than assuming
the extrinsic's success means the funds landed.

Three things this run established:

- **Bulletin's para id is 1501.** Endpoint configs in the wild list 5118 and 1010; the
  chain itself reports 1501. Read it from `parachainInfo.parachainId` rather than
  trusting a config file.
- **The working Asset Hub endpoint is `wss://asset-hub-paseo-rpc.n.dwellir.com`.** The
  `pas-rpc.stakeworld.io` paths all alias to the *relay*, not Asset Hub — verify by para
  id, not by the hostname.
- **polkadot-js cannot sign on Paseo Asset Hub at all.** See the stack note below.

At ~0.0022 PAS per `authorize_preimage`, a single 5000 PAS grant covers on the order of
two million uploads. This is a one-time errand, not a running cost.

### Why the tooling is PAPI, not polkadot-js

Paseo Asset Hub's runtime declares custom transaction extensions
(`AuthorizeValueTransfer`, `AsPgas`, `AsRingAlias`, `AsDotnsGateway`, `EthSetOrigin`)
that `@polkadot/api` has no encoder for. Every signed extrinsic traps in
`validate_transaction` — including a bare `system.remark`, which is how this was
isolated:

```
wasm trap: wasm `unreachable` instruction executed
... TaggedTransactionQueue_validate_transaction
```

PAPI reads the extension list from metadata and signs correctly. The backend was moved
to PAPI wholesale for the same reason: Kusama Asset Hub is likely to adopt these
extensions, and on polkadot-js this service would have broken there silently, in the
signing path, in production.

The teleport script is the one hybrid left — polkadot-js builds the XCM call (its
*encoding* is fine; only signing is broken) because PAPI's typed descriptor rejects the
argument, the whitelist having narrowed `XcmVersionedLocation` to an opaque alias. PAPI
signs and submits the raw call bytes.

### 2. The authorization grant

**Done, 2026-08-16.** Granted via the Console faucet to
`5Ew7wBkN61hvKuLrHCLvtLqLahFt6KgLmk2RxTjUhT1NkaML`, included in block #1460250 and
confirmed on chain:

```
authorization : expires at block 1661850 (~56 days)
  transactions: 0 / 20000 used
  bytes       : 0 / 20971520000 used   (19.5 GiB)
```

Two things this run established that the plan had wrong:

- **The window is ~56 days here, not 14.** `AuthorizationPeriod` was documented as 14
  days for Westend/Paseo; the actual grant runs 201 600 blocks. The keeper's expiry
  logic is unaffected — it reads the real expiration off chain — but the manual
  re-authorization cadence is quarterly, not fortnightly.
- **The faucet grants an authorization without registering an authorizer.**
  `allowedAuthorizers(ops)` is still `null`. So the ops account can store and renew,
  but **cannot** call `refresh_account_authorization` on itself — confirming the
  suspicion in the keeper section below. Re-authorization at expiry is a manual faucet
  visit, full stop.

Choose `transactions` and `bytes` deliberately:

- Peak renewed-bytes footprint is **`(K + 1) × bytes_allowance`**, where
  `K = RetentionPeriod / AuthorizationPeriod`. Paseo has `K = 1`, so budget
  **2 × `bytes_allowance`** for window overlap, not `bytes_allowance`.
- `transactions` is consumed one per `authorize_preimage`, so it is one per upload.

Then confirm with `node scripts/status.mjs` before deploying anything.

### 3. Endpoint decision

**Resolved by probing, 2026-08-16.** Two are documented upstream; only one answers:

| Endpoint | Appears in | Probe result |
|---|---|---|
| `wss://paseo-bulletin-rpc.polkadot.io` | docs, tutorial | **no response** |
| `wss://paseo-bulletin-next-rpc.polkadot.io` | `sdk/README.md` Rust example | **live** — `system_chain` → `"Paseo Bulletin Next"` |

Use `wss://paseo-bulletin-next-rpc.polkadot.io`. The endpoint named in the official docs
is the dead one, so anyone following the tutorial hits a silent hang rather than an
error. The IPFS gateway is `https://paseo-bulletin-next-ipfs.polkadot.io/ipfs/<CID>`.

Note `dryRun` is refused on the public node (`-32601: RPC call is unsafe to be called
externally`), so extrinsics cannot be simulated before submitting — the first real
upload is the first genuine test.

### 4. Regenerate the PAPI descriptor

**Done, 2026-08-16.** `.papi/polkadot-api.json` now pins Paseo, genesis
`0x8cfe6717dc4becfda2e13c488a1e2061ff2dfee96e7d031157f72d36716c0a22`. It previously
pinned the local dev chain, whose genesis and metadata are wrong for Paseo.

```bash
yarn papi add bulletin -w wss://paseo-bulletin-next-rpc.polkadot.io
yarn papi generate
```

Note the endpoint: the documented `paseo-bulletin-rpc.polkadot.io` is **dead**;
`paseo-bulletin-next-rpc.polkadot.io` is live.

`.papi/whitelist.ts` must keep its `bulletin` entry, and that entry now has to cover
the backend's calls too, not just the browser's `store` — `authorize_preimage`,
`enable_auto_renew`, `refresh_account_authorization`, `Authorizations`,
`AllowedAuthorizers`, `System.Account`, `System.Number`.

A missing entry is **not** a build error. It surfaces at runtime as:

```
Incompatible runtime entry Storage(System.Account)
```

**`papi generate` with no configured chains deletes `.papi/` entirely** — config,
whitelist and committed metadata included. Recover with `git checkout -- .papi/` and
re-add the chains. With chains configured it is safe and needs no network, reading the
committed `.scale` files.

Also note: on a cold install the `postinstall` codegen runs before the portal link
resolves and leaves the descriptors empty. A second `yarn papi generate` fixes it. **This
will bite CI** and is not yet handled.

### 5. Asset Hub stays on Kusama

Society membership is real regardless of which Bulletin network stores the images. Point
`ASSET_HUB_WS` at `wss://kusama-asset-hub-rpc.polkadot.io`, not a testnet.

This means **a Paseo deployment gates against live Kusama Society membership**. Good for
fidelity; it also means test uploads need a real member or candidate key.

### 6. Deploy

```bash
cp env.example .env       # endpoints from step 3, ALLOWED_ORIGINS for the real site
docker compose up -d
docker compose exec poi-backend node scripts/status.mjs
```

Set `ALLOWED_ORIGINS` to the deployed frontend origin. Point the frontend at the backend
with `REACT_APP_POI_BACKEND_URL`, and the gateway with `REACT_APP_IPFS_GATEWAY`.

Put TLS in front. The service speaks plain HTTP and has no rate limiting.

---

## New failure modes Paseo introduces

The local chain cannot produce any of these, so none are exercised yet.

| Error | Meaning | Handling |
|---|---|---|
| `InsufficientAuthorizerBudget` | The **faucet itself** is out of budget. [Reported live](https://forum.polkadot.network/t/insufficientauthorizerbudget-failures-on-polkadot-products-devnet-bulletin-chain-authorisation/18307) on Products DevNet. | Needs its own error state in the UI — not a generic extrinsic failure. Nothing the user did is wrong and retrying will not help. |
| `PermanentAllowanceExceeded` | Our per-account renewal quota is blown. | Capacity alarm. Request a larger grant. |
| `ChainPermanentCapReached` | Chain-wide cap hit. Not our fault. | Retry later; surface as transient. |
| `PermanentStorageNearCap` | Event at 80% of the chain-wide cap. | Watch it. |
| Authorization expired | Uploads fail, renewals stop, data deleted at retention end. | The keeper warns; re-authorize by hand. |

**None of these are wired into the frontend yet.** The upload path currently surfaces
whatever the backend returns as a generic error string.

---

## Known gaps, carried from the POC

Unchanged by this move and still open:

- **Reconciliation.** If the browser dies between `store` and `/finalize`, the image is
  on chain with no auto-renewal and silently disappears ~14 days later. Nothing detects
  this. Needs a sweep comparing stored content hashes against renewal state.
- **SubmitPage / GalleryPage UI** is not ported to the new stack.
- **Bulletin is upstream-flagged experimental and unaudited**, "not recommended for
  production without independent review". Fine for Paseo. It is a real decision to make
  before mainnet, and it is not a code decision.
- **No `runtimes/bulletin-polkadot`** exists upstream, so there is no mainnet target to
  commit to yet regardless.

---

## Rough sequence

1. ~~Generate the ops account, record its address.~~ **Done** — `5Ew7wBkN61hv…`
2. ~~Fund it on Bulletin Paseo.~~ **Done** — 5000 PAS from the faucet to Asset Hub, then
   4000 teleported to para 1501. Ops free balance `39999928140000`.
3. ~~Grant its authorization through the Console faucet.~~ **Done** — block #1460250,
   20 000 transactions / 19.5 GiB, expires block 1 661 850
4. ~~Dial both RPC endpoints, pick the one that answers.~~ **Done** —
   `wss://paseo-bulletin-next-rpc.polkadot.io`; the docs' endpoint is dead
5. ~~`yarn status` against that endpoint — must print `ready`.~~ **Done** — prints
   `ready`; balance funded, 0 / 20 000 transactions used.
6. ~~Regenerate the PAPI descriptor for Paseo.~~ **Done** — genesis `0x8cfe6717…`;
   `TransactionStorage` and `DataRenewal` confirmed present.
7. ~~Move the backend to PAPI.~~ **Done** — no `@polkadot/*` package remains. Gate
   refusals, `/health`, keeper and container verified against live Paseo + Kusama.
8. Deploy the backend with the real `.env`; confirm `/health` from the deployed host.
9. Point the frontend at it; run one upload with a real Society key.
10. Confirm the CID reads back through `https://paseo-bulletin-next-ipfs.polkadot.io/ipfs/<CID>`.
11. Check `yarn status` again — transactions and bytes should have decremented by one upload.
12. Note the authorization expiry block and calendar the manual re-authorization.
