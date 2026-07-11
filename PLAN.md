# Migrate @polkadot/api (pjs) → polkadot-api (PAPI) + chain-layer refactor

## Context

pjs (`@polkadot/api`) is in maintenance mode and widely considered deprecated; PAPI (`polkadot-api`, now v2) is the actively maintained successor with light-client-first design, compile-time typed descriptors, and native `bigint`. This app (Kappa Sigma Mu society UI, ~8.5k LOC React 19 + ejected CRA webpack) uses pjs across ~25 files: two chain connections (Kusama Asset Hub for the Society pallet, People chain for identity), 16 storage queries, 10 constants, 9 extrinsics, and 5 `api.derive.*` calls that have **no PAPI equivalent** and must be reimplemented.

We take this opportunity to fix structural weaknesses: duplicated `KusamaContext`/`PeopleContext`, chain calls scattered inside components with `api` prop-drilling and `api!` assertions, hand-rolled `useEffect` fetchers with **no error handling** (spinner hangs forever on failure), `@ts-nocheck` hooks, and ~35 `any`s.

**Decisions**: PAPI-native hooks (no react-query); no Vite migration (webpack stays; separate follow-up). Strategy: **incremental side-by-side migration**, per-domain slices, each phase gated by the existing Chopsticks-backed Cypress e2e suite (11 specs).

## Verified environment facts

- PAPI v2 is ESM-only; webpack 5 consumes it natively (no top-level await, no WASM with WS provider). Jest needs `transformIgnorePatterns` for `polkadot-api|@polkadot-api|scale-ts`.
- TS 6.0 strict / Node 24 / yarn 4 all meet PAPI requirements.
- `@polkadot-api/known-chains` includes both `kusama_asset_hub` and `kusama_people` — codegen without RPC.
- v2 specifics: `getWsProvider` from `polkadot-api/ws` (accepts endpoint array with failover + `onStatusChanged` + `.switch(uri)`); `withPolkadotSdkCompat` removed (auto-negotiates legacy vs chainHead); `watchValue()` emits `{value, block}`.
- Signer adapter: `getPolkadotSignerFromPjs(address, signPayload, signRaw)` from `polkadot-api/pjs-signer` — matches what `@talismn/connect-wallets` `wallet.signer` provides. Caveat: builds v4 extrinsics only, throws on unmapped signed extensions.
- Chopsticks 1.4.2 supports `chainHead_v1` (implemented 2024 + PAPI-maintainer fixes through Oct 2025) — PAPI+chopsticks is a known-working combo.
- Identity derive replacement: `@polkadot-api/sdk-accounts` `getIdentity/getIdentities` on the People typedApi.
- Repo hygiene: `db.sqlite`/`build/`/`coverage/` are gitignored (not committed) — only real defect is `package.json` `"types": "src/types.d.ts"` pointing at a missing file. Several `@polkadot/*` deps are declared but never imported (`extension-dapp`, `extension-inject`, `networks`, `rpc-core`, `types-support`, `ui-keyring`, `ui-settings`).

## Target architecture — new `src/chain/` layer

Components never import `polkadot-api` or descriptors directly; they consume hooks/functions from `src/chain/*`. Kills `api` prop-drilling and `api!` assertions.

