import { defineConfig } from 'cypress';

const CHOPSTICKS_RPC = 'http://localhost:8000';
const CHOPSTICKS_FORK_BLOCK = Number(process.env.KUSAMA_BLOCK_NUMBER) || 21000000;

async function chopsticksRpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(CHOPSTICKS_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const payload = await response.json();

  if (payload.error) {
    throw new Error(payload.error.message);
  }

  return payload.result as T;
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        async resetChopsticks() {
          try {
            await chopsticksRpc('dev_newBlock');
          } catch (e) {
            console.log('Chopsticks reset skipped:', (e as Error).message);
          }
          return null;
        },
        async resetChopsticksToFork() {
          try {
            const forkBlockHash = await chopsticksRpc<string>('chain_getBlockHash', [CHOPSTICKS_FORK_BLOCK]);
            await chopsticksRpc('dev_setHead', [forkBlockHash]);
          } catch (e) {
            console.log('Chopsticks fork reset skipped:', (e as Error).message);
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
      runMode: 1,
      openMode: 0,
    },

    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,

    env: {
      chopsticks_url: 'ws://localhost:8000',
      app_name: '[TEST] Kusama Society',
    },
  },
});
