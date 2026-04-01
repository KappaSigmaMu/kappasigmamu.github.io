import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        async resetChopsticks() {
          try {
            const response = await fetch('http://localhost:8000', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'dev_newBlock',
                params: [],
              }),
            });
            await response.json();
          } catch (e) {
            console.log('Chopsticks reset skipped:', (e as Error).message);
          }
          return null;
        },
      });
      return config;
    },
    specPattern: 'cypress/e2e/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',

    viewportWidth: 1280,
    viewportHeight: 720,

    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',

    retries: {
      runMode: 2,
      openMode: 0,
    },

    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,

    env: {
      chopsticks_url: 'ws://localhost:8000',
    },
  },
});
