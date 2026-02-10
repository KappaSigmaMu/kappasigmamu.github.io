describe('Wallet Connection UI Flow', () => {
  beforeEach(() => {
    cy.visit('/explore?rpc=ws://localhost:8000', { timeout: 20000 });
    cy.wait(1000);
  });

  it('should display Connect Wallet button', () => {
    cy.contains('button', /connect/i)
      .should('be.visible')
      .and('contain.text', 'Connect Wallet');
  });

  it('should open wallet selection modal when Connect Wallet is clicked', () => {
    cy.contains('button', /connect/i).should('be.visible').click();
    cy.wait(500);

    cy.get('.modal-content').should('be.visible');
    cy.get('.modal-title').should('contain.text', 'Wallets');
    cy.contains('Polkadot').should('be.visible');
  });

  it('should have data-testid attributes on wallet components', () => {
    cy.contains('button', /connect/i).should('be.visible').click();
    cy.wait(500);

    cy.get('[data-testid="wallet-polkadot"]').should('exist');
    cy.get('[data-testid="disconnect-button"]').should('exist');
  });

  it('should close modal when X is clicked', () => {
    cy.contains('button', /connect/i).should('be.visible').click();
    cy.wait(500);

    cy.get('.modal-header').find('[role="button"]').click();
    cy.get('.modal-content').should('not.exist');
  });

  it('should display disconnect option in modal footer', () => {
    cy.contains('button', /connect/i).should('be.visible').click();
    cy.wait(500);

    cy.get('[data-testid="disconnect-button"]')
      .should('be.visible')
      .and('contain.text', 'Disconnect');
  });
});

describe('Wallet Configuration Verification', () => {
  it('should have correct Cypress configuration for blockchain operations', () => {
    cy.wrap(Cypress.config('defaultCommandTimeout')).should('eq', 10000);
    cy.wrap(Cypress.config('requestTimeout')).should('eq', 15000);
    cy.wrap(Cypress.config('responseTimeout')).should('eq', 15000);
  });

  it('should have retry configuration', () => {
    const retries = Cypress.config('retries');
    cy.wrap(retries).should('deep.equal', { runMode: 2, openMode: 0 });
  });
});