```
src/chain/
  client.ts            // createClient ×2 (assetHub, people) + getTypedApi
  endpoints.ts         // merges helpers/providers.ts + peopleProviders.ts (?rpc=/?peopleRpc=/env resolution)
  ChainProvider.tsx    // ONE generic connection-state provider, instantiated twice (replaces KusamaContext + PeopleContext)
  hooks.ts             // useChainQuery(fn, deps) / useChainSub(obs, deps) → {data, error, isLoading, refetch}
  types.ts             // domain types (SocietyCandidate, SocietyMember…) on bigint/SS58String (replaces src/types/global.d.ts)
  ss58.ts              // normalizeAddress, isSameAddress (publicKey compare), account-index encoding
  format.ts            // formatBalance replacement (bigint planck → "1.23 KSM" via Intl.NumberFormat), extractTime port
  society/
    queries.ts         // typed query functions (bids, pot$, members, candidates, votes, payouts, parameters…)
    derived.ts         // getSocietyInfo(), getSocietyMembers() — reimplemented derives (replaces rxjs deriveMembersInfo)
    consts.ts          // useSocietyConsts (replaces @ts-nocheck useConsts.ts)
    tx.ts              // submitTx(tx, signer, texts, onStatusChange) — replaces helpers/extrinsics.ts doTx
  people/identity.ts   // @polkadot-api/sdk-accounts getIdentity + buildAccountIdentity adaptation
  indices.ts           // idToIndex via Indices.Accounts.getEntries() with module cache
```

`useChainQuery`/`useChainSub` add real error/retry states — fixes the silent-spinner bug across MembersPage, PayoutsPage, CandidatesPage, SuspendedPage, ExplorePage.

## pjs → PAPI mapping (core patterns)

| pjs | PAPI v2 |
|---|---|
| `api.query.society.bids()` | `api.query.Society.Bids.getValue()` → plain JS objects, `bigint` values |
| `society.pot(cb)` subscription | `Society.Pot.watchValue('best')` → Observable `{value, block}` |
| `.keys()` + `.multi()` fan-out | `.getEntries()` (one call: keys + values) |
| `votes.multi([[cand, member]…])` tuple keys | `Society.Votes.getValues(pairs)` |
| keyed one-shot + `.isSome/.unwrap()` | `.getValue(addr)` → `T \| undefined`, check `!= null` |
| `api.rpc.chain.subscribeNewHeads` | `client.bestBlocks$` / `finalizedBlock$` |
| `api.consts.society.*` | `api.constants.Society.*()` (Promise; batch in `society/consts.ts`) |
| `tx.signAndSend(addr, {signer}, cb)` + `isInBlock/isFinalized` | `api.tx.Society.Bid({value}).signSubmitAndWatch(signer)` → `signed → broadcasted → txBestBlocksState (≈isInBlock) → finalized` |
| `registry.findMetaError(error.asModule)` | not needed — events carry typed decoded `dispatchError` (`{type:'Society', value:{type:'AlreadyBid'}}`) |
| positional tx args (`vouch(who, value, tip)`) | named args + `MultiAddress.Id(addr)` from descriptors |
| `createType('AccountId')` | plain `SS58String`; `getSs58AddressInfo` + `AccountId(2)` codec from `polkadot-api` |
| `BN` / bn.js / `.toBn()/.toNumber()` | native `bigint` end-to-end |
| `formatBalance`, `extractTime`, `u8aToHex/hexToU8a` | local `chain/format.ts`; `toHex/fromHex` from `polkadot-api/utils` |
| `@polkadot/api-augment` side-effect imports (src/index.tsx) | delete; descriptors provide types |

### Derive reimplementations (no PAPI equivalent)

1. `derive.society.info()` (RoundPayout, MembersPage, PayoutsPage) → `getSocietyInfo()`: `Promise.all` over Founder/Head/Skeptic/Defending/Pot/Parameters. Also collapses the duplicated info-fetch block in MembersPage/PayoutsPage.
2. `derive.society.members()` + hand-rolled `deriveMembersInfo` (src/pages/explore/helpers.tsx) → single `getSocietyMembers()`: `Members.getEntries()` + `getValues` for Payouts/SuspendedMembers/DefenderVotes. Drops rxjs from app code.
3. `derive.accounts.identity` → `@polkadot-api/sdk-accounts` `getIdentity(address)` on People typedApi; adapt `buildAccountIdentity.ts`. Must degrade gracefully when People chain absent (e2e has no People fork — same as today).
4. `derive.accounts.idToIndex` (AccountIndex.tsx) → `Indices.Accounts.getEntries()` → `Map<SS58String, number>`, module cache. Port pjs's ss58-index string encoding (~20 lines) to preserve display (e.g. "F7Hs").
5. `derive.accounts.info` (fetchMemberDetails.ts) → compose 3 + 4.

