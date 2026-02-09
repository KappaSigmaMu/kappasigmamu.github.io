// Cypress E2E Support File
// This file runs before every test file

import '@chainsafe/cypress-polkadot-wallet';
import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types';

// Prevent Cypress from failing tests on uncaught exceptions from the application
// This is common when testing React apps that may have unhandled promise rejections
Cypress.on('uncaught:exception', (err) => {
  // Log the error for debugging but don't fail the test
  console.log('Uncaught exception:', err.message);
  // Return false to prevent Cypress from failing the test
  return false;
});

// Custom command to connect wallet with a specific account
Cypress.Commands.add('connectWallet', (accountAddress: string) => {
  // Click connect wallet button
  cy.contains('button', /connect/i, { timeout: 15000 }).should('be.visible').click();

  // Wait for modal to render
  cy.wait(1000);

  // Click Polkadot.js wallet option using data-testid
  cy.get('[data-testid="wallet-polkadot"]', { timeout: 10000 }).should('be.visible').click();

  // Wait longer for wallet connection to complete and accounts to load
  cy.wait(5000);

  // Find and click the account by full address in the modal body
  cy.get('.modal-body').contains(accountAddress, { timeout: 10000 }).should('be.visible').click();

  // Wait for modal to close
  cy.wait(1000);

  // Wait for account to be displayed in navbar
  cy.contains(/5[A-Za-z0-9]{4}…[A-Za-z0-9]{4}/, { timeout: 15000 }).should('be.visible');
});

// TypeScript declaration for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      connectWallet(accountAddress: string): Chainable<void>;
    }
  }
}
