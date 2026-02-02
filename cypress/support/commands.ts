// Custom Cypress commands for Kappa Sigma Mu dApp testing

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Assert that blockchain connection is active
       */
      assertBlockchainConnected(): Chainable<void>;

      /**
       * Assert that a member exists in the Society
       */
      assertMemberExists(address: string): Chainable<void>;

      /**
       * Assert that a candidate exists
       */
      assertCandidateExists(address: string): Chainable<void>;

      /**
       * Wait for blockchain state update
       */
      waitForBlockchainUpdate(timeout?: number): Chainable<void>;
    }
  }
}

/**
 * Assert blockchain connection is established
 */
Cypress.Commands.add('assertBlockchainConnected', () => {
  // TODO: Implement connection check based on actual UI indicators
  cy.log('Asserting blockchain connection (placeholder - to be implemented)');
});

/**
 * Assert member exists in Society
 */
Cypress.Commands.add('assertMemberExists', (address: string) => {
  // TODO: Implement based on actual member list UI
  cy.log(`Asserting member exists: ${address} (placeholder - to be implemented)`);
});

/**
 * Assert candidate exists
 */
Cypress.Commands.add('assertCandidateExists', (address: string) => {
  // TODO: Implement based on actual candidate list UI
  cy.log(`Asserting candidate exists: ${address} (placeholder - to be implemented)`);
});

/**
 * Wait for blockchain state update
 */
Cypress.Commands.add('waitForBlockchainUpdate', (timeout = 10000) => {
  // Wait for blockchain state propagation
  cy.wait(timeout);
});

// Prevent TypeScript from treating this as a module
export {};
