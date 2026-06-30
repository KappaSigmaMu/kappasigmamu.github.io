import { defineConfig } from 'cypress';
import { readFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const yaml = require('js-yaml');

const CHOPSTICKS_RPC = 'http://localhost:8000';

let forkBlockHash: string | null = null;

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

function loadImportStorage() {
  const config = yaml.load(readFileSync('config/kusama.yml', 'utf8')) as Record<string, unknown>;
  return config['import-storage'];
}

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { plugin: cypressGrepPlugin } = require('@cypress/grep/plugin')
      cypressGrepPlugin(config)

      on('task', {
        async rememberForkPoint() {
          try {
            forkBlockHash = await chopsticksRpc<string>('chain_getBlockHash');
          } catch (e) {
            console.log('Chopsticks fork point capture skipped:', (e as Error).message);
          }
          return null;
        },
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
            const hash =
              forkBlockHash ??
              (process.env.KUSAMA_BLOCK_NUMBER
                ? await chopsticksRpc<string>('chain_getBlockHash', [Number(process.env.KUSAMA_BLOCK_NUMBER)])
                : null);
            if (hash) await chopsticksRpc('dev_setHead', [hash]);
          } catch (e) {
            console.log('Chopsticks fork reset skipped:', (e as Error).message);
          }
          return null;
        },
        async resetChopsticksStorage() {
          await chopsticksRpc('dev_setStorage', [loadImportStorage()]);
          forkBlockHash = await chopsticksRpc<string>('chain_getBlockHash');
          return null;
        },
        async setChopsticksHead(blockNumber: number) {
          await chopsticksRpc('dev_setHead', [blockNumber]);
          await chopsticksRpc('dev_setStorage', [loadImportStorage()]);
          forkBlockHash = await chopsticksRpc<string>('chain_getBlockHash');
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

    expose: {
      chopsticks_url: 'ws://localhost:8000',
      app_name: '[TEST] Kusama Society',
    },
  },
});
