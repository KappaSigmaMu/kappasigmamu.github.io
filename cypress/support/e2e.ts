import '@chainsafe/cypress-polkadot-wallet';
import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types';

Cypress.on('uncaught:exception', (err) => {
  console.log('Uncaught exception:', err.message);
  return false;
});

Cypress.Commands.add('connectWallet', (accountAddress: string) => {
  cy.contains('button', /connect/i).should('be.visible').click();
  cy.wait(500);
  cy.get('[data-testid="wallet-polkadot"]').should('be.visible').click();
  cy.wait(2000);
  cy.get('.modal-body').contains(accountAddress).should('be.visible').click();
  cy.wait(500);
  cy.contains(/5[A-Za-z0-9]{4}…[A-Za-z0-9]{4}/).should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      connectWallet(accountAddress: string): Chainable<void>;
    }
  }
}
