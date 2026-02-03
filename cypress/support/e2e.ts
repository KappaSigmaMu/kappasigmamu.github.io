// Cypress E2E Support File
// This file runs before every test file

// Prevent Cypress from failing tests on uncaught exceptions from the application
// This is common when testing React apps that may have unhandled promise rejections
Cypress.on('uncaught:exception', (err) => {
  // Log the error for debugging but don't fail the test
  console.log('Uncaught exception:', err.message);
  // Return false to prevent Cypress from failing the test
  return false;
});
