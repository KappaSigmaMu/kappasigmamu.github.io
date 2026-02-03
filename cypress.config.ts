import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // setupNodeEvents can be used for custom plugins in the future
      return config;
    },
    specPattern: 'cypress/e2e/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',

    // Viewport configuration for responsive testing
    viewportWidth: 1280,
    viewportHeight: 720,

    // Video and screenshot settings
    video: true,
    videoCompression: 32,
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',

    // Retry logic for flaky test mitigation
    retries: {
      runMode: 2,      // Retry failed tests 2 times in CI
      openMode: 0,     // No retries in interactive mode
    },

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Environment variables
    env: {
      chopsticks_url: 'ws://localhost:8000',
    },
  },
});
