/**
 * E2E Test Suite: Navigation
 * Story: 3.3 - Critical Flow E2E Test Suite
 * AC1: Navigation test — all main routes load without errors
 *
 * Tests all primary application routes to ensure they load correctly
 * and navigation between routes works as expected.
 */

describe('Navigation: Main Routes', () => {
  beforeEach(() => {
    // Start each test from homepage
    cy.visit('/');
  });

  it('should load homepage (/) without errors', () => {
    // Verify homepage loads
    cy.url().should('include', '/ksm-app');

    // Verify page content is visible
    cy.get('body').should('be.visible');

    // Verify no 404 or error messages
    cy.get('body').should('not.contain', '404');
    cy.get('body').should('not.contain', 'Not Found');
  });

  it('should load /explore route without errors', () => {
    // Navigate to explore
    cy.visit('/ksm-app/explore');

    // Verify URL
    cy.url().should('include', '/explore');

    // Verify page loaded successfully
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', '404');
  });

  it('should load /explore/members route without errors', () => {
    // Navigate to members page
    cy.visit('/ksm-app/explore/members');

    // Verify URL
    cy.url().should('include', '/explore/members');

    // Verify page loaded successfully
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', '404');
  });

  it('should load /explore/candidates route without errors', () => {
    // Navigate to candidates page
    cy.visit('/ksm-app/explore/candidates');

    // Verify URL
    cy.url().should('include', '/explore/candidates');

    // Verify page loaded successfully
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', '404');
  });

  it('should load /explore/bidders route without errors', () => {
    // Navigate to bidders page
    cy.visit('/ksm-app/explore/bidders');

    // Verify URL
    cy.url().should('include', '/explore/bidders');

    // Verify page loaded successfully
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', '404');
  });

  it('should load /explore/payouts route without errors', () => {
    // Navigate to payouts page
    cy.visit('/ksm-app/explore/payouts');

    // Verify URL
    cy.url().should('include', '/explore/payouts');

    // Verify page loaded successfully
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', '404');
  });

  it('should load /explore/poi route without errors', () => {
    // Navigate to POI gallery page
    cy.visit('/ksm-app/explore/poi');

    // Verify URL
    cy.url().should('include', '/explore/poi');

    // Verify page loaded successfully
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', '404');
  });
});

describe('Navigation: Route Status Verification', () => {
  const routes = [
    '/ksm-app',
    '/ksm-app/explore',
    '/ksm-app/explore/members',
    '/ksm-app/explore/candidates',
    '/ksm-app/explore/bidders',
    '/ksm-app/explore/payouts',
    '/ksm-app/explore/poi'
  ];

  routes.forEach((route) => {
    it(`should return 200 status for ${route}`, () => {
      // Visit route and verify successful load
      cy.visit(route, {
        failOnStatusCode: true // This will fail the test if status is not 2xx
      });

      // Additional verification that page rendered
      cy.get('body').should('exist');
    });
  });
});

describe('Navigation: Link Navigation Between Routes', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate from homepage to Members via navigation link', () => {
    // Click Members link (adjust selector based on actual UI)
    cy.contains('Members', { matchCase: false }).click();

    // Verify navigation succeeded
    cy.url().should('include', '/members');
    cy.get('body').should('be.visible');
  });

  it('should navigate from homepage to Explore via navigation link', () => {
    // Click Explore link
    cy.contains('Explore', { matchCase: false }).click();

    // Verify navigation succeeded
    cy.url().should('include', '/explore');
    cy.get('body').should('be.visible');
  });

  it('should navigate to Candidates from Explore section', () => {
    // First navigate to explore
    cy.visit('/ksm-app/explore');

    // Then navigate to Candidates
    cy.contains('Candidates', { matchCase: false }).click();

    // Verify navigation succeeded
    cy.url().should('include', '/candidates');
  });

  it('should navigate to Bidders from Explore section', () => {
    // First navigate to explore
    cy.visit('/ksm-app/explore');

    // Then navigate to Bidders
    cy.contains('Bidders', { matchCase: false }).click();

    // Verify navigation succeeded
    cy.url().should('include', '/bidders');
  });

  it('should navigate to Payouts from Explore section', () => {
    // First navigate to explore
    cy.visit('/ksm-app/explore');

    // Then navigate to Payouts
    cy.contains('Payouts', { matchCase: false }).click();

    // Verify navigation succeeded
    cy.url().should('include', '/payouts');
  });

  it('should navigate to POI Gallery from Explore section', () => {
    // First navigate to explore
    cy.visit('/ksm-app/explore');

    // Then navigate to POI gallery
    cy.contains('Proof of Ink', { matchCase: false }).click();

    // Verify navigation succeeded
    cy.url().should('include', '/poi');
  });

  it('should navigate back to homepage from any route', () => {
    // Navigate to a deep route
    cy.visit('/ksm-app/explore/members');

    // Click home/logo to navigate back
    cy.get('a[href*="/ksm-app"]').first().click();

    // Verify navigation succeeded
    cy.url().should('match', /\/ksm-app\/?$/);
  });
});
