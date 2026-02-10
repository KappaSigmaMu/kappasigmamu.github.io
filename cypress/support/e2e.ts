import '@chainsafe/cypress-polkadot-wallet';
import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types';

Cypress.on('uncaught:exception', (err) => {
  console.log('Uncaught exception:', err.message);
  return false;
});

Cypress.Commands.add('connectWallet', (accountAddress: string) => {
  cy.contains('button', /connect/i, { timeout: 15000 }).should('be.visible').click();
  cy.wait(1000);
  cy.get('[data-testid="wallet-polkadot"]', { timeout: 10000 }).should('be.visible').click();
  cy.wait(5000);
  cy.get('.modal-body').contains(accountAddress, { timeout: 10000 }).should('be.visible').click();
  cy.wait(1000);
  cy.contains(/5[A-Za-z0-9]{4}…[A-Za-z0-9]{4}/, { timeout: 15000 }).should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      connectWallet(accountAddress: string): Chainable<void>;
    }
  }
}