### Signer interop (highest-risk area)

Keep `@talismn/connect-wallets` for discovery/UI (reads `window.injectedWeb3`; NovaWallet subclass unaffected). In `src/account/AccountContext.tsx`, after `wallet.enable()`:

```ts
const polkadotSigner = getPolkadotSignerFromPjs(account.address, signer.signPayload, signer.signRaw)
```

Store alongside the account (recreated on refresh, as today). Fallback if adapter fails: `connectInjectedExtension` from `polkadot-api/pjs-signer` (accounts expose `.polkadotSigner` natively), keeping talisman-connect only for UI.

## Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| pjs-signer adapter fails with cypress mock wallet or an Asset Hub signed extension (CheckMetadataHash, ChargeAssetTxPayment) lacks a mapper | Blocks all tx e2e | **Phase 0 spike** signs a real `Society.bid` against chopsticks in Cypress before committing; fallback `connectInjectedExtension` |
| Chopsticks 1.4.2 chainHead edge cases under real load | e2e flakiness | Spike runs smoke suite on a PAPI build; bump chopsticks if flaky |
| Ejected-CRA webpack or yarn 4 issue with ESM-only PAPI / `file:.papi/descriptors` | Build blocked | Spike does `yarn build` with a descriptor import |
| `?rpc=` override to an incompatible chain | Runtime errors | PAPI checks compatibility per call; surface via hook error state (today it fails silently) |
| Bundle doubles while both libs coexist | Temporary | `.papi/whitelist.ts` caps descriptor size; Phase 5 removes all `@polkadot/*` (net win) |
| Behavioral drift in reimplemented derives | Wrong UI data | e2e suites assert seeded chopsticks society state; add unit tests for `derived.ts` |
| `@polkadot/react-identicon` keeps util-crypto alive | Minor bundle | Phase 5: swap to `@w3ux/react-polkicon` (or consciously keep — isolated, no api/types deps) |
| `Indices.Accounts.getEntries()` large on post-AHM Asset Hub | Slow first load | One-time cached fetch; measure in spike |
| Jest breaks on ESM PAPI imports | Unit tests | `transformIgnorePatterns` fix in Phase 1 |

**Delete list**: `api.derive.*`, `api.registry`/`createType`, api-augment imports, rxjs in explore/helpers, bn.js, and deps `@polkadot/api*`, `types*`, `util*`, `keyring`, `networks`, `rpc-core`, `extension-*`, `ui-*`, `types-codec` resolution.

## Phases (each ends green: `yarn lint && yarn test && yarn build` + relevant e2e)

### Phase 0 — Spike (throwaway branch) — GATE

`papi add ksmAssetHub -n kusama_asset_hub` + `ksmPeople -n kusama_people`; `yarn build` with a descriptor import; `Society.Pot.getValue()` + `Members.getEntries()` against chopsticks; sign `Society.bid` in Cypress via `getPolkadotSignerFromPjs` + @chainsafe mock wallet; measure `Indices.Accounts.getEntries()`. **Do not proceed until all pass.**

### Phase 1 — Infra + hygiene (no behavior change)

- Add `polkadot-api`, `@polkadot-api/sdk-accounts`; commit `.papi/`; `"postinstall": "papi"`; `.papi/whitelist.ts` (Society query/tx/const, ParachainSystem.LastRelayChainBlockNumber, Indices.Accounts, Timestamp.MinimumPeriod; People: Identity).
- Scaffold `src/chain/`: `endpoints.ts`, `client.ts`, generic `ChainProvider.tsx` (×2 instances — dedupes the twin contexts; pjs contexts stay mounted for now), `hooks.ts` with error states.
- Jest `transformIgnorePatterns`; remove dead `"types"` field from package.json; prune the 7 unused `@polkadot/*` deps.

