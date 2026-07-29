import { defineConfig } from 'cypress';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const yaml = require('js-yaml');

const CHOPSTICKS_RPC = 'http://localhost:8000';
const FAILED_TESTS_CACHE = path.join(__dirname, 'cypress/.cache/failed-tests.json');
const PENDING_EXTRINSIC_TIMEOUT = 30000;
const PENDING_EXTRINSIC_POLL_INTERVAL = 100;

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

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForPendingExtrinsics(): Promise<string[]> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < PENDING_EXTRINSIC_TIMEOUT) {
    const pending = await chopsticksRpc<string[]>('author_pendingExtrinsics');
    if (pending.length > 0) return pending;
    await delay(PENDING_EXTRINSIC_POLL_INTERVAL);
  }

  throw new Error(`No pending Chopsticks extrinsic appeared within ${PENDING_EXTRINSIC_TIMEOUT}ms`);
}

async function clearPendingExtrinsics(): Promise<void> {
  const pending = await chopsticksRpc<string[]>('author_pendingExtrinsics');
  if (pending.length === 0) return;

  await chopsticksRpc('author_removeExtrinsic', [pending]);
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
        async includePendingTransaction() {
          const queueStartedAt = Date.now();
          const pending = await waitForPendingExtrinsics();
          const queuedAfter = Date.now() - queueStartedAt;
          const blockStartedAt = Date.now();
          await chopsticksRpc('dev_newBlock');
          const blockDuration = Date.now() - blockStartedAt;
          console.log(
            `Chopsticks included ${pending.length} pending transaction(s): queue ${queuedAfter}ms, block ${blockDuration}ms`
          );
          return null;
        },
        async resetChopsticksStorage() {
          await clearPendingExtrinsics();
          await chopsticksRpc('dev_setStorage', [loadImportStorage()]);
          return null;
        },
        async clearChopsticksIndices() {
          await chopsticksRpc('dev_setStorage', [{ Indices: { $removePrefix: ['Accounts'] } }]);
          return null;
        },
      });

      on('after:run', (results) => {
        const failed = results.runs.flatMap((run) =>
          run.tests
            .filter((test) => test.state === 'failed')
            .map((test) => ({
              spec: run.spec.relative,
              title: test.title.join(' '),
            }))
        );

        mkdirSync(path.dirname(FAILED_TESTS_CACHE), { recursive: true });
        writeFileSync(FAILED_TESTS_CACHE, JSON.stringify(failed, null, 2));
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
