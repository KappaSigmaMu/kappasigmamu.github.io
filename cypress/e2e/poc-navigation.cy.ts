/**
 * POC E2E Test - Homepage Load and Navigation
 * Story: Epic 3.1 - Framework Evaluation
 *
 * Purpose: Verify Cypress + @chainsafe/cypress-polkadot-wallet works correctly
 * Tests basic navigation to confirm framework is operational before building full suite
 */

describe('POC: Homepage and Navigation', () => {
  it('should load the homepage without errors', () => {
    // Visit the base URL (homepage)
    cy.visit('/');

    // Verify page loaded successfully
    cy.url().should('include', '/ksm-app');

    // Basic smoke test - page should not have critical errors
    cy.get('body').should('be.visible');
  });

  it('should navigate to Members page', () => {
    // Visit homepage
    cy.visit('/');

    // Navigate to Members page (adjust selector based on actual navigation structure)
    // This is a basic test - will be refined in Story 3.3
    cy.contains('Members', { matchCase: false }).click();

    // Verify navigation succeeded
    cy.url().should('include', '/members');
  });

  it('should navigate to Explore section', () => {
    // Visit homepage
    cy.visit('/');

    // Navigate to Explore (adjust selector based on actual navigation)
    cy.contains('Explore', { matchCase: false }).click();

    // Verify navigation succeeded
    cy.url().should('include', '/explore');
  });
});

describe('POC: Polkadot Wallet Plugin Integration', () => {
  it('should initialize mock wallet successfully', () => {
    // Test that the @chainsafe/cypress-polkadot-wallet plugin is working
    // Initialize wallet with test account (Alice)
    cy.initWallet(
      [
        {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Alice
          name: 'Alice',
          type: 'sr25519'
        }
      ],
      'Kappa-Sigma-Mu',
      'polkadot-wallet'
    );

    // Visit the app (wallet should be injected)
    cy.visit('/');

    // This confirms the plugin is loaded and functional
    // Full wallet interaction tests will be in Story 3.3
    cy.get('body').should('be.visible');
  });
});
