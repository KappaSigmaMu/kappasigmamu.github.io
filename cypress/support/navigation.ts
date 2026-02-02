/**
 * Navigation Helper Utilities
 * Common navigation patterns and route assertions
 *
 * NOTE: These are helper functions that wrap Cypress commands.
 * They should only be used within Cypress test files where `cy` is available.
 */

/// <reference types="cypress" />

export const routes = {
  home: '/ksm-app',
  members: '/ksm-app/members',
  explore: '/ksm-app/explore',
  candidates: '/ksm-app/candidates',
  bids: '/ksm-app/bids',
  defender: '/ksm-app/defender',
  payouts: '/ksm-app/payouts',
};

/**
 * Navigate to a specific route
 */
export function navigateTo(route: keyof typeof routes) {
  return Cypress.cy.visit(routes[route]);
}

/**
 * Assert current route matches expected
 */
export function assertRoute(route: keyof typeof routes) {
  return Cypress.cy.url().should('include', routes[route]);
}

/**
 * Navigate using menu/navigation links
 */
export function clickNavLink(linkText: string) {
  return Cypress.cy.contains(linkText, { matchCase: false }).click();
}

/**
 * Wait for route transition to complete
 */
export function waitForRouteChange() {
  // Wait for React Router to complete transition
  return Cypress.cy.wait(500);
}
