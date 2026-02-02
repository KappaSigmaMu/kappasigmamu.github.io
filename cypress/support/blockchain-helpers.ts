/**
 * Blockchain Test Helpers
 * Utilities for interacting with Chopsticks blockchain fork
 *
 * NOTE: These are helper functions that wrap Cypress commands.
 * They should only be used within Cypress test files where `cy` is available.
 */

/// <reference types="cypress" />

/**
 * Connect to Chopsticks WebSocket endpoint
 */
export function connectToChopsticks(wsUrl: string = 'ws://localhost:8000') {
  // API connection will be handled by the application
  // This helper is for future direct blockchain interaction tests
  return Cypress.cy.wrap(wsUrl);
}

/**
 * Advance blockchain by N blocks
 * Useful for testing time-dependent Society mechanisms
 */
export function produceBlocks(count: number) {
  // TODO: Implement block production via Chopsticks RPC
  // Will use cy.request() to call Chopsticks dev_newBlock endpoint
  Cypress.cy.log(`Producing ${count} blocks (placeholder - to be implemented)`);
  return Cypress.cy.wrap(null);
}

/**
 * Submit extrinsic to Chopsticks and wait for inclusion
 */
export function submitExtrinsic(section: string, method: string, args: any[]) {
  // TODO: Implement extrinsic submission
  // Will integrate with @polkadot/api in browser context
  Cypress.cy.log(`Submitting ${section}.${method} (placeholder - to be implemented)`);
  return Cypress.cy.wrap(null);
}

/**
 * Watch for specific blockchain events
 */
export function watchForEvent(section: string, method: string, timeout: number = 30000) {
  // TODO: Implement event watching
  // Will poll or subscribe to events via application's API connection
  Cypress.cy.log(`Watching for ${section}.${method} event (placeholder - to be implemented)`, { timeout });
  return Cypress.cy.wrap(null);
}

/**
 * Query blockchain storage
 */
export function queryStorage(module: string, storage: string, args?: any[]) {
  // TODO: Implement storage queries
  Cypress.cy.log(`Querying ${module}.${storage} (placeholder - to be implemented)`);
  return Cypress.cy.wrap(null);
}

/**
 * Reset blockchain state to initial snapshot
 */
export function resetBlockchain() {
  // TODO: Implement state reset
  // May require Chopsticks restart or state revert endpoint
  Cypress.cy.log('Resetting blockchain state (placeholder - to be implemented)');
  return Cypress.cy.wrap(null);
}
