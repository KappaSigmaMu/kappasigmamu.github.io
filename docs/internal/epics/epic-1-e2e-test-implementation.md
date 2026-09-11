# Epic 1: E2E Test Implementation

## Epic Overview

**Goal:** Implement comprehensive End-to-End testing for the KappaSigmaMu application to enable safe codebase refactoring.

**Reference:** [E2E Test Plan](./e2e-test-plan.md)

**Branch Pattern:** `feature/epic-1-e2e-test-implementation`

---

## IMPORTANT: Developer Instructions

### Before Every Commit

1. **Update Test Coverage Status:** Before committing, update the test status in [`docs/internal/e2e-test-coverage-overview.md`](./e2e-test-coverage-overview.md):
   - Change `☑️` to `✅` for any capabilities that now have passing tests
   - Update the **Coverage Summary** table counts
   - Update the **Test Files Status** table
   - Update the **Last updated** date

2. **Follow Commit Workflow:** Always use the commit task at `/home/admin/coding-sessions/_bmad/core/tasks/github-commit-changes.md` for writing commits

3. **Code Comments Policy:** Do NOT write unnecessary comments in the code. Keep the codebase clean and let the code be self-documenting.

4. **CI Monitoring:** After committing, use `gh pr checks` or `gh run list` to verify CI status. If CI fails, fix and commit again. If more than 2 commits are needed to fix CI, squash them.

---

## Stories

### Phase 1: Foundation

#### Story 1.1: Add Data-TestID Attributes to Components ✅

**Status:** ✅ **Complete** — Merged via Lauro's PRs and bidding operations work

**Tasks:**
- [x] Add navigation data-testids
- [x] Add modal data-testids: `wallet-polkadot`, `disconnect-button`, `account-switcher`
- [x] Add bidders page data-testids: `submit-bid-button`, `submit-vouch-button`, `unbid-button`, `unvouch-button`
- [x] Verify all existing tests still pass

---

#### Story 1.2: Implement Custom Cypress Commands ✅

**Status:** ✅ **Complete** — All 6 commands implemented in `cypress/support/commands.ts`

**Commands:** `connectWallet`, `waitForBlockchainData`, `submitTransaction`, `visitExplore`, `verifyAccountLevel`, `verifyToast`

**Tasks:**
- [x] Create/update `cypress/support/commands.ts` with all custom commands
- [x] TypeScript types defined in `cypress/support/index.d.ts`
- [x] Commands work with wallet simulation plugin

---

#### Story 1.3: Set Up Chopsticks Test Configuration ✅

**Status:** ✅ **Complete** — `config/kusama.yml` configured, Chopsticks tasks in `cypress.config.ts`

**Tasks:**
- [x] `config/kusama.yml` with test state at block 21000000
- [x] Alice=Bidder, Bob=Candidate, Dave=Human, Eve=Cyborg
- [x] `resetChopsticks` (new block) and `resetChopsticksToFork` (`dev_setHead`) tasks
- [x] CI workflows start Chopsticks automatically

---

#### Story 1.4: Verify Wallet Plugin Integration ✅

**Status:** ✅ **Complete** — Plugin verified, tx approval retry logic handles race conditions

**Tasks:**
- [x] `@chainsafe/cypress-polkadot-wallet` configured in `cypress/support/e2e.ts`
- [x] Test accounts injected via `cy.initWallet()` + `cypress/fixtures/accounts.json`
- [x] Transaction auto-approval with 5-retry polling (race condition fix)
- [x] Wallet persistence verified across page refresh
- [x] Known issue documented: `{ force: true }` needed on clicks due to React re-renders

---

### Phase 2: Core Flows

#### Story 1.5: Wallet Integration Tests (Suite 1) ✅

**Status:** ✅ **Complete** — PR #222 merged by Lauro

**As a** test engineer,
**I want** actual wallet connection E2E tests with Cypress wallet plugin,
**so that** wallet integration and account level detection is verified before release.

