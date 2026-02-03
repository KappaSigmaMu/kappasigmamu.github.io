/**
 * Smoke Tests - Basic Application Health Checks
 *
 * Verifies the application loads without crashing.
 */

describe('Application Smoke Tests', () => {
  it('should load home page', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('should load explore page', () => {
    cy.visit('/explore', { timeout: 15000 });
    cy.get('body').should('be.visible');
  });

  it('should load members page', () => {
    cy.visit('/explore/members', { timeout: 15000 });
    cy.get('body').should('be.visible');
  });
});
