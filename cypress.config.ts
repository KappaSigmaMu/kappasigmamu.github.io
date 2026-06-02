import { defineConfig } from 'cypress';
import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

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
        async restartChopsticksAtBlock(blockNumber: number) {
          try {
            execSync("pkill -f 'chopsticks.*kusama' || true", { stdio: 'ignore' });
            await new Promise(r => setTimeout(r, 1000));

            const configPath = resolve('config/kusama.yml');
            const config = readFileSync(configPath, 'utf8');
            const tmpConfig = resolve('config/kusama-tmp.yml');
            writeFileSync(tmpConfig, config.replace(/^block:\s*.+$/m, `block: ${blockNumber}`));

            execSync('rm -f db.sqlite db.sqlite-shm db.sqlite-wal', { stdio: 'ignore' });

            const child = spawn('npx', ['@acala-network/chopsticks@1.0.6', `--config=${tmpConfig}`], {
              detached: true,
              stdio: 'ignore',
            });
            child.unref();

            for (let i = 0; i < 60; i++) {
              try {
                const res = await fetch('http://localhost:8000', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'chain_getHeader', params: [] }),
                });
                const data = await res.json();
                if (data.result) return null;
              } catch { /* not ready yet */ }
              await new Promise(r => setTimeout(r, 2000));
            }
            throw new Error('Chopsticks failed to start at block ' + blockNumber);
          } catch (e) {
            console.log('Chopsticks restart failed:', (e as Error).message);
            throw e;
          }
        },
        async resetChopsticksToFork() {
          try {
            const hashRes = await fetch('http://localhost:8000', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'chain_getBlockHash',
                params: [21000000],
              }),
            });
            const { result: blockHash } = await hashRes.json();
            const setRes = await fetch('http://localhost:8000', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 2,
                method: 'dev_setHead',
                params: [blockHash],
              }),
            });
            await setRes.json();
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
      runMode: 0,
      openMode: 0,
    },

    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,

    env: {
      chopsticks_url: 'ws://localhost:8000',
      app_name: 'Kusama Society',
    },
  },
});