**Acceptance Criteria:**
1. ✅ Test: User connects wallet with test account successfully (using wallet plugin)
2. ✅ Test: User disconnects wallet (functional test)
3. ✅ Test: Wallet persists across page refresh
4. ✅ Test: User level shows correctly for Human accounts (Dave)
5. ✅ Test: User level shows correctly for Bidder accounts (Alice)
6. ✅ Test: User level shows correctly for Candidate accounts (Bob)
7. ✅ Test: User level shows correctly for Cyborg accounts (Eve)

**Tasks:**
- [x] Add wallet plugin integration tests to existing `cypress/e2e/wallet-connection.cy.ts`
- [x] Use @chainsafe/cypress-polkadot-wallet plugin to inject test accounts
- [x] Implement actual wallet connection, disconnect, and persistence tests
- [x] Add account level detection tests for all user types (Dave, Alice, Bob, Eve)

**Test Coverage Updates:**
- Update Wallet & Account section: `View account level`, `Persist wallet on refresh` to ✅
- Update Coverage Summary percentages

---

#### Story 1.6: Navigation Tests ✅ (Suite 2)

**Status:** ✅ **Complete** — `smoke.cy.ts` covers all navigation requirements

**As a** test engineer,
**I want** to finalize navigation E2E tests,
**so that** all routes and navigation is properly documented and ready for production.

**Note:** `smoke.cy.ts` already implements all navigation tests. This story is just cleanup.

**Acceptance Criteria:**
1. ✅ All primary routes load successfully - **DONE in smoke.cy.ts**
2. ✅ All explore section routes load with blockchain data - **DONE in smoke.cy.ts**
3. ✅ All POI pages load correctly - **DONE in smoke.cy.ts**
4. ✅ RPC parameter persists across navigation - **DONE in smoke.cy.ts**
5. Optional: Rename smoke.cy.ts to navigation.cy.ts for clarity

**Tasks:**
- [ ] Optional: Rename `cypress/e2e/smoke.cy.ts` to `cypress/e2e/navigation.cy.ts`
- [ ] Optional: Add data-testids if Story 1.1 complete

**Test Coverage Updates:**
- Navigation & Viewing already shows 100%
- Mark story as complete or low priority

---

#### Story 1.7: Implement Bidding Operations Tests (Suite 3) — 🔄 In Review

**Status:** 🔄 **PR #227 open** — CI green, awaiting team review
**Branch:** `e2e-tests/bidding-operations`
**PR:** https://github.com/KappaSigmaMu/kappasigmamu.github.io/pull/227

**As a** test engineer,
**I want** bidding operations E2E tests,
**so that** bid functionality is verified before release.

**Acceptance Criteria:**
1. ✅ Test: Human places a bid successfully
2. ✅ Test: Bid validation - minimum amount
3. ✅ Test: Bid validation - insufficient balance
4. ✅ Test: Bidder removes their bid (unbid)
5. ✅ Test: Non-bidder cannot unbid
6. ✅ Test: Member vouches for an address
7. ✅ Test: Voucher removes their vouch
8. ✅ All P0 and P1 bidding tests passing (14 tests, 67/67 total)

**Tasks:**
- [x] Create `cypress/e2e/bidding.cy.ts`
- [x] Implement place bid success scenario
- [x] Implement bid validation scenarios (minimum amount, insufficient balance)
- [x] Implement unbid scenarios
- [x] Implement vouch/unvouch scenarios
- [x] Verify account level transitions (Human → Bidder → Human)
- [x] Fix cross-spec state pollution with `resetChopsticksToFork` (`dev_setHead`)
- [x] Add tx approval retry logic (5 attempts) for race condition between app and wallet plugin
- [x] Fix flaky wallet-connection disconnect test (`{ force: true }`)

**Test Coverage Updates:**
- Update Bidding Operations section: all capabilities to ✅
- Update Membership Transitions: `Become bidder`, `Become human` to ✅
- Update Coverage Summary percentages

---

#### Story 1.8: Implement Payouts Tests (Suite 6) — 🔄 Awaiting PR

