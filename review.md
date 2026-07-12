# Session review — papi-migration debugging (2026-07-11)

## UPDATE (later session, 2026-07-11): remaining failures resolved — verified locally

- The Voted-badge fix is the `client.finalizedBlock$` → refetch subscription in
  `src/pages/explore/CandidatesPage/index.tsx` and `src/pages/explore/MembersPage/index.tsx`
  (uncommitted working-tree changes). It was written last session but never test-verified;
  runs without it (e.g. CI) still show the badge failures.
- Finality probe result: chopsticks delivers best + finalized to PAPI **simultaneously** once
  a block is built (no finality lag); `dev_newBlock` itself can take ~40s cold.
- Verified via `corepack yarn test:e2e:grep`:
  - "should show Voted badge after voting" (candidates) — ✓ passing (49s)
  - "should show Voted badge after voting on defender" (members) — ✓ passing (5s)
  - "should unbid as Bidder" (user-journeys, chainHead fork-reset crash) — ✓ passing (66s),
    no after-hook error; the bigint fix resolved it, no teardown change needed.
- Still NOT committed. Next step: user runs `test:e2e:all` / lets CI confirm.

## UPDATE 2 (same day): user-journeys full-spec failures fixed — 5/5 passing

Running the whole user-journeys spec (not just one test) exposed three more issues:

1. **PAPI chainHead crash ("reading 'number'")** on `dev_newBlock` after a `dev_setHead`
   fork rewind: chopsticks 1.4.2 emits chainHead follow events referencing block hashes the
   client never saw; `pinned-blocks.js` (`blocks.get(acc.best).number`) throws, killing every
   downstream observable — the app is genuinely broken after it, so Cypress suppression is not
   an option. polkadot-api's ws middleware (applied by default via `polkadot-api/ws`) doesn't
   cover it. **Fix: bumped chopsticks 1.4.2 → 1.5.0 in package.json** (released 2026-06-26);
   crash gone, block builds also much faster.
2. **Unhandled `InvalidTxError { Invalid: Stale }` rejection**: PAPI's broadcast revalidation
   can error *after* the tx is already in a block (chopsticks quirk); `void submitTx(...)`
   callers (BidVouch, BiddersList) made it an unhandled rejection → Cypress fails the test.
   **Fix in `src/chain/society/tx.ts`**: `submitTx` never rejects (logs instead) and ignores
   observable errors that arrive after the tx was included in a best block.
3. **`approveTxAndAdvance` in user-journeys.cy.ts asserted the wrong toast**: its regex
   (`/finalized|success|sent|submitted/i`) matched "Request **sent**. Waiting for response...",
   so it "passed" before the tx was in a block, then raced dev_newBlock. **Fix**: reset first,
   then assert on success-only toast texts (matches the other tx specs' pattern).
4. Also added `cy.unloadApp()` (support/commands.ts) called before `resetChopsticksToFork` in
   every spec's `after()` hook — disconnects the app before fork rewinds (belt-and-braces; the
   after-all "reading 'number'" failure disappeared with this + the chopsticks bump).

Verified: `test:e2e:grep "User Journeys"` → 5/5 passing (1m, no retries); jest 21/21; eslint +
tsc clean. NOT committed. Voted-badge grep runs passed before these changes; chopsticks bump +
submitTx change affect all specs, so full-suite confirmation (user-run) is the next step.

## Root causes found

1. **Account indices looked wrong ("wrong chain")** — actually a display-encoding bug in
   `src/chain/ss58.ts` `accountIndexToString`: it used PAPI's `fromBufferToBase58` (always a
   **2-byte** checksum, meant for 32-byte public keys) plus bogus `0xfc/0xfd/0xfe` prefix bytes.
   pjs encodes raw little-endian index bytes with a **1-byte** checksum. Chain/endpoints were fine.

2. **"Should not already be working." React crashes (members, payouts, flaky suites)** —
   React 19 dev-mode performance-track logging calls `JSON.stringify` on props diffs
   (`addValueToProperties` in react-dom). Props now contain **bigint arrays** (PAPI) →
   `TypeError: Do not know how to serialize a BigInt` thrown inside `commitPassiveMountOnFiber`
   → React's commit aborts → every later render throws "Should not already be working."
   The previous commit's Cypress `uncaught:exception` suppression only hid the first error;
   the app was already broken (that was the brittleness you felt).