### Phase 2 — Read-only queries, simple slices first

Order: `useConsts`/`useBlockTime` (kill both `@ts-nocheck`) → `useRelayChainBlockNumber` → `AccountContext` level detection → BiddersPage → CandidatesPage (list, offcanvas, votes) → rotation-bar (CurrentRound, Bid, Strikes partial) → LandingPage/GilbertoGil/Gallery/ExplorePage stats. Per slice: logic into `chain/society/queries.ts`, consume via hooks, convert that slice's types BN/codec → bigint/SS58String, remove its `api` prop. Verify with matching e2e suite + manual `yarn start` against live chain.

### Phase 3 — Derives + heavy pages

Implement `society/derived.ts`, `people/identity.ts`, `indices.ts`. Migrate MembersPage (incl. fetchMemberDetails, dedupe with PayoutsPage), PayoutsPage, Strikes, RoundPayout, AccountIndex, useAccountIdentity. Delete `deriveMembersInfo` + rxjs usage. Verify: members/payouts/suspended/smoke e2e + manual People-chain identity check with `?peopleRpc=`.

### Phase 4 — Transactions + signer

Signer adapter in AccountContext; `chain/society/tx.ts` `submitTx()` mapping `signSubmitAndWatch` events → existing toast statuses (keep message shapes compatible with e2e regexes in `verifyTxError`). Migrate all 9 extrinsics; collapse bid/vouch/unbid/unvouch wrappers in `BiddersPage/helper.ts` (fix arg-order inconsistency) into data `{tx, finalizedText}`. Delete `helpers/extrinsics.ts`. Verify: wallet/bidding/candidate-voting/payouts/membership-claim/error-handling/user-journeys e2e + one manual real-wallet tx.

### Phase 5 — Remove pjs + final cleanup

Delete KusamaContext/PeopleContext + all `@polkadot/*` deps + api-augment imports in `src/index.tsx`; rewrite `FormatBalance` internals + remaining address utils; `types/global.d.ts` → `chain/types.ts`; identicon swap/keep decision; sweep remaining `any`s in migrated files; measure bundle before/after. Verify: full e2e matrix + manual live-chain regression of every page + deploy preview.

### Phase 6 (optional follow-ups, out of scope)

Endpoint-switch UI via `provider.switch()`; smoldot light client; react-query if data needs grow; Vite migration (separate project).

## Critical files

- `src/kusama/KusamaContext.tsx` + `src/people/PeopleContext.tsx` → replaced by `src/chain/client.ts` + `ChainProvider.tsx`
- `src/helpers/extrinsics.ts` → `src/chain/society/tx.ts` (signer interop, highest risk)
- `src/pages/explore/helpers.tsx` → `src/chain/society/derived.ts` (derive hotspot)
- `src/account/AccountContext.tsx` → signer adapter + level-detection query migration
- `src/hooks/useConsts.ts`, `useBlockTime.ts`, `useRelayChainBlockNumber.ts` → `src/chain/society/consts.ts` + hooks
- `src/types/global.d.ts` → `src/chain/types.ts`
- `package.json` → deps, postinstall, jest transform, remove dead `"types"` field
- All `src/pages/explore/*/index.tsx` + button components → consume `src/chain/` hooks

## Verification

- Per slice: `yarn chopsticks` + `start:test:ready` + `yarn test:e2e:<suite>` (seeded society state asserts real rendering).
- Per phase: full `test:e2e:all`, `yarn lint`, `yarn test`, `yarn build`, manual `yarn start` against production endpoints (multi-endpoint failover + People identity can't be tested on chopsticks — verify manually with `?rpc=`/`?peopleRpc=`).
- CI: existing 10 e2e workflows + test.yml run per PR; descriptors regenerate via postinstall, no workflow changes expected.