**Status:** 🔄 **Code complete** — 9 tests passing in `payouts.cy.ts`, branch pushed, awaiting PR creation
**Branch:** `e2e-tests/payouts` (stacked on `e2e-tests/bidding-operations`)

**As a** test engineer,
**I want** payouts E2E tests,
**so that** payout functionality is verified before release.

**Acceptance Criteria:**
1. ✅ Test: View payout list with details
2. ✅ Test: Payout shows maturity countdown
3. ✅ Test: Matured payout shows claim button
4. ✅ Test: Member claims matured payout
5. ✅ Test: Cannot claim unmatured payout
6. ✅ Test: Non-member cannot claim payouts

**Tasks:**
- [x] Create `cypress/e2e/payouts.cy.ts`
- [x] Implement view payout list scenario
- [x] Implement maturity status tests
- [x] Implement claim payout success scenario
- [x] Implement claim restrictions tests

**Test Coverage Updates:**
- Update Payout Operations section: all capabilities to ✅
- Update Coverage Summary percentages

---

### Phase 3: Governance

#### Story 1.9: Implement Candidate Voting Tests (Suite 4) — 🔄 Awaiting PR

**Status:** 🔄 **Code complete** — 11 tests passing in `candidate-voting.cy.ts`, branch pushed, awaiting PR creation
**Branch:** `e2e-tests/candidate-voting` (stacked on `e2e-tests/payouts`)

**As a** test engineer,
**I want** candidate voting E2E tests,
**so that** voting functionality is verified before release.

**Acceptance Criteria:**
1. ✅ Test: View candidate list with details
2. ✅ Test: View candidate details panel
3. ✅ Test: Member approves a candidate
4. ✅ Test: Member rejects a candidate
5. ✅ Test: Non-member cannot vote
6. ⬜ Test: Member cannot vote twice (deferred — requires multi-vote Chopsticks state)
7. ⬜ Test: Drop heavily rejected candidate (deferred — requires roundCount > round+1 state)
8. ✅ Test: Drop button not available when conditions not met

**Tasks:**
- [x] Create `cypress/e2e/candidate-voting.cy.ts`
- [x] Implement view candidates scenarios (Section 4.1)
- [x] Implement vote approve/reject scenarios (Section 4.2)
- [x] Implement drop candidate scenarios (Section 4.3)
- [x] Verify "Voted" badge appears after voting

**Test Coverage Updates:**
- Update Candidate Operations section: all capabilities to ✅
- Update Coverage Summary percentages

---

#### Story 1.10: Implement Member Operations Tests (Suite 5) — 🔄 Awaiting PR

**Status:** 🔄 **Code complete** — 12 tests passing in `members.cy.ts`, branch pushed, awaiting PR creation
**Branch:** `e2e-tests/members` (stacked on `e2e-tests/candidate-voting`)

**As a** test engineer,
**I want** member operations E2E tests,
**so that** member functionality is verified before release.

**Acceptance Criteria:**
1. ✅ Test: View member list with details
2. ✅ Test: Member with high strikes shows warning
3. ✅ Test: View member details panel
4. ✅ Test: Member votes to approve defender
5. ✅ Test: Member votes to reject defender
6. ✅ Test: Non-member cannot vote on defender

**Tasks:**
- [x] Create `cypress/e2e/members.cy.ts`
- [x] Implement view members scenarios (Section 5.1)
- [x] Implement defender voting scenarios (Section 5.2)
- [x] Verify strike warnings display correctly

**Test Coverage Updates:**
- Update Member Operations section: all capabilities to ✅
- Update Coverage Summary percentages

---

#### Story 1.11: Implement Membership Claim Tests (Suite 7) — 🔄 Awaiting PR

**Status:** 🔄 **Code complete** — 5 tests passing in `membership-claim.cy.ts`, branch pushed, awaiting PR creation
**Branch:** `e2e-tests/membership-claim` (stacked on `e2e-tests/members`)

**As a** test engineer,
**I want** membership claim E2E tests,
**so that** the Candidate → Cyborg transition is verified.