3. **Payouts claim timeout** — the payouts spec was the only tx spec NOT calling
   `cy.task('resetChopsticks')` (= `dev_newBlock`) after approving. Chopsticks' Batch auto-build
   doesn't trigger for PAPI's `transaction_v1_broadcast` (it did for pjs `author_submitExtrinsic`),
   and chopsticks silently swallows invalid/pending txs, so the tx never entered a block.

4. **Old pjs behavior regression** — new `submitTx` only toasted success on `finalized`; pjs
   `doTx` also toasted "Transaction submitted." at in-block, which e2e regexes rely on.

## Changes made (all verified except where noted; NOT committed)

- `src/chain/ss58.ts` — rewrote `accountIndexToString` (1-byte checksum, LE bytes, no prefix
  bytes). Verified against pjs vectors (0→"fyF", 1→"g4b", 240→"5MbBF"…) in new unit test
  `src/chain/__tests__/ss58.test.ts`. All 5 jest suites / 21 tests pass. `tsc --noEmit` clean.
- `package.json` — added `@noble/hashes`, `@scure/base` (already in yarn.lock transitively).
- `jest.config.js` — added `@noble|@scure` to transformIgnorePatterns;
  `src/setupTests.ts` — TextEncoder/TextDecoder polyfill for jsdom.
- `src/bigintSerialization.ts` (imported first in `src/index.tsx`) — defines
  `BigInt.prototype.toJSON`, fixing #2 at the root (also fixes the mock-wallet BigInt error).
- `cypress/support/e2e.ts` — REMOVED the brittle BigInt `uncaught:exception` suppression
  (no longer needed).
- `src/chain/society/tx.ts` — restored "Transaction submitted." success toast on
  `txBestBlocksState found && ok`; tightened `settled` guard (an error at in-block can no longer
  be overwritten by a later success toast).
- `cypress/e2e/payouts.cy.ts` — added `cy.task('resetChopsticks')` after approve (matches all
  other tx specs). **Verified: payouts claim test now passes locally** (was the CI failure).
- `scripts/test-e2e.js` — fixed shell quoting so `yarn test:e2e:grep "<title>"` works (grep
  values with quotes broke the nested start-server-and-test layers).

## Verified locally via `corepack yarn test:e2e:grep`

- "should claim matured payout successfully" — ✅ passes (64s; finalized toast near the 30s edge).
- ss58 unit tests + full jest — ✅.
- "should show Voted badge after voting" (candidates) and "…on defender" (members) — ❌ still fail,
  but differently now: app is healthy, toast passes, **badge/tally never update within 20s**.

## Remaining work (next session)

1. **Voted-badge failures**: hypothesis — PAPI's tx `finalized` event lags ~25-30s on chopsticks
   (payouts took 64s total), and the votes/members refetch only fires on tx status events, so the
   last refetch happens before the vote is visible at the queried block. A probe script is ready at
   the scratchpad (`finality-probe.mjs`) to measure chopsticks best/finalized propagation to PAPI
   (start `corepack yarn chopsticks`, then `node finality-probe.mjs`). Likely fixes (pick after
   measuring): query at `at: 'best'` in `Society.Votes.getValues`/members refetch, or refetch on
   `client.finalizedBlock$` ticks, or extend the badge timeouts + add a `resetChopsticks` before
   the badge assertion (matches how other specs nudge the chain).
2. **User-journeys "Cannot read properties of undefined (reading 'number')"** (after-all hook):
   PAPI chainHead crashes when chopsticks is fork-reset (`resetChopsticksToFork`) while the app is
   still connected (`@polkadot-api/observable-client` pinned-blocks). Not re-tested after the
   bigint fix — re-run `corepack yarn test:e2e:grep "should unbid as Bidder"` first; it may need a
   spec-side teardown (navigate the app away before fork resets) rather than another error
   suppression. polkadot-api is already at latest (2.1.8).
3. Re-run the 3 members defender-voting tests (`test:e2e:grep "Defender Voting"`) — expected fixed
   by the bigint patch except the badge one (same issue as #1).
4. When all grep runs are green, ask the user before running `test:e2e:all`, then let CI confirm.
5. Do NOT commit — user will review first. `plan.md`/`next.md` in repo root are from earlier
   sessions; this file supersedes their "remaining work" sections for test fixing.
