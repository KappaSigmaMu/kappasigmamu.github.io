/**
 * Wallet Mock Utility
 * Extends @chainsafe/cypress-polkadot-wallet with project-specific helpers
 *
 * NOTE: These are helper functions that wrap Cypress commands.
 * They should only be used within Cypress test files where `cy` is available.
 */

/// <reference types="cypress" />

export interface TestAccount {
  address: string;
  name: string;
  type: 'sr25519' | 'ed25519' | 'ecdsa';
}

/**
 * Initialize mock Polkadot wallet with test accounts
 * Uses @chainsafe/cypress-polkadot-wallet under the hood
 */
export function initMockWallet(accounts: TestAccount[]) {
  return Cypress.cy.initWallet(accounts, 'Kappa-Sigma-Mu', 'polkadot-wallet');
}

/**
 * Connect wallet to the application
 * Simulates user clicking "Connect Wallet" and approving
 */
export function connectWallet() {
  // Navigate to the app
  Cypress.cy.visit('/');

  // Wait for page to load
  Cypress.cy.get('body').should('be.visible');

  // TODO: Add actual connect wallet interaction once UI is identified
  // This will be refined based on actual wallet connection flow
}

/**
 * Sign transaction with mock wallet
 */
export function signTransaction() {
  // TODO: Implement transaction signing simulation
  // This will be refined in Story 3.3 when implementing transaction tests
}