**Acceptance Criteria:**
1. ✅ Test: Candidate claims membership during claim period
2. ✅ Test: Candidate cannot claim during voting period
3. ✅ Test: Non-candidate cannot claim
4. ✅ Test: Account level changes to Cyborg after claim

**Tasks:**
- [x] Create `cypress/e2e/membership-claim.cy.ts`
- [x] Configure Chopsticks to simulate claim period (`dev_setHead` via `setChopsticksHead` task)
- [x] Implement claim success scenario (moves Chopsticks head to claim-period block 18230000)
- [x] Implement claim restriction scenarios (voting period, non-candidate, existing member)
- [x] Verify account level transition (Candidate → Cyborg)
- [x] Add `data-test="claim-membership-button"` to `NextStep.tsx`
- [x] Add `Parameters` and `NextHead` to Chopsticks import-storage config
- [x] Fix `app_name` mismatch in `cypress.config.ts`

**Test Coverage Updates:**
- Update Membership Transitions: `Claim membership` to ✅
- Update Coverage Summary percentages

---

### Phase 4: Polish

#### Story 1.12: Implement User Journey Tests (Suite 8) — 🔄 Awaiting PR

**Status:** 🔄 **Code complete** — 6 tests passing in `user-journeys.cy.ts`, branch pushed, awaiting PR creation
**Branch:** `e2e-tests/user-journeys` (stacked on `e2e-tests/membership-claim`)

**As a** test engineer,
**I want** end-to-end user journey tests,
**so that** complete user flows are verified.

**Acceptance Criteria:**
1. ✅ Test: Complete new user journey (Human → Bidder)
2. ✅ Test: Member participation journey (voting on candidates and defenders)
3. ✅ Test: Bidder lifecycle (bid, unbid, rebid)

**Tasks:**
- [x] Create `cypress/e2e/user-journeys.cy.ts`
- [x] Implement new user journey test (Section 8.1)
- [x] Implement member participation journey (Section 8.2)
- [x] Implement bidder lifecycle test (Section 8.3)

**Test Coverage Updates:** Verify all related capabilities show ✅.

---

#### Story 1.13: Implement Error Handling Tests (Suite 9) — 🔄 PR #243

**Status:** 🔄 **Code complete** — 3 tests passing in `error-handling.cy.ts`.

**As a** test engineer,
**I want** error handling E2E tests,
**so that** error scenarios are gracefully handled.

**Acceptance Criteria:**
1. ⬜ Test: Transaction rejected by user (deferred — see below)
2. ⬜ Test: Transaction fails on chain (deferred)
3. ⬜ Test: Network disconnection during transaction (deferred)
4. ✅ Test: Page loads without wallet connected (read-only list + connect prompt)
5. ✅ Test: Refresh during transaction (page stays read-only after reload, no wallet)

**Shipped (3):** bidders read-only without wallet, read-only persists after reload, members list loads without wallet.

**Deferred — error-toast scenarios not deterministically reproducible in the Chopsticks/wallet-plugin harness:** clicking submit-bid with no wallet, and `rejectTx`, did not surface the `tx-error` toast within timeout (no toast rendered at all in screenshots). Likely an app-side gap: `doTx` early-return / `signAndSend().catch` does emit `onStatusChange(error)`, but the error toast did not appear in-harness. Tx-fail-on-chain and live RPC-disconnect have no clean deterministic hook. Flagged for follow-up, not blocking.

**Tasks:**
- [x] Create `cypress/e2e/error-handling.cy.ts`
- [x] Implement UI edge case scenarios (Section 9.2)
- [ ] Transaction failure / network-disconnect scenarios (deferred)

---

#### Story 1.14: Implement Suspended Members Tests (Suite 10) — 🔄 PR #244

**Status:** 🔄 **Code complete** — 2 tests passing in `suspended.cy.ts`.

**As a** test engineer,
**I want** suspended members E2E tests,
**so that** suspension display is verified.

**Acceptance Criteria:**
1. ✅ Test: View suspended members list (Charlie seeded into `Society.SuspendedMembers`)
2. ⬜ Test: Empty suspended list message (deferred — contradicts the seed in a single fork; empty render is pure UI logic)

