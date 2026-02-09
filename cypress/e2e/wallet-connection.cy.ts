
describe('Wallet Connection UI Flow', () => {
  beforeEach(() => {
    cy.visit('/explore?rpc=ws://localhost:8000', { timeout: 30000 });
    cy.wait(2000);
  });

  it('should display Connect Wallet button', () => {
    cy.contains('button', /connect/i, { timeout: 15000 })
      .should('be.visible')
      .and('contain.text', 'Connect Wallet');
  });

  it('should open wallet selection modal when Connect Wallet is clicked', () => {
    cy.contains('button', /connect/i, { timeout: 15000 }).should('be.visible').click();

    cy.wait(1000);

    cy.get('.modal-content').should('be.visible');
    cy.get('.modal-title').should('contain.text', 'Wallets');

    // Verify wallet options are displayed
    cy.contains('Polkadot').should('be.visible');
  });

  it('should have data-testid attributes on wallet components', () => {
    // Open wallet modal
    cy.contains('button', /connect/i, { timeout: 15000 }).should('be.visible').click();
    cy.wait(1000);

    cy.get('[data-testid="wallet-polkadot"]').should('exist');
    cy.get('[data-testid="disconnect-button"]').should('exist');
  });

  it('should close modal when X is clicked', () => {
    // Open wallet modal
    cy.contains('button', /connect/i, { timeout: 15000 }).should('be.visible').click();
    cy.wait(1000);

    // Click X to close
    cy.get('.modal-header').find('[role="button"]').click();

    // Modal should be closed
    cy.get('.modal-content').should('not.exist');
  });

  it('should display disconnect option in modal footer', () => {
    // Open wallet modal
    cy.contains('button', /connect/i, { timeout: 15000 }).should('be.visible').click();
    cy.wait(1000);

    cy.get('[data-testid="disconnect-button"]')
      .should('be.visible')
      .and('contain.text', 'Disconnect');
  });
});

describe('Wallet Configuration Verification', () => {
  it('should have correct Cypress configuration for blockchain operations', () => {
    // These values are checked via cypress.config.ts
    cy.wrap(Cypress.config('defaultCommandTimeout')).should('eq', 15000);
    cy.wrap(Cypress.config('requestTimeout')).should('eq', 20000);
    cy.wrap(Cypress.config('responseTimeout')).should('eq', 20000);
  });

  it('should have retry configuration', () => {
    const retries = Cypress.config('retries');
    cy.wrap(retries).should('deep.equal', { runMode: 2, openMode: 0 });
  });
});