**Shipped (2):** seeded suspended member renders (badge + address + "Suspended Members (1)" tab), and exactly one suspended badge present.

**Config:** `config/kusama.yml.sample` seeds Charlie (prefix-2 SS58 `FH4N2Y1u…7P`) into `Society.SuspendedMembers` (+ `$removePrefix`). Members map untouched — no impact on member/candidate suites.

**Tasks:**
- [x] Create `cypress/e2e/suspended.cy.ts`
- [x] Implement view suspended list scenario
- [ ] Empty state scenario (deferred)

---

#### Story 1.15: CI/CD Integration

**As a** developer,
**I want** E2E tests integrated into CI/CD pipeline,
**so that** tests run automatically on every PR.

**Acceptance Criteria:**
1. GitHub Actions workflow runs E2E tests
2. Chopsticks starts automatically in CI
3. Tests run headless with proper reporting
4. PR checks show E2E test results
5. Test execution time < 10 minutes

**Tasks:**
- [ ] Create/update GitHub Actions workflow for E2E tests
- [ ] Add Chopsticks startup to CI
- [ ] Configure headless Cypress execution
- [ ] Add test result reporting
- [ ] Optimize test parallelization if needed

**Test Coverage Updates:** Update documentation to reflect CI integration.

---

## Progress Summary

| Phase | Stories | Status |
|-------|---------|--------|
| Foundation (1.1–1.4) | 4/4 | ✅ Complete |
| Core Flows (1.5–1.7) | 3/3 | ✅ Merged (#227 bidding, #228 payouts on main) |
| Governance (1.9–1.11) | 3/3 | ✅ PRs open #239/#240/#241 — all green locally |
| Polish (1.12–1.14) | 3/3 | ✅ user-journeys #242, error-handling #243, suspended #244 — all green locally |
| CI/CD (1.15) | Done | ✅ Per-suite workflows for all 10 specs |

**Stacked-PR chain (rebased on #238 review cleanup):**
`main → #238 → #239 candidate-voting → #240 members → #241 membership-claim → #242 user-journeys → #243 error-handling → #244 suspended`

**New tests this round:** candidate-voting 11, members 12, membership-claim 5, user-journeys 5, error-handling 3, suspended 2 = **38**.

**App fix shipped:** `NextStep.tsx` — `isClaimPeriod` guarded until society consts load (was a NaN-modulo flash; #241).

**Known gap — stacked-PR CI:** workflows trigger only on PRs to `main`; #239–242 target each other, so their CI fires only once each is retargeted/merged to `main`. Merge the stack bottom-up (#238 first) to run each suite's workflow.

**Stabilization notes:** vote/defender/lifecycle tx tests reset to a clean fork per test (avoid cumulative Chopsticks finalization slowdown), wait for the success toast before advancing a block, and act in place rather than reloading (reload drops the injected wallet). membership-claim forks real historical blocks by society phase (voting 18280000, claim 18230000) via a detached-Chopsticks runner.

## Definition of Done (Epic Level)

- [x] Foundation stories (1.1–1.4) complete
- [x] CI/CD pipeline running E2E tests on all PRs (smoke + wallet workflows)
- [x] No flaky tests (retry rate < 5%) — fixed with `{ force: true }` and tx retry logic
- [ ] All 15 stories completed and approved
- [ ] 100% of P0 tests passing
- [ ] 100% of P1 tests passing
- [ ] Test execution time < 10 minutes
- [ ] `e2e-test-coverage-overview.md` shows 80%+ coverage

---

## Priority Matrix Reference

### P0 - Critical (Must Pass for Release)
- Wallet connect/disconnect
- Place bid
- Vote on candidate
- Claim payout
- All pages load

### P1 - High (Should Pass)
- Unbid, Vouch/Unvouch
- Drop candidate
- Defender voting
- Claim membership
- Account level detection

### P2 - Medium (Nice to Have)
- RPC parameter persistence
- Error handling flows
- Suspended members view

---

*Epic created based on [E2E Test Plan](./e2e-test-plan.md)*
